import React, { useState, useRef, useEffect } from "react";
import { usePrivy, useLogin, useLogout, useWallets, ConnectedWallet } from '@privy-io/react-auth';
import { useBalance, useSendTransaction, useSwitchChain } from 'wagmi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { Fragment } from 'react';
import { btgToken, ETHToken } from "@/shared/data/tokens/data";
import { useSetActiveWallet } from '@privy-io/wagmi';

const WalletMenu: React.FC = () => {
  const { ready, authenticated, user, linkWallet, exportWallet } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { wallets } = useWallets();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { setActiveWallet } = useSetActiveWallet();

  const [activePrivyWallet, setActivePrivyWallet] = useState<ConnectedWallet | null>(null);

  // 1. Only use activePrivyWallet for address and balances!
  const address = activePrivyWallet?.address as `0x${string}` || "";
  const { data: ethBalance } = useBalance({ address, chainId: base.id });
  const { data: tokenBalance } = useBalance({ address, token: btgToken.address as any, chainId: base.id });

  // --- Wallet selection logic ---
  useEffect(() => {
    if (!wallets.length) {
      setActivePrivyWallet(null);
      return;
    }
    const external = wallets.find(w => w.walletClientType !== 'privy');
    const embedded = wallets.find(w => w.walletClientType === 'privy');
    if (external) {
      setActivePrivyWallet(external);
    } else if (embedded) {
      setActiveWallet(embedded); // For embedded, call setActiveWallet.
      setActivePrivyWallet(embedded);
    } else {
      setActivePrivyWallet(null);
    }
  }, [wallets, setActiveWallet]);

  // --- UI State ---
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<null | 'fund' | 'send'>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendToAddress, setSendToAddress] = useState('');
  const [sendError, setSendError] = useState('');
  const [fundError, setFundError] = useState('');
  const [sendSuccess, setSendSuccess] = useState<{ hash: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const hasNonEmbeddedWallet = wallets.some(w => w.walletClientType !== 'privy');
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';
  const email = user?.email?.address;
  const twitter = user?.twitter?.username || user?.twitter?.name;
  const twitterImage = user?.twitter?.profilePictureUrl?.replace('_normal', '');

  const handleModal = () => {
    setOpenPanel(null);
    setOpen(true);
  };

  const handleFundPanel = () => {
    setOpenPanel(openPanel === 'fund' ? null : 'fund');
    setSendError('');
    setSendSuccess(null);
    setFundError('');
    setSendAmount('');
    setSendToAddress('');
  };

  const handleSendPanel = () => {
    setOpenPanel(openPanel === 'send' ? null : 'send');
    setSendError('');
    setSendSuccess(null);
    setFundError('');
    setFundAmount('');
  };

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: any) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSendError('');
        setFundError('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sidebar = document.querySelector(".app-sidebar");
    if (open && sidebar) sidebar.classList.add("disabled");
    if (!open && sidebar) sidebar.classList.remove("disabled");
  }, [open]);

  useEffect(() => {
    if (sendSuccess) {
      const timer = setTimeout(() => {
        setSendSuccess(null);
        setOpenPanel(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sendSuccess]);

  // --- Actions ---
  const handleFund = async () => {
    setFundError('');
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      setFundError("Please enter a valid amount.");
      return;
    }
    if (!activePrivyWallet || activePrivyWallet.walletClientType !== 'privy') {
      setFundError("No embedded wallet connected.");
      return;
    }
    try {
      const currentChain = activePrivyWallet.chainId;
      if (currentChain !== `eip155:${base.id}` && activePrivyWallet.switchChain) {
        await activePrivyWallet.switchChain(base.id);
      }
      await activePrivyWallet.fund({
        chain: { id: base.id },
        amount: fundAmount,
      });
      setOpenPanel(null);
      setFundAmount('');
    } catch (err: any) {
      if (err?.message?.includes("User rejected")) {
        setFundError("Transaction rejected by user.");
      } else if (err?.message?.includes("ChainMismatchError")) {
        setFundError("Please switch to the Base network in your wallet.");
      } else {
        setFundError("Failed to fund wallet.");
      }
    }
  };

  const handleSend = async () => {
    setSendError('');
    setSendSuccess(null);
    if (!address || !wallets.length) {
      setSendError("No wallet connected. Please connect a wallet.");
      return;
    }
    if (!sendToAddress || !sendAmount || isNaN(Number(sendAmount)) || Number(sendAmount) <= 0) {
      setSendError("Enter a valid address and amount.");
      return;
    }
    if (ethBalance && Number(sendAmount) > Number(ethBalance.formatted)) {
      setSendError("Amount exceeds your ETH balance.");
      return;
    }
    try {
      const chainMismatch = activePrivyWallet?.chainId !== `eip155:${base.id}`;
      if (chainMismatch && activePrivyWallet?.walletClientType === 'privy' && activePrivyWallet.switchChain) {
        await activePrivyWallet.switchChain(base.id);
      } else if (chainMismatch) {
        await switchChainAsync({ chainId: base.id });
      }
      const tx = await sendTransactionAsync({
        to: sendToAddress as `0x${string}`,
        value: parseEther(sendAmount),
        chainId: base.id,
      });
      setSendSuccess({ hash: tx });
      setSendAmount('');
      setSendToAddress('');
    } catch (err: any) {
      if (err?.message?.includes("User rejected")) {
        setSendError("Transaction rejected by user.");
      } else if (err?.message?.includes("insufficient funds")) {
        setSendError("Insufficient ETH balance.");
      } else if (err?.message?.includes("ChainMismatchError")) {
        setSendError("Please switch to the Base network in your wallet.");
      } else {
        setSendError("Failed to send ETH.");
      }
    }
  };

  const handleLinkWallet = async () => {
    await linkWallet();
  };

  const handlelLogout = async () => {
    await logout();
    setOpen(false);
    window.location.reload();
  };

  if (!ready) {
    return <button disabled className="btn btn-sm btn-outline-primary opacity-50 cursor-not-allowed ti-btn">Connecting…</button>;
  }

  if (!authenticated) {
    return (
      <button onClick={login} className="inline-flex justify-center items-center gap-2 font-medium text-xs px-4 py-2 text-primary ti-btn"
        style={{ backgroundColor: 'rgb(var(--camel-10))', borderRadius: '0.25rem', minWidth: '140px', padding: "10px" }}>
        <i className="bx bx-wallet text-lg mr-2" />
        Connect Wallet
      </button>
    );
  }

  return (
    <Fragment>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1 ti-btn"
        style={{
          backgroundColor: 'rgb(var(--camel-10))',
          borderRadius: '0.25rem',
          padding: '10px',
        }}
      >
        {twitterImage ? (
          <>
            <img
              src={twitterImage}
              className="w-6 h-6 rounded-full object-cover"
              alt="Twitter"
            />
            <span className="text-sm font-medium flex items-center gap-1 text-blue-500">
              @{twitter}
            </span>
          </>
        ) : address ? (
          <>
            <Jazzicon diameter={20} seed={jsNumberForAddress(address)} />
            <span className="text-sm font-medium">{shortAddress}</span>
          </>
        ) : email ? (
          <>
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
              {email[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium">{email}</span>
          </>
        ) : (
          <span className="text-sm font-medium">User</span>
        )}
      </button>

      {open && !openPanel && (
        <div
          className="fixed inset-0 flex items-center justify-center backdrop-blur-sm"
          style={{ position: "fixed", zIndex: 999999 }}
        >
          <div
            ref={popupRef}
            className="w-[95%] z-[9999] max-w-md bg-camel rounded-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              {twitterImage ? (
                <img src={twitterImage} className="w-10 h-10 rounded-full object-cover" alt="Twitter" />
              ) : address ? (
                <Jazzicon diameter={32} seed={jsNumberForAddress(address)} />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {email?.[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-base">
                  {shortAddress || email || 'User'}
                </span>
                {twitter && (
                  <span className="flex items-center mt-1 text-blue-500 font-normal text-xs">
                    @{twitter}
                  </span>
                )}
              </div>
            </div>

            {/* View/Copy */}
            <div className="flex flex-row gap-2">
              {address && (
                <div className="relative flex-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      setShowTooltip(true);
                      setTimeout(() => setShowTooltip(false), 1200);
                    }}
                    className="w-full flex items-center justify-center px-3 py-1.5 rounded-md hover:bg-camel10 dark:hover:bg-[#FFFFFF0D] transition ti-btn"
                    style={{ color: "#666666", fontSize: "12px", padding: "6px", marginTop: "12px" }}
                  >
                    {shortAddress || email || 'User'}
                    <i className="bx bx-copy mr-1" style={{ color: "#666666", marginLeft: "3px" }} />
                  </button>
                  {showTooltip && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-50 py-0.5 px-2 rounded bg-[#00382B] text-white text-[10px] font-medium shadow dark:bg-slate-700"
                      role="tooltip"
                    >
                      Copied!
                    </span>
                  )}
                </div>
              )}
              {address && hasNonEmbeddedWallet && (
                <button
                  onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
                  className="flex-1 flex items-center justify-center px-3 py-1.5 rounded-md hover:bg-camel10 dark:hover:bg-[#FFFFFF0D] transition ti-btn"
                  style={{ color: "#666666", fontSize: "12px", padding: "6px", marginTop: "12px" }}
                >
                  View on Basescan
                  <i className="bx bx-link-alt mr-1" style={{ color: "#666666", marginLeft: "3px" }} />
                </button>
              )}

              {activePrivyWallet?.walletClientType === 'privy' && (
                <button
                  className="flex-1 flex items-center justify-center px-3 py-1.5 rounded-md hover:bg-camel10 dark:hover:bg-[#FFFFFF0D] transition ti-btn"
                  style={{ color: "#666666", fontSize: "12px", padding: "6px", marginTop: "12px" }}
                  onClick={exportWallet}
                >
                  Export my wallet <i className='bx bx-export' style={{ color: "#666666", marginLeft: "3px" }}></i>
                </button>
              )}
            </div>
            <hr style={{ borderColor: "#F2F2F2", borderWidth: "1px", marginTop: "1rem", marginBottom: "1rem" }} />

            <div className="flex flex-col items-left gap-4 mb-4">
              <span className="font-semibold text-base">Balance</span>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {btgToken.image && (
                    <img
                      src={btgToken.image}
                      className="w-7 h-7 rounded-full object-cover"
                      alt={btgToken.symbol}
                    />
                  )}
                  <span className="font-semibold text-sm ms-2">{btgToken.symbol}</span>
                </div>
                <div className="text-sm font-medium text-right">
                  {tokenBalance ? `${tokenBalance.formatted.slice(0, 6)} ${tokenBalance.symbol}` : "0"}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {ETHToken.image && (
                    <img
                      src={ETHToken.image}
                      className="w-7 h-7 rounded-full object-cover"
                      alt={ETHToken.symbol}
                    />
                  )}
                  <span className="font-semibold text-sm ms-2">{ETHToken.symbol}</span>
                </div>
                <div className="text-sm font-medium text-right">
                  {ethBalance ? `${ethBalance.formatted.slice(0, 6)} ${ethBalance.symbol}` : "0"}
                </div>
              </div>
            </div>


            {/* Deposit/Send buttons */}
            <div className="flex flex-row gap-2 mt-6 mb-6">
              {activePrivyWallet?.walletClientType === 'privy' && (
                <div className="flex-1 bg-secondary rounded-sm">
                  <button
                    onClick={handleFundPanel}
                    style={{ placeContent: 'center' }}
                    className="flex items-center justify-between text-sm font-medium text-white w-full py-3 px-3 rounded-sm hover:opacity-90 transition ti-btn"
                  >
                    <span className="flex text-white items-center">
                      <i className="bx bx-credit-card mr-2 text-white"  />
                      Deposit
                    </span>
                  </button>
                </div>
              )}

              <div  className="flex-1 bg-secondary rounded-sm">
                <button
                  onClick={handleSendPanel}
                  style={{ placeContent: 'center' }}
                  className="flex items-center justify-between text-sm font-medium text-wihte w-full py-3 px-3 rounded-sm hover:opacity-90 transition "
                >
                  <span className="flex text-white items-center">
                    <i className="bx bx-send mr-2 text-white"  />
                    Send
                  </span>
                </button>
              </div>
            </div>

            <hr style={{ borderColor: "#F2F2F2", borderWidth: "1px", marginTop: "1rem", marginBottom: "1rem" }} />

            {/* Connect wallet if needed */}
            {!hasNonEmbeddedWallet && (
              <div className="flex gap-4">
                <button
                  onClick={handleLinkWallet}
                  className="flex-1 flex items-center text-sm justify-between font-medium bg-secondary dark:bg-[#FFFFFF0D] text-white py-3 px-3 rounded-sm  hover:bg-primary/90 transition"
                >
                  <span className="text-white"><i className="bx bx-plug mr-2" />Connect External Wallet</span>
                </button>
              </div>
            )}

            {/* Disconnect button */}
            <button
              onClick={handlelLogout}
              className="w-full flex items-center justify-center text-sm font-medium bg-camel10 dark:bg-[#FFFFFF0D] text-primary hover:bg-red-700 py-3 px-3 rounded-sm transition mt-4 "
            >
              <i className="bx bx-log-out mr-2" />Disconnect
            </button>
          </div>
        </div>
      )}

      {(openPanel === 'send' || openPanel === 'fund') && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm" style={{ position: "fixed", zIndex: 999999 }}>
          <div ref={popupRef} className="w-[95%] z-[9999] max-w-md bg-camel rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <button onClick={() => handleModal()} className="text-gray-500 hover:text-gray-700 ti-btn">
                <i className="ri-arrow-left-line align-middle inline-block"></i>
              </button>
              <div style={{ placeItems: 'anchor-center' }}>
                <h3 className="font-semibold">
                  {openPanel === 'send' ? 'Send ETH' : 'Deposit ETH'}
                </h3>
                <span style={{ color: "#666666" }}>
                  {openPanel === 'send' ? '' : 'Choose ETH Amount'}
                </span>
              </div>
              <span></span>
            </div>

            {openPanel === 'send' && (
              <div className="space-y-4 mt-4">
                {!sendSuccess ? (
                  <>
                    <span className="text-sm">Recipient Address</span>
                    <input
                      type="text"
                      value={sendToAddress}
                      onChange={(e) => setSendToAddress(e.target.value)}
                      placeholder="Recipient Address"
                      className="w-full px-3 py-3 border border-secondary rounded-md bg-swap dark:text-white dark:placeholder:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition shadow-sm text-sm"
                    />
                    <div className="w-full flex flex-row justify-between items-center">
                      <span className="text-sm">Amount</span>
                      <span className="text-sm">
                        Balance:{" "}
                        <span style={{ color: "#7FC447" }}>
                          {ethBalance ? `${ethBalance.formatted.slice(0, 6)} ${ethBalance.symbol}` : "0"}
                        </span>
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="Amount in ETH"
                      className="w-full px-3 py-3 border border-secondary rounded-md bg-swap dark:text-white dark:placeholder:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition shadow-sm text-sm"
                    />
                    <div className="text-xs text-red-500" style={{ height: "20px" }}>{sendError && <span>{sendError}</span>}</div>
                    {sendError.includes("Please switch to the Base network") && (
                      <button
                        onClick={async () => {
                          try {
                            if (embeddedWallet) {
                              await embeddedWallet.switchChain(base.id);
                            } else {
                              await switchChainAsync({ chainId: base.id });
                            }
                            setSendError('');
                          } catch (err) {
                            setSendError("Failed to switch to Base network.");
                          }
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-medium transition mt-2"
                      >
                        Switch to Base Network
                      </button>
                    )}
                    <button
                      onClick={handleSend}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white py-2 rounded-md font-medium transition"
                    >
                      Send
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-start gap-1 py-2">
                    <div className="flex items-center gap-2">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="rgb(var(--secondary))" />
                        <path d="M7 13.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[13px] font-semibold" style={{ color: 'rgb(var(--secondary))' }}>
                        Transaction sent successfully!
                      </span>
                    </div>
                    <a
                      href={`https://basescan.org/tx/${sendSuccess.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs mt-2"
                    >
                      View Transaction
                    </a>
                  </div>
                )}
              </div>
            )}

            {openPanel === 'fund' && (
              <div className="space-y-4 mt-4">
                <span className="text-sm">Amount</span>
                <input
                  type="number"
                  min="0"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="w-full px-3 py-3 border border-secondary rounded-md bg-swap dark:text-white dark:placeholder:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition shadow-sm text-sm"
                />
                <div className="text-xs text-red-500" style={{ height: "20px" }}>{fundError && <span>{fundError}</span>}</div>
                <button
                  onClick={handleFund}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-2 rounded-md font-medium transition"
                >
                  Deposit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default WalletMenu;