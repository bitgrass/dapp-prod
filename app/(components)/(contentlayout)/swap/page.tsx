"use client"
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import { createThirdwebClient } from "thirdweb";
import { SwapWidget, useSetActiveWallet } from "thirdweb/react";
import { EIP1193 } from "thirdweb/wallets";
import { useConnectedAddress } from '../useConnectedAddress';
import PriceChart from '../dashboard/PriceChart';

import { ApexOptions } from "apexcharts";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

const Dashboard = () => {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const { address, client: walletClient, clientReady, isLoading: addressLoading } = useConnectedAddress();
    const setActiveWallet = useSetActiveWallet();
    const [walletSynced, setWalletSynced] = useState(false);
    const [walletSyncFailed, setWalletSyncFailed] = useState(false);

    // Sync connected wallet with Thirdweb
    useEffect(() => {
        const syncWallet = async () => {
            // If we have an address and the client is ready, we can proceed
            if (address && clientReady) {
                setWalletSyncFailed(false);
                try {
                    // Only try to sync if we have a wallet client
                    if (walletClient) {
                        const thirdwebWallet = EIP1193.fromProvider({
                            provider: walletClient,
                        });
                        try {
                            await thirdwebWallet.connect({ client });
                            setActiveWallet(thirdwebWallet);
                            setWalletSynced(true);
                            setWalletSyncFailed(false);
                            console.log("✅ Wallet synced with Thirdweb:", address);
                        } catch (connectError) {
                            console.warn("⚠️ Wallet connect failed:", connectError);
                            // Don't try to set active wallet if connect failed
                            // The error "Cannot set a wallet without an account" means
                            // the wallet doesn't have accounts available
                            // Mark as failed - provider doesn't support required methods
                            setWalletSynced(true);
                            setWalletSyncFailed(true);
                        }
                    } else {
                        setWalletSynced(true);
                        setWalletSyncFailed(true);
                    }

                    // Mark as synced regardless - we have the address
                    setWalletSynced(true);
                } catch (error) {
                    console.error("❌ Failed to create Thirdweb wallet:", error);
                    // Still mark as synced if we have an address
                    setWalletSynced(true);
                    setWalletSyncFailed(true);
                }
            } else if (!address) {
                setWalletSynced(false);
                setWalletSyncFailed(false);
            }
        };
        syncWallet();
    }, [address, walletClient, clientReady, setActiveWallet]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'market') {
            setActiveTab('market');
        } else {
            setActiveTab('overview');
        }
    }, [searchParams]);


    const container = useRef<HTMLDivElement | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const handleThemeChange = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        // Check initial theme
        handleThemeChange();

        // Listen for theme changes (if you're using Tailwind's 'dark' class toggle)
        const observer = new MutationObserver(handleThemeChange);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);


    useEffect(() => {
        if (container.current) {
            // Clear any existing TradingView widget
            container.current.innerHTML = ""; // This removes any existing widget entirely.

            // Create and append the TradingView script
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
            script.type = "text/javascript";
            script.async = true;
            script.setAttribute("data-tradingview", "true");
            script.innerHTML = `
        {
            "symbols": [
                [
                    "COINBASE:DEGENUSD|1D"
                ]
            ],
            "chartOnly": true,
            "width": "100%",
            "height": "400",
            "locale": "en",
            "colorTheme": "${theme}",
            "autosize": true,
            "showVolume": false,
            "showMA": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "fontSize": "10",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "chartType": "area",
            "maLineColor": "#2962FF",
            "maLineWidth": 1,
            "maLength": 9,
            "headerFontSize": "medium",
            "widgetFontColor": "rgba(76, 175, 80, 1)",
            "lineWidth": 2,
            "lineType": 0,
            "dateRanges": [
                "5d|3",
                "1m|30",
                "3m|60",
                "12m|1D",
                "all|1M"
            ],
            "lineColor": "rgba(102, 187, 106, 1)",
            "topColor": "rgba(200, 230, 201, 1)",
            "bottomColor": "rgba(200, 230, 201, 0.28)",
            "color": "rgba(76, 175, 80, 1)",
            "range": "5D"
        }`;
            container.current.appendChild(script);
        }
    }, [theme]); // Re-run the effect whenever the theme changes.

    return (
        <Fragment>
            <Seo title={"swap"} />
            <div className='container swap'>
                <div className="grid grid-cols-12 gap-x-6 mt-6">
                    <div className="xl:col-span-12 col-span-12">
                        <div className="tab-content">
                            <div
                                className={`hs-tab-content tab-pane !p-0 !border-0 `}
                                role="tabpanel"
                            >
                                {/* Market Content */}
                                {/* ... Your Market content ... */}
                                <div className="grid grid-cols-12 gap-x-6">
                                    <div className="xl:col-span-8 col-span-12">
                                        <div className="box">
                                            <div className="box-header justify-between flex-wrap">
                                                <div className="box-title">$BTG Chart</div>
                                            </div>
                                            <div className="box-body !p-0">
                                                <div id="crypto" className="p-4">
                                                    <PriceChart 
                                                        pairAddress="0x96d4b53a38337a5733179751781178a2613306063c511b78cd02684739288c0a"
                                                        theme={theme}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="xl:col-span-4 col-span-12">
                                        <div className="xl:col-span-4 lg:col-span-6 md:col-span-6 sm:col-span-12 col-span-12">
                                            <div className="box custom-box">
                                                <div className="box-header">
                                                    <h5 className="box-title">Swap $BTG</h5>
                                                </div>

                                
                                                <div className="box-body crypto-data" style={{ paddingTop: 0 }}>
                                                    {!address ? (
                                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                            <p>Please connect your wallet to use the swap feature.</p>
                                                        </div>
                                                    ) : !walletSynced ? (
                                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent mx-auto mb-4">
                                                            </div>
                                                            <p className="mt-3">Syncing wallet...</p>
                                                        </div>
                                                    ) : address && walletSynced && walletSyncFailed ? (
                                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                            <div className="alert alert-warning" role="alert">
                                                                <h5 className="alert-heading">⚠️ Limited Functionality</h5>
                                                                <p>Swap feature is not available in this environment.</p>
                                                                <p className="mb-0">Please open this app in the Warpcast mobile app for full swap functionality.</p>
                                                            </div>
                                                            <p className="text-muted mt-3">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                                                        </div>
                                                    ) : (
                                                        <SwapWidget
                                                            client={client}
                                                            theme={theme === 'dark' ? 'dark' : 'light'}
                                                            prefill={{
                                                                sellToken: {
                                                                    chainId: 8453,
                                                                },
                                                                buyToken: {
                                                                    chainId: 8453,
                                                                    tokenAddress: "0x20429F731096e359910921994A267d32ef576720",
                                                                },
                                                            }}
                                                            connectOptions={{
                                                                wallets: [],
                                                                autoConnect: false,
                                                            }}
                                                            showThirdwebBranding={false}
                                                            persistTokenSelections={true}
                                                            style={{ width: '100%', minHeight: '400px' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Dashboard
