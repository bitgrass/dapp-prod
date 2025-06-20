"use client"
import Seo from '@/shared/layout-components/seo/seo'
import Link from 'next/link'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
    Autoplay, Pagination,
    EffectCube
} from 'swiper/modules';
import {
    Swap,
    SwapAmountInput,
    SwapToggleButton,
    SwapButton,
    SwapMessage,
    SwapToast,
} from '@coinbase/onchainkit/swap';
import type { Token } from '@coinbase/onchainkit/token';
import Moralis from 'moralis';
import axios from 'axios';
import { btgToken, ETHToken } from "@/shared/data/tokens/data";


async function initializeMoralis() {
    try {
        await Moralis.start({
            apiKey: process.env.MORALIS_APY_KEY,
        });
    } catch (error) {
        console.error("Error starting Moralis:", error);
    }
}

// Initialize Moralis only once in the app lifecycle
initializeMoralis();
import { ApexOptions } from "apexcharts";
const Dashboard = () => {
    const [showAlert, setShowAlert] = useState(false)
    const handleCloseAlert = () => setShowAlert(false)

    const percentage = 80; // Percentage to display
    const radius = 100; // Radius of the circle
    const strokeWidth = 10; // Thickness of the stroke
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const [h24Volume, setVolume] = useState('');



    const [degenPrice, setDegenPrice] = useState(0);
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');


    // add other tokens here to display them as options in the swap
    const swappableTokens: Token[] = [ETHToken, btgToken];
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);



    const [tooltipText, setTooltipText] = useState('Copy address');

    const handleCopy = () => {
        navigator.clipboard.writeText(btgToken.address);
        setTooltipText('Copied!');
        setTimeout(() => setTooltipText('Copy address'), 2000); // Reset tooltip text after 2 seconds
    };
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
    const [loadingChart, setLoadingChart] = useState(true);


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
            script.onload = () => setLoadingChart(false); // Remove loading state when script loads

            container.current.appendChild(script);
        }
    }, [theme]); // Re-run the effect whenever the theme changes.

    const [chartOptions] = useState<ApexOptions>({
        chart: {
            type: "bar",
            toolbar: {
                show: false, // Hide chart toolbar
            },
            animations: {
                enabled: true,
            },
            stacked: true, // Enable stacking for a single bar
        },
        plotOptions: {
            bar: {
                horizontal: true, // Horizontal bar chart
                barHeight: "70%", // Adjust bar height
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false, // Enable labels inside the chart
        },
        xaxis: {
            labels: {
                show: false, // Show x-axis labels
            },
            axisBorder: {
                show: false, // Hide x-axis border
            },
            axisTicks: {
                show: false, // Hide x-axis ticks
            },

        },
        yaxis: {
            labels: {
                show: false, // Show y-axis labels
                formatter: function () {
                    return "Bitgrass NFT Collection"; // Label for the bar
                },
            },
        },
        grid: {
            show: false, // Hide grid background
        },
        tooltip: {
            enabled: true, // Enable tooltips
            y: {
                formatter: function (val) {
                    return `${val}`; // Tooltip to show data values
                },
            },
        },
        fill: {
            opacity: 1, // Fill bar with solid color
        },
        legend: {
            show: false, // Explicitly hide the legend
        },
        colors: ["#084D08", "#66CC33", "#f9f8f7"], // Colors for each category

    });

    const [chartSeries] = useState([
        {
            name: "Standard",
            data: [2000], // Quantity of Standard NFTs
        },
        {
            name: "Premium",
            data: [800], // Quantity of Rare NFTs
        },
        {
            name: "Legendary",
            data: [400], // Quantity of Legendary NFTs
        },
    ]);

    const nftDataChart = [
        { name: "Standard", value: 2000, color: "#084D08", land: "100m²" },
        { name: "Premium", value: 800, color: "#66CC33", land: "500m²" },
        { name: "Legendary", value: 400, color: "#f9f8f7", land: "1000m²" }
    ];

    const total = nftDataChart.reduce((sum, nft) => sum + nft.value, 0);

    const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;

    useEffect(() => {
        async function fetchPrice() {
            try {
                const response = await axios.get(
                    `https://deep-index.moralis.io/api/v2.2/erc20/${btgToken.address}/price?chain=base&include=percent_change`,
                    {
                        headers: {
                            accept: "application/json",
                            "X-API-Key": API_KEY!,
                        },
                    }
                )
                const prices = response.data.usdPrice;


                if (prices) {
                    setDegenPrice(prices.toFixed(6)); // Set the price as a string
                } else {
                    console.warn('Uniswap V3 0.30% price not found');
                }
            } catch (error) {
                console.error("Error fetching Degen price:", error);
            }
        }

        fetchPrice();
    }, []);
    const formatLargeValue = (value: any) => {
        const totalValue = value;
        return totalValue >= 1000000
            ? `$${(Math.round(totalValue / 100000) / 10).toFixed(1)}M`
            : `$${(Math.round(totalValue / 100) / 10).toFixed(1)}K`;
    };

    return (
        <Fragment>
            <Seo title={"Overview"} />

            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="box bg-white border-0 m-[1rem] max-w-md w-full">
                        <div className="alert custom-alert1 alert-secondary relative" id="dismiss-alert70">
                            <button
                                type="button"
                                onClick={handleCloseAlert}
                                className="btn-close absolute top-2 right-2"
                                aria-label="Close"
                            >
                                <i className="bi bi-x"></i>
                            </button>
                            <div className="text-center px-5 pb-0">
                                <svg
                                    className="custom-alert-icon inline-flex"
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="2.5rem"
                                    viewBox="0 0 24 24"
                                    width="1.5rem"
                                    fill="#0F382B"
                                >
                                    <path d="M0 0h24v24H0z" fill="none" />
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                </svg>
                                <h5 className="text-[1.25rem] !font-medium">Testnet Preview</h5>
                                <p className="text-[0.875rem] mb-2">
                                    You’re currently using our testnet environment.<br />
                                    Mainnet launch coming soon!
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCloseAlert}
                                    className="ti-btn text-white !font-medium bg-secondary text-white"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}
            <div className={`${showAlert ? 'filter blur-sm pointer-events-none' : ''}`}>

                <div className="container" >
                    <div className="grid grid-cols-12 gap-x-6">
                        <div className="xl:col-span-12  col-span-12">
                            <div className="">
                                <div className="box-body">
                                    <div className="md:flex block flex-wrap items-center justify-between">
                                        <div className="flex-grow">
                                            {/* Added data-hs-tabs to the parent nav */}
                                            <nav className="nav nav-pills nav-style-3 flex md:mb-0 mb-4" aria-label="Tabs" role="tablist" data-hs-tabs>
                                                <Link
                                                    href="/dashboard?tab=overview"
                                                    scroll={false}
                                                    className={`nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary ${activeTab === 'overview' ? 'active' : ''}`}
                                                    data-hs-tab="#overview-tab-pane"  // Link this trigger to the overview pane
                                                >
                                                    Overview
                                                </Link>
                                                <Link
                                                    href="/dashboard?tab=market"
                                                    scroll={false}
                                                    className={`nav-link text-defaulttextcolor !py-[0.35rem] !px-4 text-sm !font-medium text-center rounded-md hover:text-primary ${activeTab === 'market' ? 'active' : ''}`}
                                                    data-hs-tab="#market-tab-pane" // Link this trigger to the market pane
                                                >
                                                    Market
                                                </Link>
                                            </nav>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-x-6">
                        <div className="xl:col-span-12 col-span-12">
                            <div className="tab-content">
                                {/* Add hs-tab-content class and matching IDs */}
                                <div
                                    id="overview-tab-pane"
                                    className={`hs-tab-content tab-pane !p-0 !border-0 ${activeTab === 'overview' ? 'show active' : 'hidden'}`}
                                    role="tabpanel"
                                >
                                    <div className="grid grid-cols-12 gap-x-6">
                                        <div className="xl:col-span-3 sm:col-span-6 col-span-12">
                                            <div className="box">
                                                <div className="box-body">
                                                    <div className="flex gap-3 flex-wrap items-start justify-between">
                                                        <div className="flex-grow flex items-start sm:mb-0">
                                                            <div className="me-4">
                                                                <span className="avatar avatar-rounded bg-camel10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="M12 2C8.02 2 4 3.37 4 6v12c0 2.63 4.02 4 8 4s8-1.37 8-4V6c0-2.63-4.02-4-8-4m0 18c-3.72 0-6-1.29-6-2v-1.27c1.54.84 3.78 1.27 6 1.27s4.46-.43 6-1.27V18c0 .71-2.28 2-6 2m0-4c-3.72 0-6-1.29-6-2v-1.27c1.54.84 3.78 1.27 6 1.27s4.46-.43 6-1.27V14c0 .71-2.28 2-6 2m0-4c-3.72 0-6-1.29-6-2V8.73C7.54 9.57 9.78 10 12 10s4.46-.43 6-1.27V10c0 .71-2.28 2-6 2m0-4C8.28 8 6 6.71 6 6s2.28-2 6-2 6 1.29 6 2-2.28 2-6 2"></path>
                                                                    </svg>                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[#8c9097] dark:text-white/50">Total Carbon Tokenized</span>
                                                                <span className="text-[1rem] font-semibold">TBA</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xl:col-span-3 sm:col-span-6 col-span-12">
                                            <div className="box">
                                                <div className="box-body">
                                                    <div className="flex gap-3 flex-wrap items-start justify-between">
                                                        <div className="flex-grow flex items-start  sm:mb-0">
                                                            <div className="me-4">
                                                                <span className="avatar avatar-rounded bg-camel10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z"></path><path d="M12 9h3v3h2V7h-5zM9 12H7v5h5v-2H9z"></path>
                                                                    </svg>                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[#8c9097] dark:text-white/50">Total Hectares Covered</span>
                                                                <span className="text-[1rem] font-semibold">100 Hectares</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xl:col-span-3 sm:col-span-6 col-span-12">
                                            <div className="box">
                                                <div className="box-body">
                                                    <div className="flex gap-3 flex-wrap items-start justify-between">
                                                        <div className="flex-grow flex items-start  sm:mb-0">
                                                            <div className="me-4">
                                                                <span className="avatar avatar-rounded bg-camel10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m21.02,3.17c-.24-.04-5.8-.97-8.81,2.04-.67.67-1.14,1.47-1.47,2.3-.17-.24-.35-.47-.56-.69-2.48-2.48-7.03-1.72-7.23-1.69-.42.07-.74.4-.81.81-.03.19-.79,4.75,1.69,7.23,1.52,1.52,3.82,1.82,5.41,1.82.28,0,.53,0,.76-.02v6.02h2v-6.05c.34.03.75.05,1.21.05,1.95,0,4.74-.37,6.58-2.21,3.01-3.01,2.08-8.58,2.04-8.81-.07-.42-.4-.74-.81-.81Zm-11.05,9.81c-1.17.08-3.47.05-4.73-1.21-1.27-1.27-1.29-3.56-1.21-4.74,1.17-.08,3.47-.05,4.73,1.21,1.27,1.27,1.29,3.56,1.21,4.74Zm8.41-1.59c-1.73,1.73-4.9,1.69-6.33,1.57-.12-1.43-.16-4.59,1.57-6.33,1.73-1.73,4.9-1.69,6.33-1.57.12,1.43.16,4.59-1.57,6.33Z"></path>
                                                                    </svg>                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[#8c9097] dark:text-white/50">Carbon Units</span>
                                                                <span className="text-[1rem] font-semibold">60 K-tonnes</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xl:col-span-3 sm:col-span-6 col-span-12">
                                            <div className="box">
                                                <div className="box-body">
                                                    <div className="flex gap-3 flex-wrap items-start justify-between">
                                                        <div className="flex-grow flex items-start sm:mb-0">
                                                            <div className="me-4">
                                                                <span className="avatar avatar-rounded bg-camel10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m20,10h-4v-3c0-.55-.45-1-1-1h-6c-.55,0-1,.45-1,1v3H4c-.38,0-.73.22-.9.57-.17.35-.12.76.12,1.06l8,10c.19.24.48.38.78.38s.59-.14.78-.38l8-10c.24-.3.29-.71.12-1.06-.17-.35-.52-.57-.9-.57Zm-8,9.4l-5.92-7.4h2.92c.55,0,1-.45,1-1v-3h4v3c0,.55.45,1,1,1h2.92l-5.92,7.4Z"></path><path d="M8 2H16V4H8z"></path>
                                                                    </svg>                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[#8c9097] dark:text-white/50">Total Carbon Retired</span>
                                                                <span className="text-[1rem] font-semibold">0</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-x-6">
                                        <div className="xl:col-span-8 col-span-12">
                                            <div>

                                                <div className="box overflow-hidden">
                                                    <div className="box-body !p-0">
                                                        <div className="sm:flex items-start pt-6 px-6 pb-0 ">
                                                            <div>
                                                                <span className="avatar avatar-xxl mt-2 me-4">
                                                                    <img src="../../../assets/images/apps/profile-pic.jpg" alt="" />
                                                                </span>
                                                            </div>
                                                            <div className="flex-grow main-profile-info">
                                                                <div className="flex items-center !justify-between">
                                                                    <h6 className="font-semibold mb-1 text-primary text-[1rem]">Bitgrass NFT Collection</h6>
                                                                    <Link href="/projects/project-details/1" className="ti-btn bg-camel10 !font-medium !gap-0"><i className="ri-add-line me-1 align-middle inline-block"></i>Explore</Link>

                                                                </div>
                                                                <p className="mb-1 ">Project by Bitgrass</p>
                                                                <p className="text-[0.75rem]  mb-6">
                                                                    <span className="me-4 inline-flex"><i className="ri-building-line me-1 align-middle"></i>100 Hectares</span>
                                                                    <span className="inline-flex"><i className="ri-map-pin-line me-1 align-middle"></i>Tunisia</span>
                                                                </p>

                                                            </div>
                                                        </div>

                                                        <div className="p-6 ">
                                                            <div className="mb-6">
                                                                <p className="text-[.9375rem] mb-2 font-semibold">Description :</p>
                                                                <p className="text-[0.75rem]">
                                                                    Bitgrass will tokenize <b className="text-defaulttextcolor">100 hectares of farmland</b>  into a limited collection of <b className="text-defaulttextcolor"> 3,200 NFTs</b>, launching on <b className="text-defaulttextcolor">July 01, 2025.</b>

                                                                </p><br /> Each NFT represents a tokenized farmland plot with multiple use cases:<br />
                                                                <ul className="text-[0.75rem] list-disc list-inside ml-4">
                                                                    <li>Grants the<b className="text-defaulttextcolor"> Right of Use for Carbon Credits</b> </li>
                                                                    <li>Allows early investors to<b className="text-defaulttextcolor"> earn $BTG through a vesting schedule</b></li>
                                                                    <li>Enables users to <b className="text-defaulttextcolor">boost APY on $BTG staking</b></li>
                                                                    <li>Can be burned to <b className="text-defaulttextcolor">offset carbon footprint</b></li>
                                                                </ul>
                                                                <p className="text-[0.75rem] mt-4">
                                                                    This initiative is projected to<b className="text-defaulttextcolor"> absorb 60,000 tCO₂</b> while restoring degraded soils and supporting <b className="text-defaulttextcolor"> MENA farmers.</b>
                                                                </p>


                                                            </div>
                                                            <div className="mb-0">
                                                                <p className="text-[.9375rem] mb-2 font-semibold">Collection composition :</p>
                                                                <p className="text-[0.75rem] text-[#8c9097] dark:text-white/50 opacity-[0.7] mb-0">
                                                                    Carbon Removed From Collection : <b className="text-defaulttextcolor">60K TCO2 - 20 years</b>                                                         </p>
                                                            </div>
                                                            <div className="bar-container">
                                                                <div className="bar">
                                                                    {nftDataChart.map((nft, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="bar-segment"
                                                                            style={{
                                                                                width: `${(nft.value / total) * 100}%`,
                                                                                backgroundColor: nft.color,
                                                                            }}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                                <div className="labels">
                                                                    {nftDataChart.map((nft, index) => (
                                                                        <div key={index} className="label">
                                                                            <div className="text">
                                                                                <div className="label-title">
                                                                                    <span className="dot" style={{ backgroundColor: nft.color }}></span>
                                                                                    <span className="nft-name">{nft.name} ({nft.land})</span>
                                                                                </div>
                                                                                <div className="value">{nft.value} plots</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>



                                                            </div>

                                                        </div>




                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xl:col-span-4 col-span-12">
                                            <div className="xl:col-span-4 lg:col-span-6 md:col-span-6 sm:col-span-12 col-span-12">
                                                <div className="box custom-box">
                                                    <div className="box-header">
                                                        <div className="box-title">
                                                            Tokenized Land
                                                        </div>
                                                    </div>
                                                    <div className="box-body">
                                                        <Swiper
                                                            effect={'cube'}
                                                            grabCursor={true}
                                                            cubeEffect={{ shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 }}
                                                            speed={1000}
                                                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                                                            pagination={{ clickable: true }}
                                                            modules={[EffectCube, Pagination, Autoplay]}
                                                            className="mySwiper swiper swiper-effect-cube"
                                                            style={{ height: "352px", minHeight: "300px" }} // Fix the height
                                                        >

                                                            <SwiperSlide>
                                                                <img src="../../assets/images/apps/100m2F.jpg" alt="img" />
                                                            </SwiperSlide>
                                                            <SwiperSlide>
                                                                <img src="../../assets/images/apps/500m2F.jpg" alt="img" />
                                                            </SwiperSlide>
                                                            <SwiperSlide>
                                                                <img src="../../assets/images/apps/1000m2F.jpg" alt="img" />
                                                            </SwiperSlide>
                                                        </Swiper>
                                                        <div className="grid mt-8">
                                                            <Link href="/mint/" className="ti-btn bg-secondary  text-white !font-medium !mb-2 !mt-4">Mint Plot</Link>
                                                            <Link href="https://opensea.io/collection/bitgrass-nft/overview" target="_blank" rel="noopener noreferrer" className="ti-btn bg-camel10  !font-medium">Discover</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div
                                    id="market-tab-pane"
                                    className={`hs-tab-content tab-pane !p-0 !border-0 ${activeTab === 'market' ? 'show active' : 'hidden'}`}
                                    role="tabpanel"
                                >
                                    {/* Market Content */}
                                    {/* ... Your Market content ... */}
                                    <div className="grid grid-cols-12 gap-x-6">
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="box">
                                                <div className="box-body">

                                                    <div className="flex align-items-center">
                                                        <span className="avatar avatar-xxl !rounded-full">
                                                            <img src="../../../assets/images/brand-logos/coin-bitgrass.svg" className="!rounded-full img-fluid" alt="Avatar" />
                                                        </span>
                                                        <div className="ms-3 mt-3">
                                                            <h5 className="font-bold mb-0 sm:flex items-center">
                                                                <Link href="#!" scroll={false}>Bitgrass - <span className='font-normal text-[#8c9097] dark:text-white/50'>BTG</span></Link>
                                                            </h5>
                                                            <p className="text-[1rem] text-secondary font-semibold mb-4">${degenPrice} USD</p>

                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center text-[#8c9097] dark:text-white/50">
                                                        <div className="popular-tags mt-6 d-flex align-items-center">
                                                            <div className="d-flex align-items-center">
                                                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                                    <img
                                                                        src="../../assets/images/faces/base-second-logo.png"
                                                                        style={{ width: '15px', height: '15px', marginRight: '5px', verticalAlign: 'middle' }}
                                                                        alt=""
                                                                    />
                                                                    Base : TBA
                                                                </span>                                                          <div className="hs-tooltip ti-main-tooltip [--placement:top] ms-2">
                                                                    <button
                                                                        type="button"
                                                                        className="hs-tooltip-toggle btn btn-link p-0 text-primary"
                                                                        onClick={handleCopy}
                                                                    >
                                                                        <i className="bx bx-copy"></i>
                                                                        <span
                                                                            className="hs-tooltip-content ti-main-tooltip-content !py-1 !px-2 !bg-primary !text-xs !font-medium !text-white shadow-sm dark:bg-slate-700"
                                                                            role="tooltip"
                                                                        >
                                                                            {tooltipText}
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="team-member-stats sm:flex items-center justify-evenly mt-4 ">
                                                        <div className="w-full">
                                                            <p className="font-semibold mb-0">Official Links</p>
                                                            <span className="avatar-list-stacked">
                                                                {/* OFFICIAL LINKS — CLICKABLE */}
                                                                <a
                                                                    href="https://etherscan.io"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons"
                                                                >
                                                                    <img src="../../assets/images/svg/etherscan.svg" className="w-[15px] h-[15px]" />
                                                                </a>
                                                                <a
                                                                    href="https://bitgrass.com"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons"
                                                                >
                                                                    <img src="../../assets/images/svg/internet.svg" className="w-[15px] h-[15px]" />
                                                                </a>
                                                                <a
                                                                    href="https://x.com/Bitgrass"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons"
                                                                >
                                                                    <img src="../../assets/images/svg/x.svg" className="w-[15px] h-[15px]" />
                                                                </a>
                                                                <a
                                                                    href="http://t.me/Bitgrass"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons"
                                                                >
                                                                    <img src="../../assets/images/svg/telegram.svg" className="w-[15px] h-[15px]" />
                                                                </a>
                                                                <a
                                                                    href="https://linkedin.com/company/bitgrass"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons"
                                                                >
                                                                    <img src="../../assets/images/svg/linkedin.svg" className="w-[15px] h-[15px]" />
                                                                </a>
                                                            </span>
                                                        </div>

                                                        {/* TRACKERS — NOT CLICKABLE */}
                                                        <div className="w-full">
                                                            <p className="font-semibold mb-0">Trackers</p>
                                                            <span className="avatar-list-stacked text-gray-400 opacity-50 pointer-events-none">
                                                                <div className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons">
                                                                    <img src="../../assets/images/svg/coingecko.svg" className="w-[15px] h-[15px]" />
                                                                </div>
                                                                <div className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons">
                                                                    <img src="../../assets/images/svg/coinmarketcap.svg" className="w-[15px] h-[15px]" />
                                                                </div>
                                                            </span>
                                                        </div>

                                                        {/* EXCHANGE — NOT CLICKABLE */}
                                                        <div className="w-full">
                                                            <p className="font-semibold mb-0">Exchange</p>
                                                            <span className="avatar-list-stacked text-gray-400 opacity-50 pointer-events-none">
                                                                <div className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons">
                                                                    <img src="../../assets/images/svg/coinbase.svg" className="w-[15px] h-[15px] " />
                                                                </div>
                                                                <div className="avatar avatar-sm avatar-rounded flex items-center justify-center bg-icons">
                                                                    <img src="../../assets/images/svg/binance.svg" className="w-[15px] h-[15px]" />
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="box">
                                                <div className="box-header justify-between flex-wrap">
                                                    <div className="box-title">$BTG Chart</div>

                                                </div>
                                                <div className="box-body !p-0">
                                                    <div id="crypto" className="p-4">
                                                        <div className="tradingview-widget-container mb-1" ref={container}>
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
                                                            <SwapToast />
                                                        </Swap>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="grid grid-cols-12 gap-6">
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="box custom-box">
                                                <div className="box-body !p-0">
                                                    <div className="box-header">
                                                        <h5 className="box-title">Market Stats</h5>
                                                    </div>
                                                    <div className="grid grid-cols-12 gap-x-6">
                                                        <div className="xl:col-span-4 col-span-12 border-e border-dashed dark:border-defaultborder/10">
                                                            <div className="flex flex-wrap items-start p-6">
                                                                <div className="me-4 leading-none">
                                                                    <span className="avatar avatar-md !rounded-full !bg-camel10 shadow-sm">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                            style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                            <path d="M5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2M5 5h14v14H5z"></path><path d="m13.2 11.6-3-2-3.05 4.87 1.7 1.06 1.95-3.13 3 2 3.05-4.87-1.7-1.06z"></path>
                                                                        </svg>                                                                    </span>
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h5 className="font-semibold ">{formatLargeValue(degenPrice * 10000000)}</h5>
                                                                    <p className="text-[#8c9097] dark:text-white/50 mb-0 text-[0.75rem]">Market Cap</p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className="xl:col-span-4 col-span-12 border-e border-dashed dark:border-defaultborder/10">
                                                            <div className="flex flex-wrap items-start p-6">
                                                                <div className="me-3 leading-none">
                                                                    <span className="avatar avatar-md !rounded-full bg-camel10 shadow-sm">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                            style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                            <path d="M6 16h1v6h2v-6h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H9V2H7v6H6c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1m1-6h2v4H7zM14 19h1v3h2v-3h1c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1h-1V2h-2v3h-1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1m1-12h2v10h-2z"></path>
                                                                        </svg>                                                                    </span>
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h5 className="font-semibold ">{h24Volume || "TBA"}</h5>
                                                                    <p className="text-[#8c9097] dark:text-white/50 mb-0 text-[0.75rem]">24h Volume</p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className="xl:col-span-4 col-span-12 border-e border-dashed dark:border-defaultborder/10">
                                                            <div className="flex flex-wrap items-start p-6">
                                                                <div className="me-3 leading-none">
                                                                    <span className="avatar avatar-md !rounded-full bg-camel10 shadow-sm">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                            style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                            <path d="M12 6C7.03 6 2 7.55 2 10.5v5C2 18.45 7.03 20 12 20s10-1.55 10-4.5v-5C22 7.55 16.97 6 12 6m-8 9.5v-2.2c.58.34 1.25.62 2 .86v2.88c-1.31-.51-2-1.13-2-1.54m12-.85v2.97c-.87.18-1.87.31-3 .36v-3c1.03-.04 2.04-.16 3-.33m-5 .33v3c-1.13-.05-2.13-.18-3-.36v-2.97c.96.17 1.97.29 3 .33m7 2.07v-2.88c.75-.24 1.42-.52 2-.86v2.2c0 .42-.69 1.03-2 1.54m-6-4.04c-5.18 0-8-1.65-8-2.5s2.82-2.5 8-2.5 8 1.65 8 2.5-2.82 2.5-8 2.5"></path>
                                                                        </svg>                                                                    </span>
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h5 className="font-semibold ">10M BTG</h5>
                                                                    <p className="text-[#8c9097] dark:text-white/50 mb-0 text-[0.75rem]">Circulating Supply</p>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-x-6">

                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="box custom-box">
                                                <div className="box-header justify-between flex">
                                                    <div className="box-title">
                                                        About $BTG
                                                    </div>
                                                </div>
                                                <div className="box-body">
                                                    <div className="text-[.9375rem] font-semibold mb-2">Project Description :</div>
                                                    <p className="text-[#8c9097] dark:text-white/50 task-description">$BTG isn't just a token; it's the lifeblood of the Bitgrass ecosystem, fueling every aspect from NFT minting to carbon credit staking. Designed for maximum utility, $BTG powers all transactions, payments, and operations within our platform, ensuring a fluid and interconnected experience.</p>
                                                    <div className="text-[.9375rem] font-semibold my-2">As the key to unlocking all of Bitgrass's services, $BTG provides:</div>
                                                    <div className="mb-3">
                                                        <ul className="task-details-key-tasks ps-[2rem] mb-0">
                                                            <li> <b className="text-defaulttextcolor">Access:</b> Use $BTG to engage with tokenized real-world land plots, participate in carbon removal initiatives, and access detailed environmental impact reports.</li>
                                                            <li><b className="text-defaulttextcolor">Liquidity:</b> With listings on multiple exchanges, $BTG ensures your investment remains liquid and accessible, vital for both seasoned and new investors in the Web3 space.</li>
                                                            <li><b className="text-defaulttextcolor">Incentives:</b> Stake $BTG for rewards, earn from verified carbon credits, and benefit from a system where your financial investment directly translates to environmental impact.</li>

                                                        </ul>
                                                    </div>
                                                    <p className="text-[#8c9097] dark:text-white/50 task-description">With its multi-utility approach, $BTG is not just an asset; it's your gateway to a sustainable future, where every transaction helps rewild our planet. Embrace $BTG to be at the forefront of climate action and innovative investment."</p>

                                                </div>
                                                <div className="box-footer">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap mt-3">

                                                        <div>
                                                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.75rem]">Launch Date</span>
                                                            <span className="block text-[.875rem] font-semibold">July 01, 2025</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.75rem]">Live on</span>
                                                            <span className="block text-[.875rem] font-semibold">Base</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="xl:col-span-4 lg:col-span-4 md:col-span-12 col-span-12">
                                            <div className="box">
                                                <div className="box-header">
                                                    <div className="box-title">Total Tokens Locked</div>
                                                </div>
                                                <div className="box-body !p-6 flex justify-center items-center">
                                                    {/* Radial Chart Container */}
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            width: "100%",
                                                            maxWidth: "200px", // Ensure responsiveness
                                                            aspectRatio: "1 / 1", // Maintain a perfect circle
                                                        }}
                                                    >
                                                        {/* SVG Circle */}
                                                        <svg
                                                            height="100%"
                                                            width="100%"
                                                            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                                                            style={{ transform: "rotate(-90deg)" }}
                                                        >
                                                            {/* Background Circle */}
                                                            <circle
                                                                stroke="#f9f8f7"
                                                                fill="transparent"
                                                                strokeWidth={strokeWidth}
                                                                r={normalizedRadius}
                                                                cx={radius}
                                                                cy={radius}
                                                            />
                                                            {/* Foreground Circle */}
                                                            <circle
                                                                stroke="#7fc447"
                                                                fill="transparent"
                                                                strokeWidth={strokeWidth}
                                                                r={normalizedRadius}
                                                                cx={radius}
                                                                cy={radius}
                                                                strokeDasharray={circumference}
                                                                strokeDashoffset={strokeDashoffset}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>

                                                        {/* Percentage Text */}
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                fontSize: "1.25rem",
                                                                fontWeight: "bold",
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            {percentage}%
                                                            <br />
                                                            <p className="text-[#8c9097] dark:text-white/50 task-description">
                                                                of Total Supply  </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="box-footer !py-6 !px-4 !mt-2 justify-center items-center">
                                                    <div className="">
                                                        <div className="col p-0">
                                                            <div className="text-center">
                                                                <span className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-1 hrm-jobs-legend published inline-block ms-2">
                                                                    Tokens Locked
                                                                </span>
                                                                <div>
                                                                    <span className="text-[1rem] font-semibold">1,624</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Dashboard
