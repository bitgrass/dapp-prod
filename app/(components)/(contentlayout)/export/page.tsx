"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createThirdwebClient } from "thirdweb";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { LinkdropSDK } from 'linkdrop-sdk';
import { ethers } from 'ethers';

const PasskeyProtection = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Change this to your desired passkey
    const CORRECT_PASSKEY = 'bitgrass2024';

    useEffect(() => {
        // Check if user is already authenticated in this session
        const authenticated = sessionStorage.getItem('leaderboard_authenticated');
        if (authenticated === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate a brief loading delay for better UX
        setTimeout(() => {
            if (passkey === CORRECT_PASSKEY) {
                setIsAuthenticated(true);
                sessionStorage.setItem('leaderboard_authenticated', 'true');
                setError('');
            } else {
                setError('❌ Invalid passkey. Please try again.');
                setPasskey('');
            }
            setIsLoading(false);
        }, 500);
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-camel flex items-center justify-center p-4">
            <div className="bg-camel/10 backdrop-blur-lg rounded-2xl p-8 border border-camel/20 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-2">
                        Protected Access
                    </h2>
                    <p className="text-primary/70 text-sm">
                        Enter the passkey to access the leaderboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="passkey" className="block text-sm font-medium text-primary mb-2">
                            Passkey
                        </label>
                        <input
                            id="passkey"
                            type="password"
                            value={passkey}
                            onChange={(e) => setPasskey(e.target.value)}
                            placeholder="Enter passkey"
                            className="w-full px-4 py-3 bg-camel/10 border border-camel/20 rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !passkey}
                        className="w-full px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Verifying...
                            </span>
                        ) : (
                            '🔓 Access Leaderboard'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-primary/50 text-xs">
                        Protected content • Authorized access only
                    </p>
                </div>
            </div>
        </div>
    );
};

const DO_BASE = "https://durable-object-starter.bitgrass-crypto.workers.dev";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "5a80f5fcf23b329f1710dcc0bfb05fa3",
});

const CONTRACT_ADDRESS = "0xBd528427e8612ff27961cDdb819688aF5c7D8735";
const CHAIN_ID = 8453;

const chain = defineChain(CHAIN_ID);

// Array of claim links - add all your claim links from Excel here
const CLAIM_LINKS = [
    "https://claim.linkdrop.io/#/redeem/8xEagkDwERZU?src=d",
    "https://claim.linkdrop.io/#/redeem/5Nqx5qgPpAKe?src=d",
    "https://claim.linkdrop.io/#/redeem/FDrD6SifsVvk?src=d",
    "https://claim.linkdrop.io/#/redeem/DNqP9MqDuemQ?src=d",
    // Add all remaining links from your Excel file here
];

// Initialize Linkdrop SDK helper
const getRandomBytes = (length: number) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
};

const initLinkdropSDK = () => {
    return new LinkdropSDK({
        apiKey: process.env.NEXT_PUBLIC_LINKDROP_API_KEY || "",
        baseUrl: "https://claim.linkdrop.io",
        getRandomBytes
    });
};

function useDOLeaderboard() {
    const [ranked, setRanked] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let closed = false;
        const abort = new AbortController();

        const fetchOnce = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${DO_BASE}/leaderboard`, {
                    headers: { accept: "application/json" },
                    signal: abort.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                if (!closed) {
                    setRanked(Array.isArray(body?.result) ? body.result : []);
                    setLoading(false);
                }
            } catch (e: any) {
                if (!closed) {
                    setError(String(e?.message || e));
                    setLoading(false);
                }
            }
        };

        fetchOnce();

        let ws: WebSocket | null = null;
        try {
            const wsUrl = DO_BASE.replace(/^http/, "ws") + "/ws";
            ws = new WebSocket(wsUrl);
            ws.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(String(evt.data || "{}"));
                    if (msg?.type === "leaderboard" && Array.isArray(msg?.data)) {
                        setRanked(msg.data);
                    }
                } catch { }
            };
        } catch { }

        return () => {
            closed = true;
            abort.abort();
            try { ws?.close(); } catch { }
        };
    }, []);

    return { ranked, loading, error };
}

const LeaderboardWithClaims = () => {
    const account = useActiveAccount();
    const { ranked, loading, error } = useDOLeaderboard();

    const [currentPage, setCurrentPage] = useState(1);
    const [claiming, setClaiming] = useState(false);
    const [claimStatus, setClaimStatus] = useState<string | null>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const ITEMS_PER_PAGE = 10;

    const totalPages = Math.ceil(ranked.length / ITEMS_PER_PAGE);
    const currentData = useMemo(() => {
        return ranked.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [ranked, currentPage]);

    // Check if user is in leaderboard
    const userInLeaderboard = useMemo(() => {
        if (!account) return null;
        return ranked.find(h => h.address?.toLowerCase() === account.address.toLowerCase());
    }, [account, ranked]);

    // Check if claim links are configured
    const hasClaimUrl = useMemo(() => {
        return CLAIM_LINKS.length > 0;
    }, []);

    const handleClaim = () => {
        // CRITICAL: Only allow claiming if address is in the leaderboard
        if (!account) {
            setClaimStatus("Please connect your wallet first");
            return;
        }

        if (!userInLeaderboard) {
            setClaimStatus("❌ Your address is not in the leaderboard. You must hold NFTs to be eligible.");
            return;
        }

        if (!hasClaimUrl) {
            setClaimStatus("No claim URL configured. Please contact support.");
            return;
        }

        // Additional check: Verify the address is actually in the ranked list
        const addressExists = ranked.some(
            holder => holder.address?.toLowerCase() === account.address.toLowerCase()
        );

        if (!addressExists) {
            setClaimStatus("❌ Security check failed: Address not found in leaderboard data.");
            return;
        }

        // Show approval modal
        setShowApprovalModal(true);
    };

    const handleApproveAndClaim = async () => {
        setShowApprovalModal(false);
        setClaiming(true);
        setClaimStatus("Preparing claim...");

        try {
            // Get the Ethereum provider from the browser
            if (!window.ethereum) {
                throw new Error("No Ethereum provider found. Please use a Web3 wallet.");
            }

            setClaimStatus("Connecting to your wallet...");

            // Create ethers provider from window.ethereum (the user's wallet)
            const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
            const signer = await browserProvider.getSigner();
            
            // Override the SDK's wallet selector to use the connected wallet
            if (typeof window !== 'undefined') {
                (window as any).evmAsk = {
                    request: async () => window.ethereum,
                    selectExtension: async () => window.ethereum
                };
            }

            setClaimStatus("Finding available claim link...");

            // Try each claim link until we find an unclaimed one
            let claimedSuccessfully = false;
            let txHash = null;

            for (let i = 0; i < CLAIM_LINKS.length; i++) {
                const claimUrl = CLAIM_LINKS[i];
                
                console.log(`Trying link ${i + 1}/${CLAIM_LINKS.length}: ${claimUrl}`);
                setClaimStatus(`Checking link ${i + 1}/${CLAIM_LINKS.length}...`);

                try {
                    // Initialize SDK for each attempt
                    const linkdropSDK = initLinkdropSDK();
                    
                    // Get the claim link object
                    const claimLink = await linkdropSDK.getClaimLink(claimUrl);
                    
                    // Check status
                    const statusData = await claimLink.getStatus();

                    if (statusData.status === 'refunded') {
                        console.log(`Link ${i + 1} - Refunded, trying next...`);
                        continue;
                    }

                    if (statusData.status === 'redeemed') {
                        console.log(`Link ${i + 1} - Already claimed, trying next...`);
                        continue;
                    }

                    if (statusData.status !== 'deposited') {
                        console.log(`Link ${i + 1} - Status: ${statusData.status}, trying next...`);
                        continue;
                    }

                    // Found an available link!
                    setClaimStatus(`Found available link! Initiating claim...`);
                    
                    console.log("Claiming with SDK for address:", account?.address);
                    
                    setClaimStatus("Submitting claim transaction...");
                    
                    // Use SDK's redeem method
                    txHash = await claimLink.redeem(account?.address!);
                    
                    console.log("Claim transaction hash:", txHash);

                    if (txHash) {
                        claimedSuccessfully = true;
                        console.log(`Successfully claimed with link ${i + 1}, tx: ${txHash}`);
                        break; // Exit loop on success
                    }

                } catch (linkError: any) {
                    console.log(`Link ${i + 1} - Error: ${linkError.message}, trying next...`);
                    // Continue to next link
                    continue;
                }
            }

            if (!claimedSuccessfully || !txHash) {
                throw new Error('All claim links have been used or are unavailable. Please contact support.');
            }

            setClaimStatus(`✅ Claimed successfully! Transaction: ${txHash.slice(0, 10)}...`);

            // Open block explorer
            if (txHash) {
                setTimeout(() => {
                    window.open(`https://basescan.org/tx/${txHash}`, '_blank');
                }, 1500);
            }

        } catch (err: any) {
            console.error('Claim error:', err);

            // Handle specific error cases
            if (err.code === 4001 || err.message?.includes('User denied')) {
                setClaimStatus('❌ Transaction rejected by user.');
            } else if (err.message?.includes('already claimed') || err.message?.includes('redeemed')) {
                setClaimStatus('❌ This link has already been claimed.');
            } else if (err.message?.includes('expired')) {
                setClaimStatus('❌ This claim link has expired.');
            } else if (err.message?.includes('insufficient funds')) {
                setClaimStatus('❌ Insufficient funds for gas fees.');
            } else if (err.message?.includes('No Authorization Header')) {
                setClaimStatus('❌ Authentication error with Linkdrop. Please check your claim URL.');
            } else {
                setClaimStatus(`❌ Claim failed: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setClaiming(false);
        }
    };

    const exportToExcel = () => {
        const headers = ['Rank', 'Address', 'Standard NFT', 'Premium NFT', 'Legendary NFT', 'BTG for Claim'];
        const csvRows = [headers.join(',')];

        ranked.forEach((holder: any, index) => {
            const row = [
                index + 1,
                holder.address,
                holder.standard || 0,
                holder.premium || 0,
                holder.legendary || 0,
                holder.btg_claim || 0
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const StandardNFTIcon = (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5206)" />
            <defs>
                <linearGradient id="paint0_linear_420_5206" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop offset="0.390566" stopColor="#C3F387" />
                    <stop offset="1" stopColor="#68C220" />
                </linearGradient>
            </defs>
        </svg>
    );

    const PremiumNFTIcon = (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5208)" />
            <defs>
                <linearGradient id="paint0_linear_420_5208" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7DFFFF" />
                    <stop offset="0.855769" stopColor="#23B7E5" />
                </linearGradient>
            </defs>
        </svg>
    );

    const LegendaryNFTIcon = (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14551 0.916016C4.82528 3.55647 2.78597 5.59579 0.145508 6.91602C2.78597 8.23624 4.82528 10.2756 6.14551 12.916C7.46574 10.2756 9.50505 8.23624 12.1455 6.91602C9.50505 5.59579 7.46574 3.55647 6.14551 0.916016Z" fill="url(#paint0_linear_420_5211)" />
            <defs>
                <linearGradient id="paint0_linear_420_5211" x1="6.14551" y1="0.916016" x2="6.14551" y2="12.916" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F8FF1E" />
                    <stop offset="0.855769" stopColor="#FCA400" />
                </linearGradient>
            </defs>
        </svg>
    );

    const getTotalNFTs = (holder: any) => {
        return (holder.standard || 0) + (holder.premium || 0) + (holder.legendary || 0);
    };
    return (
        <PasskeyProtection>
            <div className="min-h-screen bg-camel p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-camel/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-camel/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-primary mb-2">
                                    NFT Holders Leaderboard
                                </h1>
                                <p className="text-primary/70 text-sm">
                                    Connect your wallet to claim your NFTs if you're in the leaderboard
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={exportToExcel}
                                    disabled={loading || ranked.length === 0}
                                    className="flex items-center gap-2 bg-camel hover:bg-camel/80 text-primary px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Export CSV
                                </button>
                                {account && (
                                    <button
                                        onClick={handleClaim}
                                        disabled={!userInLeaderboard || claiming}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                            userInLeaderboard
                                                ? 'bg-secondary hover:bg-secondary/90 text-white cursor-pointer'
                                                : 'bg-camel10 text-gray-700 dark:text-hights cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {claiming ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Claiming...
                                            </>
                                        ) : userInLeaderboard ? (
                                            '🎁 Claim NFTs'
                                        ) : (
                                            'Not Eligible'
                                        )}
                                    </button>
                                )}
                                <ConnectButton client={client} chain={chain} />
                            </div>
                        </div>

                        {account && userInLeaderboard && hasClaimUrl && (
                            <div className="mt-4 bg-secondary/20 border border-secondary/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-secondary text-sm font-bold mb-1">
                                            ✓ You're eligible to claim!
                                        </p>
                                        <p className="text-primary/70 text-xs">
                                            {userInLeaderboard.standard > 0 && `${userInLeaderboard.standard} Standard`}
                                            {userInLeaderboard.premium > 0 && ` • ${userInLeaderboard.premium} Premium`}
                                            {userInLeaderboard.legendary > 0 && ` • ${userInLeaderboard.legendary} Legendary`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClaim}
                                        disabled={claiming || getTotalNFTs(userInLeaderboard) === 0}
                                        className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                                    >
                                        {claiming ? (
                                            <span className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Claiming...
                                            </span>
                                        ) : (
                                            `🎁 Claim NFTs (${getTotalNFTs(userInLeaderboard)})`
                                        )}
                                    </button>
                                </div>
                                {claimStatus && (
                                    <div className="mt-3 p-2 bg-camel/10 rounded text-xs text-primary">
                                        {claimStatus}
                                    </div>
                                )}
                            </div>
                        )}

                        {account && userInLeaderboard && !hasClaimUrl && (
                            <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                                    ⚠️ Connected: <span className="font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                                </p>
                                <p className="text-yellow-600/70 dark:text-yellow-400/70 text-xs mt-1">
                                    You're in the leaderboard but no claim URL is configured. Update CLAIM_URL in the code.
                                </p>
                            </div>
                        )}

                        {account && !userInLeaderboard && (
                            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                    ❌ Connected: <span className="font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                                </p>
                                <p className="text-red-600/70 dark:text-red-400/70 text-xs mt-1">
                                    Your address is not in the leaderboard. You need to hold NFTs to be eligible.
                                </p>
                            </div>
                        )}

                        <div className="mt-4 bg-camel/20 border border-camel/30 rounded-lg p-3">
                            <p className="text-primary text-sm font-medium">
                                📋 {hasClaimUrl ? 'Claim URL configured ✓' : 'No claim URL configured'}
                            </p>
                            <p className="text-primary/70 text-xs mt-1">
                                {hasClaimUrl ? 'Any address in the leaderboard can claim via Linkdrop SDK' : 'Set CLAIM_URL in the code to enable claiming'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-camel/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-camel/20">
                        <div className="p-4 border-b border-camel/20">
                            <h2 className="text-xl font-bold text-primary">
                                {ranked.length} Total Holders
                            </h2>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/20 border-b border-red-500/30">
                                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-camel/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Rank</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Address</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                            <div className="flex items-center gap-2">
                                                {StandardNFTIcon}
                                                <span>Standard</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                            <div className="flex items-center gap-2">
                                                {PremiumNFTIcon}
                                                <span>Premium</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                            <div className="flex items-center gap-2">
                                                {LegendaryNFTIcon}
                                                <span>Legendary</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">BTG Claim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-camel/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20">
                                                <div className="flex justify-center items-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((holder: any, i: number) => {
                                            const isCurrentUser = account?.address.toLowerCase() === holder.address.toLowerCase();
                                            return (
                                                <tr key={holder.address} className={`hover:bg-camel/5 ${isCurrentUser ? 'bg-secondary/10 border-l-4 border-secondary' : ''}`}>
                                                    <td className="px-4 py-3 text-sm font-medium text-primary">
                                                        #{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block rounded-md px-3 py-1 text-xs font-mono ${isCurrentUser ? 'bg-secondary/30 text-secondary font-bold' : 'bg-camel/20 text-primary/70'}`}>
                                                            {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                                                            {isCurrentUser && ' (You)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-primary font-medium">
                                                        {holder.standard || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-primary font-medium">
                                                        {holder.premium || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-primary font-medium">
                                                        {holder.legendary || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-secondary">
                                                        {(holder.btg_claim || 0).toLocaleString()} BTG
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!loading && ranked.length > 0 && (
                            <div className="p-4 bg-camel/5 flex items-center justify-between border-t border-camel/20">
                                <div className="text-sm text-primary/70">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, ranked.length)} of {ranked.length}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-camel hover:bg-camel/80 text-primary rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-primary text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-camel hover:bg-camel/80 text-primary rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-camel rounded-3xl p-6 max-w-md w-full border border-camel/20 shadow-xl">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mb-4">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-2">
                                Approve Transaction
                            </h3>
                            <p className="text-primary/70 text-sm">
                                You are about to claim your NFTs. Please approve this transaction in your wallet.
                            </p>
                        </div>

                        <div className="bg-camel/20 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-primary/70 text-sm">Wallet Address:</span>
                                <span className="text-primary text-sm font-mono">
                                    {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-primary/70 text-sm">Network:</span>
                                <span className="text-primary text-sm font-medium">Base</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="flex-1 px-6 py-3 bg-camel10 hover:bg-camel10/80 text-primary font-medium rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveAndClaim}
                                className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-md transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                            >
                                Approve & Claim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PasskeyProtection>
    );

};


export default LeaderboardWithClaims;