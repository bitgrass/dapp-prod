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
    const { address, client: walletClient, clientReady } = useConnectedAddress();
    const setActiveWallet = useSetActiveWallet();

    // Sync connected wallet with Thirdweb
    useEffect(() => {
        const syncWallet = async () => {
            if (address && walletClient && clientReady) {
                try {
                    const thirdwebWallet = EIP1193.fromProvider({
                        provider: walletClient,
                    });
                    await thirdwebWallet.connect({ client });
                    setActiveWallet(thirdwebWallet);
                } catch (error) {
                    console.error("Failed to sync wallet with Thirdweb:", error);
                }
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
                                                    {address && clientReady ? (
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
                                                    ) : (
                                                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                            <p>Please connect your wallet to use the swap feature.</p>
                                                        </div>
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
