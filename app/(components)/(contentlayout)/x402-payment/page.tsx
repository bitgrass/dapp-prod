"use client";

import React, { useState, useEffect } from 'react';
import { useConnectedAddress } from '../useConnectedAddress';
import { ethers } from 'ethers';
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { base } from 'thirdweb/chains';
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useWallets } from '@privy-io/react-auth';

const X402Payment = () => {
  const { address, client, clientReady } = useConnectedAddress();
  const { wallets } = useWallets();
  const [amount, setAmount] = useState('0.01');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [hasPaid, setHasPaid] = useState(false); // Track if user has paid

  // Fetch USDC balance ONLY after payment
  const fetchBalance = async () => {
    if (!address || !hasPaid) return;
    
    setIsLoadingBalance(true);
    try {
      const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      // Use JSON-RPC provider for reading (works on mobile)
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      
      const usdcContract = new ethers.Contract(
        usdcAddress,
        ['function balanceOf(address account) view returns (uint256)'],
        provider
      );
      
      const balance = await usdcContract.balanceOf(address);
      setUsdcBalance(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
      setUsdcBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (hasPaid) {
      fetchBalance();
    }
  }, [hasPaid, address, client]);

  const handleBuyUSDC = async () => {
    if (!address || !client || !clientReady) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('💳 Initiating x402 payment...');
      setTxHash('');

      // Create thirdweb client
      const thirdwebClient = createThirdwebClient({
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!
      });

      // Get the active Privy wallet
      const activeWallet = wallets.find(w => w.address?.toLowerCase() === address.toLowerCase());
      if (!activeWallet) {
        throw new Error('No active wallet found');
      }

      console.log('Active wallet type:', activeWallet.walletClientType);

      // Determine the wallet ID based on the wallet type
      let walletId = 'io.metamask'; // default
      
      if (activeWallet.walletClientType === 'coinbase_wallet') {
        walletId = 'com.coinbase.wallet';
      } else if (activeWallet.walletClientType === 'metamask') {
        walletId = 'io.metamask';
      } else if (activeWallet.walletClientType === 'walletconnect') {
        walletId = 'walletConnect';
      } else if (activeWallet.walletClientType === 'privy') {
        // For embedded Privy wallet, use inAppWallet
        walletId = 'inApp';
      }

      console.log('Using wallet ID:', walletId);

      // Create a thirdweb wallet
      const wallet = createWallet(walletId);
      
      // Connect the wallet
      await wallet.connect({
        client: thirdwebClient,
        chain: base,
      });

      console.log('✅ Thirdweb wallet connected:', await wallet.getAccount());

      // Wrap fetch with x402 payment handling
      // Max 0.01 USDC = 10,000 (6 decimals)
      const fetchWithPay = wrapFetchWithPayment(
        fetch,
        thirdwebClient,
        wallet,
        BigInt(10000) // max 0.01 USDC
      );

      setStatus('💰 Processing payment...');

      // Make the request - thirdweb x402 handles everything automatically
      const response = await fetchWithPay('/api/x402/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: address,
          amount: '10000' // 0.01 USDC
        })
      });

      console.log('Server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        setStatus('✅ Payment successful! Fetching your USDC balance...');
        setTxHash(result.data?.txHash || 'pending');
        console.log('✅ Purchase result:', result);
        
        // Unlock balance viewing
        setHasPaid(true);
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      
      // If payment was confirmed on-chain but server verification failed, still unlock
      if (txHash) {
        console.log('⚠️ Payment confirmed on-chain, unlocking despite server error');
        setStatus('✅ Payment confirmed on-chain! (Server verification skipped)');
        setHasPaid(true);
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Pageheader 
        currentpage="X402 Payment" 
        activepage="Utilities" 
        mainpage="X402 Payment" 
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-6 col-span-12">
          <div className="box">
            <div className="box-header">
              <h5 className="box-title">View Your USDC Balance</h5>
              <p className="text-sm text-gray-500 mt-1">Pay 0.01 USDC to unlock balance viewing</p>
            </div>
            <div className="box-body">
              <div className="space-y-4">
                {/* Wallet Status */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Connected Wallet:</p>
                  <p className="text-sm font-mono">
                    {address ? address : 'Not connected'}
                  </p>
                </div>

                {/* USDC Balance - Only shown after payment */}
                {hasPaid && (
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border-2 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        🔓 Your USDC Balance:
                      </p>
                      <button
                        onClick={fetchBalance}
                        className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        disabled={isLoadingBalance}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {isLoadingBalance ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `${parseFloat(usdcBalance).toFixed(2)} USDC`
                      )}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      ✅ Access granted via X402 payment
                    </p>
                  </div>
                )}

                {/* Locked Balance Display */}
                {!hasPaid && address && (
                  <div className="p-6 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-300/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Balance Locked
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Pay 0.01 USDC to unlock
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold mb-2 opacity-30">Your USDC Balance:</p>
                    <p className="text-3xl font-bold opacity-30">••••• USDC</p>
                  </div>
                )}

                {/* Pay to Unlock Button */}
                {!hasPaid && (
                  <button
                    onClick={handleBuyUSDC}
                    disabled={!address || !clientReady || isProcessing}
                    className="ti-btn ti-btn-primary w-full text-lg py-3"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        🔓 Pay 0.01 USDC to View Balance
                      </>
                    )}
                  </button>
                )}

                {/* Already Paid Message */}
                {hasPaid && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-green-800 dark:text-green-200 font-semibold">
                      ✅ Access Granted!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      You can now view your USDC balance
                    </p>
                  </div>
                )}

                {/* Status */}
                {status && (
                  <div className={`p-4 rounded-lg ${
                    status.includes('❌') ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                    status.includes('✅') ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                  }`}>
                    <p className="text-sm font-mono">{status}</p>
                  </div>
                )}

                {/* Transaction Hash */}
                {txHash && (
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Transaction Hash:</p>
                    <a
                      href={`https://basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-blue-600 hover:text-blue-800 break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="xl:col-span-6 col-span-12">
          <div className="box">
            <div className="box-header">
              <h5 className="box-title">About This Service</h5>
            </div>
            <div className="box-body">
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold mb-2">💰 USDC Balance Viewer</h6>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is a premium service that allows you to view your USDC balance on Base Mainnet. 
                    Pay 0.01 USDC once with X402 protocol to unlock access.
                  </p>
                </div>

                <div>
                  <h6 className="font-semibold mb-2">🔐 What is X402?</h6>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    X402 is a payment protocol that enables seamless on-chain payments for API access and services. 
                    It's like HTTP 402 (Payment Required) but for blockchain.
                  </p>
                </div>

                <div>
                  <h6 className="font-semibold mb-2">📋 How it works:</h6>
                  <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Connect your wallet</li>
                    <li>Click "Pay 0.01 USDC to View Balance"</li>
                    <li>Approve the USDC transfer (0.01 USDC)</li>
                    <li>Sign the payment proof message</li>
                    <li>Your balance is unlocked instantly!</li>
                  </ol>
                </div>

                <div>
                  <h6 className="font-semibold mb-2">💳 Payment Details:</h6>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Network: Base Mainnet</li>
                    <li>• Token: USDC (0x833589...)</li>
                    <li>• Cost: 0.01 USDC (one-time)</li>
                    <li>• Protocol: X402 v1</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Why pay?</strong> This demonstrates how X402 enables micropayments for API services. 
                    In production, this could be used for premium data, analytics, or exclusive features.
                  </p>
                </div>

                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Make sure you have at least 0.01 USDC in your wallet on Base Mainnet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default X402Payment;
