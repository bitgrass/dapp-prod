"use client"
import Seo from '@/shared/layout-components/seo/seo'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import {
    Swap,
    SwapAmountInput,
    SwapToggleButton,
    SwapButton,
    SwapMessage,
    SwapToast,
} from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import { btgToken, ETHToken } from "@/shared/data/tokens/data";


import { ApexOptions } from "apexcharts";
const Dashboard = () => {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');


    // add other tokens here to display them as options in the swap
    const swappableTokens: Token[] = [ETHToken, btgToken];
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
            <div className='container'>
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
                                                    <div className="tradingview-widget-container" ref={container}>
                                                        <div className="tradingview-widget-container__widget"></div>
                                                    </div>
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

                                                {/* <div className="alert alert-warning flex items-start m-4 mb-0" role="alert">
                                                        <svg
                                                            className="custom-alert-icon fill-warning inline-flex mt-1 me-2"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            height="1.5rem"
                                                            viewBox="0 0 24 24"
                                                            width="1.5rem"
                                                            fill="#0F382B"
                                                        >
                                                            <path d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                                        </svg>
                                                        <div>
                                                            <div className="text-[0.875rem] mb-1">You’re on testnet!</div>
                                                            <div className="text-[0.65rem] text-default ">Swap shows BTG but actually uses USDC.</div>                                                    </div>
                                                    </div> */}
                                                <div className="box-body crypto-data" style={{ paddingTop: 0 }}>

                                                    <Swap className='swapContainer'>
                                                        <SwapAmountInput
                                                            label="Sell"
                                                            swappableTokens={swappableTokens}
                                                            token={ETHToken}
                                                            type="from"
                                                        />
                                                        <SwapToggleButton className='swapButton' />
                                                        <SwapAmountInput
                                                            label="Buy"
                                                            swappableTokens={swappableTokens}
                                                            token={btgToken}
                                                            type="to"
                                                        />

                                                        <SwapButton />
                                                        <SwapMessage />
                                                        <SwapToast className='swapToast' />
                                                    </Swap>

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
