"use client";

import React, { Fragment, useState, useEffect } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { BrowserProvider, BigNumberish, BytesLike, Contract } from "ethers";
import { Transaction, TransactionButton } from "@coinbase/onchainkit/transaction";
import { Seaport } from "@opensea/seaport-js";
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';


import PurchaseCelebrationModal from "@/shared/layout-components/modal/PurchaseCelebrationModal"
import { custom } from "viem";

import {
    NFTCreator,
    NFTCollectionTitle,
    NFTQuantitySelector,
    NFTAssetCost,
    NFTMintButton,
} from "@coinbase/onchainkit/nft/mint";
import { NFTMedia } from "@coinbase/onchainkit/nft/view";
import { NFTMintCard } from "@coinbase/onchainkit/nft";
import { ethers } from "ethers";
import { set } from "date-fns";

type OrderData = {
    parameters: any;
    signature: string;
};

const Nftdetails = () => {
    const { isConnected } = useAccount();
    const { data: walletClient, isLoading: isWalletLoading } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();
    const [activeTab, setActiveTab] = useState("Standard 100m2 Plot");
    const tabList = ["Standard 100m2 Plot", "Premium 500m2 Plot", "Legendary 1000m2 Plot"];
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [txRequest, setTxRequest] = useState<{
        to: string;
        data: string;
        value: BigNumberish;
    } | null>(null);

    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [orderFetchError, setOrderFetchError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const OPENSEA_CONTRACT_ADDRESS = "0xc58e79f30b9a1575499da948932b8b16c23a4caf";
    const TOKEN_ID = "16";
    const sellerAddress = "0x4203cea1da19f04ca7b3228ebf4041bd54eea48f";
    const OPENSEA_CONDUIT = "0xa26b00c1f0df003000390027140000faa7190000";
    const ERC721_ABI = [
        "function ownerOf(uint256 tokenId) external view returns (address)",
        "function getApproved(uint256 tokenId) external view returns (address)"
    ];
    const [listedLegendaryItems, setListedLegendaryItems] = useState<any[]>([]);
    const [listedPremiumItems, setListedPremiumItems] = useState<any[]>([]);
    const [modalData, setModalData] = useState({
        id: "",
        image: "",
        name: ""
    })
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const sortedPremiumItems = [...listedPremiumItems].sort((a: any, b: any) =>
        parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
        parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    );

    const sortedLegendaryItems = [...listedLegendaryItems].sort((a: any, b: any) =>
        parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
        parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    );

    const [lastBoughtLegendaryId, setLastBoughtLegendaryId] = useState(0);
    const [lastBoughtPremiumId, setLastBoughtPremiumId] = useState(0);


    // const itemsToBuy = sortedItems.slice(0, selectedQuantity);
    //  const prepareBuyMultiple = async () => {
    //     try {
    //        for (const item of itemsToBuy) {
    //           await handleBuy(item); // Or batch this in a multi-call if supported
    //       }
    //} catch (err) {
    //       console.error("Buy failed", err);
    //    }
    //  };
    // useEffect(() => {
    //     async function fetchListedLegendaryItems() {
    //         if (!walletClient || !isConnected) return;

    //         const rawRanges = [
    //             { start: 1, end: 20 },
    //             { start: 21, end: 40 },
    //             { start: 41, end: 60 },
    //             { start: 61, end: 80 },
    //             { start: 81, end: 100 },
    //             { start: 101, end: 120 },
    //             { start: 121, end: 140 },
    //             { start: 141, end: 160 },
    //             { start: 161, end: 180 },
    //             { start: 181, end: 200 },
    //             { start: 201, end: 220 },
    //             { start: 221, end: 240 },
    //             { start: 241, end: 260 },
    //             { start: 261, end: 280 },
    //             { start: 281, end: 300 },
    //             { start: 301, end: 320 },
    //             { start: 321, end: 340 },
    //             { start: 341, end: 360 },
    //             { start: 361, end: 380 },
    //             { start: 381, end: 400 }
    //         ];

    //         let skip = true;

    //         for (const range of rawRanges) {
    //             // Adjust only the first range that includes the bought ID
    //             let adjustedStart = range.start;
    //             if (skip && lastBoughtLegendaryId >= range.start && lastBoughtLegendaryId < range.end) {
    //                 adjustedStart = lastBoughtLegendaryId + 1;
    //                 skip = false;
    //             } else if (lastBoughtLegendaryId >= range.end) {
    //                 continue;
    //             }

    //             try {
    //                 const res = await fetch(`/api/listings?start=${adjustedStart}&end=${range.end}`);
    //                 const data = await res.json();
    //                 const orders = data.orders || [];

    //                 if (orders.length > 0) {
    //                     const sorted = orders
    //                         .filter((item: any) => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria)
    //                         .sort((a: any, b: any) =>
    //                             parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
    //                             parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    //                         );

    //                     setListedLegendaryItems(sorted);
    //                     return;
    //                 }
    //             } catch (err) {
    //                 console.error(`Failed to fetch legendary listings (${range.start}-${range.end}):`, err);
    //                 return;
    //             }
    //         }

    //         console.log("All Legendary NFTs are bought");
    //         setListedLegendaryItems([]);
    //     }
    //     fetchListedLegendaryItems()
    // }, [walletClient, isConnected, isModalOpen]);


    const rangesLegendary = [
        { start: 1, end: 20 },
        { start: 21, end: 40 },
        { start: 41, end: 60 },
        { start: 61, end: 80 },
        { start: 81, end: 100 },
        { start: 101, end: 120 },
        { start: 121, end: 140 },
        { start: 141, end: 160 },
        { start: 161, end: 180 },
        { start: 181, end: 200 },
        { start: 201, end: 220 },
        { start: 221, end: 240 },
        { start: 241, end: 260 },
        { start: 261, end: 280 },
        { start: 281, end: 300 },
        { start: 301, end: 320 },
        { start: 321, end: 340 },
        { start: 341, end: 360 },
        { start: 361, end: 380 },
        { start: 381, end: 400 }
    ];

    const rangesPremium = [
        { start: 401, end: 420 },
        { start: 421, end: 440 },
        { start: 441, end: 460 },
        { start: 461, end: 480 },
        { start: 481, end: 500 },
        { start: 501, end: 520 },
        { start: 521, end: 540 },
        { start: 541, end: 560 },
        { start: 561, end: 580 },
        { start: 581, end: 600 },
        { start: 601, end: 620 },
        { start: 621, end: 640 },
        { start: 641, end: 660 },
        { start: 661, end: 680 },
        { start: 681, end: 700 },
        { start: 701, end: 720 },
        { start: 721, end: 740 },
        { start: 741, end: 760 },
        { start: 761, end: 780 },
        { start: 781, end: 800 },
        { start: 801, end: 820 },
        { start: 821, end: 840 },
        { start: 841, end: 860 },
        { start: 861, end: 880 },
        { start: 881, end: 900 },
        { start: 901, end: 920 },
        { start: 921, end: 940 },
        { start: 941, end: 960 },
        { start: 961, end: 980 },
        { start: 981, end: 1000 },
        { start: 1001, end: 1020 },
        { start: 1021, end: 1040 },
        { start: 1041, end: 1060 },
        { start: 1061, end: 1080 },
        { start: 1081, end: 1100 },
        { start: 1101, end: 1120 },
        { start: 1121, end: 1140 },
        { start: 1141, end: 1160 },
        { start: 1161, end: 1180 },
        { start: 1181, end: 1200 }
    ];


    async function fetchListedLegendaryItems(adjustedRanges: any, startId: any) {
        if (!walletClient || !isConnected) return;

        for (const range of adjustedRanges) {
            // Adjust the start of the first range to startId if it's within this range
            const effectiveStart = range === adjustedRanges[0] && startId > range.start ? startId : range.start;
            try {
                const res = await fetch(`/api/listings?start=${effectiveStart}&end=${range.end}`);
                const data = await res.json();
                const orders = data.orders || [];
                console.log(`Legendary orders (${effectiveStart}-${range.end}):`, orders);

                if (orders.length > 0) {
                    const sorted = [...orders]
                        .filter(
                            (item: any) => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria
                        )
                        .sort(
                            (a: any, b: any) =>
                                parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
                                parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
                        );

                    console.log(`Legendary sorted (${effectiveStart}-${range.end}):`, sorted);
                    setListedLegendaryItems(sorted);
                    return; // Exit after finding non-empty range
                }
            } catch (err) {
                console.error(`Failed to fetch legendary listings (${effectiveStart}-${range.end}):`, err);
                return; // Exit on error
            }
        }

        console.log("All NFTs are bought");
        setListedLegendaryItems([]);
    }

    useEffect(() => {
        fetchListedLegendaryItems(rangesLegendary, 1);
    }, [walletClient, isConnected]);


    useEffect(() => {
        if (!isModalOpen) return; // Only fetch when isModalOpen becomes true

        const nextId = lastBoughtLegendaryId + 1; // Start from the next ID (e.g., 182 for 181)
        const startRangeIndex = rangesLegendary.findIndex(
            range => nextId >= range.start && nextId <= range.end
        );

        const adjustedRanges = startRangeIndex !== -1
            ? rangesLegendary.slice(startRangeIndex)
            : rangesLegendary;

        console.log("adjustedRanges----", adjustedRanges);

        fetchListedLegendaryItems(adjustedRanges, nextId);
    }, [isModalOpen, lastBoughtLegendaryId]);

    // useEffect(() => {
    //     async function fetchListedPremiumItems() {
    //         if (!walletClient || !isConnected) return;

    //         const rawRanges = [
    //             { start: 401, end: 420 },
    //             { start: 421, end: 440 },
    //             { start: 441, end: 460 },
    //             { start: 461, end: 480 },
    //             { start: 481, end: 500 },
    //             { start: 501, end: 520 },
    //             { start: 521, end: 540 },
    //             { start: 541, end: 560 },
    //             { start: 561, end: 580 },
    //             { start: 581, end: 600 },
    //             { start: 601, end: 620 },
    //             { start: 621, end: 640 },
    //             { start: 641, end: 660 },
    //             { start: 661, end: 680 },
    //             { start: 681, end: 700 },
    //             { start: 701, end: 720 },
    //             { start: 721, end: 740 },
    //             { start: 741, end: 760 },
    //             { start: 761, end: 780 },
    //             { start: 781, end: 800 },
    //             { start: 801, end: 820 },
    //             { start: 821, end: 840 },
    //             { start: 841, end: 860 },
    //             { start: 861, end: 880 },
    //             { start: 881, end: 900 },
    //             { start: 901, end: 920 },
    //             { start: 921, end: 940 },
    //             { start: 941, end: 960 },
    //             { start: 961, end: 980 },
    //             { start: 981, end: 1000 },
    //             { start: 1001, end: 1020 },
    //             { start: 1021, end: 1040 },
    //             { start: 1041, end: 1060 },
    //             { start: 1061, end: 1080 },
    //             { start: 1081, end: 1100 },
    //             { start: 1101, end: 1120 },
    //             { start: 1121, end: 1140 },
    //             { start: 1141, end: 1160 },
    //             { start: 1161, end: 1180 },
    //             { start: 1181, end: 1200 }
    //         ];

    //         let skip = true;

    //         for (const range of rawRanges) {
    //             let adjustedStart = range.start;
    //             if (skip && lastBoughtPremiumId >= range.start && lastBoughtPremiumId < range.end) {
    //                 adjustedStart = lastBoughtPremiumId + 1;
    //                 skip = false;
    //             } else if (lastBoughtPremiumId >= range.end) {
    //                 continue;
    //             }

    //             try {
    //                 const res = await fetch(`/api/listings?start=${adjustedStart}&end=${range.end}`);
    //                 const data = await res.json();
    //                 const orders = data.orders || [];

    //                 if (orders.length > 0) {
    //                     const sorted = orders
    //                         .filter((item: any) => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria)
    //                         .sort((a: any, b: any) =>
    //                             parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
    //                             parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    //                         );

    //                     setListedPremiumItems(sorted);
    //                     return;
    //                 }
    //             } catch (err) {
    //                 console.error(`Failed to fetch premium listings (${range.start}-${range.end}):`, err);
    //                 return;
    //             }
    //         }

    //         console.log("All Premium NFTs are bought");
    //         setListedPremiumItems([]);
    //     }

    //     fetchListedPremiumItems();
    // }, [walletClient, isConnected, isModalOpen]);
    async function fetchListedPremiumItems(adjustedRanges: any, startId: any) {
        if (!walletClient || !isConnected) return;

        for (const range of adjustedRanges) {
            // Adjust the start of the first range to startId if it's within this range
            const effectiveStart = range === adjustedRanges[0] && startId > range.start ? startId : range.start;
            try {
                const res = await fetch(`/api/listings?start=${effectiveStart}&end=${range.end}`);
                const data = await res.json();
                const orders = data.orders || [];
                console.log(`Premium orders (${effectiveStart}-${range.end}):`, orders);

                if (orders.length > 0) {
                    const sorted = [...orders]
                        .filter(
                            (item: any) => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria
                        )
                        .sort(
                            (a: any, b: any) =>
                                parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
                                parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
                        );

                    console.log(`Premium sorted (${effectiveStart}-${range.end}):`, sorted);
                    setListedPremiumItems(sorted);
                    return; // Exit after finding non-empty range
                }
            } catch (err) {
                console.error(`Failed to fetch premium listings (${effectiveStart}-${range.end}):`, err);
                return; // Exit on error
            }
        }

        console.log("All premium NFTs are bought");
        setListedPremiumItems([]);
    }

    useEffect(() => {
        fetchListedPremiumItems(rangesPremium, 401);
    }, [walletClient, isConnected]);


    useEffect(() => {
        if (!isModalOpen) return; // Only fetch when isModalOpen becomes true

        const nextId = lastBoughtPremiumId + 1; // Start from the next ID (e.g., 402 for 401)
        const startRangeIndex = rangesPremium.findIndex(
            range => nextId >= range.start && nextId <= range.end
        );

        const adjustedRanges = startRangeIndex !== -1
            ? rangesPremium.slice(startRangeIndex)
            : rangesPremium;

        console.log("adjustedRanges----", adjustedRanges);

        fetchListedPremiumItems(adjustedRanges, nextId);
    }, [isModalOpen, lastBoughtPremiumId]);

    async function handleBuy(order: any, tier: "Legendary" | "Premium") {
        console.log("Order:", order);
        if (!walletClient) return;

        try {
            const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
            const buyerAddress = walletClient.account.address;

            const currentChainId = await walletClient.getChainId();
            const baseChainId = 8453;

            if (currentChainId !== baseChainId) {
                try {
                    await switchChainAsync({ chainId: baseChainId });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await walletClient.addChain({ chain: base });
                        await switchChainAsync({ chainId: baseChainId });
                    } else {
                        throw switchError;
                    }
                }
            }

            const fulfillmentRes = await fetch("https://api.opensea.io/api/v2/listings/fulfillment_data", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "x-api-key": "6bc6c7e387ea43f2ade2a3a7202967f0",
                },
                body: JSON.stringify({
                    listing: {
                        hash: order.order_hash,
                        chain: "base",
                        protocol_address: order.protocol_address,
                    },
                    fulfiller: { address: buyerAddress },
                }),
            });

            const { fulfillment_data } = await fulfillmentRes.json();
            if (!fulfillment_data?.orders?.length) throw new Error("Invalid fulfillment data");

            const fullOrder = fulfillment_data.orders[0];
            const { parameters, signature } = fullOrder;

            const seaport = new Seaport(provider, {
                overrides: { contractAddress: order.protocol_address },
            });

            const advancedOrder = {
                parameters,
                signature,
                numerator: BigInt(1),
                denominator: BigInt(1),
                extraData: "0x",
            };

            const value = parameters.consideration
                .filter((item: any) => item.token === "0x0000000000000000000000000000000000000000")
                .reduce((sum: bigint, item: any) => sum + BigInt(item.startAmount), BigInt(0));

            const calldata = seaport.contract.interface.encodeFunctionData("fulfillAdvancedOrder", [
                advancedOrder,
                [],
                parameters.conduitKey,
                buyerAddress,
            ]);

            const txHash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: seaport.contract.target as `0x${string}`,
                value,
                data: calldata as `0x${string}`,
            });

            console.log("✅ Purchase Tx Hash:", txHash);

            const boughtId = parseInt(order.protocol_data.parameters.offer[0].identifierOrCriteria);
            if (tier === "Legendary") setLastBoughtLegendaryId(boughtId);
            if (tier === "Premium") setLastBoughtPremiumId(boughtId);


            const modalData: any = await getModalData();
            setModalData(modalData);
            setModalOpen(true);
        } catch (error) {
            console.error("❌ Purchase failed:", error);
        }
    }


    useEffect(() => {
        async function fetchOpenSeaOrder() {
            if (!walletClient || !isConnected) {
                console.log("Wallet client not ready, skipping fetch...");
                return;
            }

            setIsFetchingOrder(true);
            setOrderFetchError(null);

            try {
                const listingApiUrl = `https://api.opensea.io/api/v2/orders/base/seaport/listings?asset_contract_address=${OPENSEA_CONTRACT_ADDRESS}&token_ids=${TOKEN_ID}&limit=1`;

                const listingRes = await fetch(listingApiUrl, {
                    method: "GET",
                    headers: {
                        "accept": "application/json",
                        "x-api-key": "6bc6c7e387ea43f2ade2a3a7202967f0",
                    },
                });

                if (!listingRes.ok) {
                    throw new Error(`OpenSea listing API error: ${listingRes.status}`);
                }

                const listingData = await listingRes.json();
                const sellOrder = listingData.orders?.[0];
                if (!sellOrder) {
                    setOrderFetchError("No sell order found on OpenSea for this NFT.");
                    return;
                }

                const { order_hash, protocol_address } = sellOrder;

                const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner(walletClient.account.address);
                const fulfillerAddress = await signer.getAddress();

                const fulfillmentRes = await fetch("https://api.opensea.io/api/v2/listings/fulfillment_data", {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "content-type": "application/json",
                        "x-api-key": "6bc6c7e387ea43f2ade2a3a7202967f0",
                    },
                    body: JSON.stringify({
                        listing: {
                            hash: order_hash,
                            chain: "base",
                            protocol_address: protocol_address,
                        },
                        fulfiller: {
                            address: fulfillerAddress,
                        },
                    }),
                });

                if (!fulfillmentRes.ok) {
                    throw new Error(`OpenSea fulfillment API error: ${fulfillmentRes.status}`);
                }

                const fulfillmentDataJson = await fulfillmentRes.json();
                const fulfillmentData = fulfillmentDataJson.fulfillment_data;
                const fullOrder = fulfillmentData.orders?.[0];

                if (!fullOrder || !fullOrder.parameters || !fullOrder.signature) {
                    throw new Error("Invalid fulfillment data: missing order parameters or signature.");
                }

                setOrderData({
                    parameters: fullOrder.parameters,
                    signature: fullOrder.signature,
                });

            } catch (err: any) {
                console.error("Fetch OpenSea order failed:", err);
                setOrderFetchError(err.message || "Unknown error");
            } finally {
                setIsFetchingOrder(false);
            }
        }

        fetchOpenSeaOrder();
    }, [walletClient, isConnected]);

    async function prepareBuy() {
        if (!walletClient || !isConnected) {
            console.error("❌ Wallet client not ready");
            return;
        }

        try {
            const tokenAddress = "0xd724f4604bfc25250f16f908d04d6e8cfd4aba4f";
            const tokenId = "16";

            // Step 1: Fetch the listing
            const listingApiUrl = `https://api.opensea.io/api/v2/orders/base/seaport/listings?asset_contract_address=${tokenAddress}&token_ids=${tokenId}&limit=1`;

            const listingRes = await fetch(listingApiUrl, {
                headers: {
                    accept: "application/json",
                    "x-api-key": "6bc6c7e387ea43f2ade2a3a7202967f0",
                },
            });

            if (!listingRes.ok) throw new Error(`Listing fetch failed: ${listingRes.status}`);
            const { orders } = await listingRes.json();
            const sellOrder = orders?.[0];
            if (!sellOrder) throw new Error("No sell order found.");

            const { order_hash, protocol_address } = sellOrder;

            // Step 2: Fulfillment data
            const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
            const signer = await provider.getSigner(walletClient.account.address);
            const buyerAddress = await signer.getAddress();

            const fulfillmentRes = await fetch("https://api.opensea.io/api/v2/listings/fulfillment_data", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "x-api-key": "6bc6c7e387ea43f2ade2a3a7202967f0",
                },
                body: JSON.stringify({
                    listing: {
                        hash: order_hash,
                        chain: "base",
                        protocol_address,
                    },
                    fulfiller: {
                        address: buyerAddress,
                    },
                }),
            });

            if (!fulfillmentRes.ok) throw new Error(`Fulfillment fetch failed: ${fulfillmentRes.status}`);
            const fulfillmentData = await fulfillmentRes.json();
            const orderData = fulfillmentData?.fulfillment_data?.orders?.[0];
            const { parameters, signature } = orderData;

            const seaport = new Seaport(signer, {
                overrides: {
                    contractAddress: protocol_address,
                },
            });

            // Create the Advanced Order
            const advancedOrder = {
                parameters,
                signature,
                numerator: BigInt(1),
                denominator: BigInt(1),
                extraData: "0x",
            };

            // Sum ETH value to send
            const value = parameters.consideration
                .filter((item: any) => item.token === "0x0000000000000000000000000000000000000000")
                .reduce((sum: bigint, item: any) => sum + BigInt(item.startAmount), BigInt(0));

            // Encode calldata
            const calldata = seaport.contract.interface.encodeFunctionData("fulfillAdvancedOrder", [
                advancedOrder,
                [], // criteriaResolvers
                parameters.conduitKey,
                buyerAddress,
            ]);

            // Send transaction
            const tx = await signer.sendTransaction({
                to: seaport.contract.target,
                data: calldata,
                value,
            });

            console.log("✅ Transaction sent:", tx.hash);
        } catch (error: any) {
            console.error("❌ Direct purchase failed:", error.message || error);
        }
    }

    const getModalData = () => {
        let currentItem;

        if (activeTab === "Premium 500m2 Plot" && sortedPremiumItems.length > 0) {
            currentItem = sortedPremiumItems[0];
            return {
                id: currentItem.protocol_data.parameters.offer[0].identifierOrCriteria.toString(),
                image: "/assets/images/apps/500m2.jpg",
                name: "Bitgrass - Premium Collection"
            };
        }

        if (activeTab === "Legendary 1000m2 Plot" && sortedLegendaryItems.length > 0) {
            currentItem = sortedLegendaryItems[0];
            return {
                id: currentItem.protocol_data.parameters.offer[0].identifierOrCriteria.toString(),
                image: "/assets/images/apps/1000m2.jpg",
                name: "Bitgrass - Legendary Collection"
            };
        }

        return {
            id: "0",
            image: "/assets/images/apps/100m2.jpg",
            name: "Bitgrass NFT Collection – Standard"
        };
    };





    return (
        <Fragment>
            <Seo title={"NFT Details"} />
            <div className="container">
                <div className="container">
                    {/* Tabs Header */}
                    <div className="flex gap-4 mt-6 p-[1.25rem]">
                        {tabList.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm px-4 py-2 font-semibold ${activeTab === tab
                                    ? "border-b-2 border-primary text-primary"
                                    : ""
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Unique Content Per Tab */}
                    {activeTab === "Standard 100m2 Plot" && (
                        <div className="mt-6">{
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>
                                                <NFTMintCard
                                                    contractAddress='0xc58e79f30b9a1575499da948932b8b16c23a4caf'
                                                    className="mintNFT">
                                                    <NFTCreator />


                                                    <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src="../../assets/images/apps/100m2.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>

                                                    <p className="text-[1.5rem] font-bold mb-0">Bitgrass</p>
                                                    <NFTQuantitySelector />
                                                    <NFTAssetCost />
                                                    <NFTMintButton />
                                                </NFTMintCard>

                                            </div>
                                        </div>

                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Standard
                                                </p>
                                                <p className="text-[1.125rem] mb-4">
                                                    <i className="ri-circle-fill text-success align-middle"></i>
                                                    <span className="font-semibold dark:text-white/50">
                                                        <Link className="text-[0.875rem] ms-2" href="#!" scroll={false}>
                                                            Live on July 1, 2025
                                                        </Link>
                                                    </span>
                                                </p>

                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Price</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            TBA
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Creator</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/faces/faviconDark.png" alt="" />
                                                            </span>
                                                            Bitgrass
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-5 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Published</p>
                                                        <span className="block font-semibold mt-2">Soon</span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-[.9375rem] font-semibold mb-1">Description :</p>
                                                    <p>
                                                        <b>Discover the Bitgrass NFT </b>—a <b>Tokenized 100 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        This NFT offers multiple utilities: Boost your $BTG APY, earn Carbon credits or $BTG by staking your Landplot, or choose to burn it to offset your carbon footprint. Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path><path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path><path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path><path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path><path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path><path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path><path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Community Governance</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>



                                                <div>
                                                    <p className="text-[.9375rem] font-semibold mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Standard</td></tr>
                                                                <tr><th className="font-semibold text-start">Total Supply</th><td>2000 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>100 m² (each NFT corresponds to a real land plot)</td></tr>
                                                                <tr><th className="font-semibold text-start">Utility</th><td>Stake to earn carbon credits or $BTG / Burn to offset your carbon footprint</td></tr>
                                                                <tr><th className="font-semibold text-start">Carbon removal Potential</th><td>up to 0.1 TCO2</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }</div>
                    )}

                    {activeTab === "Premium 500m2 Plot" && (
                        <div className="mt-6">{
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>
                                                <NFTMintCard
                                                    contractAddress='0x477ea15de5e4e9c884c1cc92da3198d333ea85fb'
                                                    className="mintNFT">
                                                    <NFTCreator />


                                                    <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src="../../assets/images/apps/500m2.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>

                                                    <p className="text-[1.5rem] font-bold mb-0">Bitgrass</p>
                                                    <NFTQuantitySelector />
                                                    <NFTAssetCost />

                                                    <button
                                                        onClick={() => handleBuy(listedPremiumItems[0], "Premium")}
                                                        className="bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm"

                                                    >
                                                        Buy Now
                                                    </button>


                                                </NFTMintCard>

                                            </div>
                                        </div>

                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Premium
                                                </p>
                                                <p className="text-[1.125rem] mb-4">
                                                    <i className="ri-circle-fill text-success align-middle"></i>
                                                    <span className="font-semibold dark:text-white/50">
                                                        <Link className="text-[0.875rem] ms-2" href="#!" scroll={false}>
                                                            Live on July 1, 2025
                                                        </Link>
                                                    </span>
                                                </p>

                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Price</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            TBA
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Creator</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/faces/faviconDark.png" alt="" />
                                                            </span>
                                                            Bitgrass
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-5 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Published</p>
                                                        <span className="block font-semibold mt-2">Soon</span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-[.9375rem] font-semibold mb-1">Description :</p>
                                                    <p>
                                                        <b>Discover the Bitgrass NFT </b>—a <b>Tokenized 500 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        This NFT offers multiple utilities: Boost your $BTG APY, earn Carbon credits or $BTG by staking your Landplot, or choose to burn it to offset your carbon footprint. Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path><path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path><path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path><path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path><path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path><path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path><path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Community Governance</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>



                                                <div>
                                                    <p className="text-[.9375rem] font-semibold mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Premium</td></tr>
                                                                <tr><th className="font-semibold text-start">Total Supply</th><td>800 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>500 m² (each NFT corresponds to a real land plot)</td></tr>
                                                                <tr><th className="font-semibold text-start">Utility</th><td>Stake to earn carbon credits or $BTG / Burn to offset your carbon footprint</td></tr>
                                                                <tr><th className="font-semibold text-start">Carbon removal Potential</th><td>up to 0.5 TCO2</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }</div>

                    )}

                    {activeTab === "Legendary 1000m2 Plot" && (
                        <div className="mt-6"> <div className="mt-6">{
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>
                                                <NFTMintCard
                                                    contractAddress='0x477ea15de5e4e9c884c1cc92da3198d333ea85fb'
                                                    className="mintNFT">
                                                    <NFTCreator />


                                                    <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src="../../assets/images/apps/1000m2.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>

                                                    <p className="text-[1.5rem] font-bold mb-0">Bitgrass</p>
                                                    <NFTQuantitySelector />
                                                    <NFTAssetCost />

                                                    <button
                                                        onClick={() => handleBuy(listedLegendaryItems[0], "Legendary")}
                                                        className="bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm"

                                                    >
                                                        Buy Now
                                                    </button>


                                                </NFTMintCard>

                                            </div>
                                        </div>

                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Legendary
                                                </p>
                                                <p className="text-[1.125rem] mb-4">
                                                    <i className="ri-circle-fill text-success align-middle"></i>
                                                    <span className="font-semibold dark:text-white/50">
                                                        <Link className="text-[0.875rem] ms-2" href="#!" scroll={false}>
                                                            Live on July 1, 2025
                                                        </Link>
                                                    </span>
                                                </p>

                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Price</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            TBA
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Creator</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="../../../assets/images/faces/faviconDark.png" alt="" />
                                                            </span>
                                                            Bitgrass
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-5 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Published</p>
                                                        <span className="block font-semibold mt-2">Soon</span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-[.9375rem] font-semibold mb-1">Description :</p>
                                                    <p>
                                                        <b>Discover the Bitgrass NFT </b>—a <b>Tokenized 100 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        This NFT offers multiple utilities: Boost your $BTG APY, earn Carbon credits or $BTG by staking your Landplot, or choose to burn it to offset your carbon footprint. Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path><path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                        style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24" >
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path><path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path><path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path><path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path><path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path><path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Community Governance</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div>
                                                    <p className="text-[.9375rem] font-semibold mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Legendary</td></tr>
                                                                <tr><th className="font-semibold text-start">Total Supply</th><td>400 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>1000 m² (each NFT corresponds to a real land plot)</td></tr>
                                                                <tr><th className="font-semibold text-start">Utility</th><td>Stake to earn carbon credits or $BTG / Burn to offset your carbon footprint</td></tr>
                                                                <tr><th className="font-semibold text-start">Carbon removal Potential</th><td>up to 1.0 TCO2</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }</div></div>
                    )}
                </div>

                <PurchaseCelebrationModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setModalData({
                            id: "",
                            image: "",
                            name: ""
                        });
                    }}
                    name={modalData.name}
                    token="0xc58e79f30b9a1575499da948932b8b16c23a4caf"
                    id={modalData.id}
                    image={modalData.image}
                />




            </div>
        </Fragment>
    );

};

export default Nftdetails;
