"use client";

import React, { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Seaport } from "@opensea/seaport-js";
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { id } from 'ethers';
import axios from "axios";
import { EthInfo } from "@/shared/data/tokens/data";
import PurchaseCelebrationModal from "@/shared/layout-components/modal/PurchaseCelebrationModal";
import PurchaseFailedModal from "@/shared/layout-components/modal/PurchaseFailedModal";
import MintCelebrationModal from "@/shared/layout-components/modal/MintCelebrationModal";
import {
    NFTCreator,
    NFTCollectionTitle,
    NFTQuantitySelector,
    NFTAssetCost,
    NFTMintButton,
} from "@coinbase/onchainkit/nft/mint";
import { NFTMintCard } from "@coinbase/onchainkit/nft";
import { ethers } from "ethers";
import { nftInfo, SeaDropABIData, CONTRACT_ADDRESS_INFO, SEADROP_ADDRESS_INFO, SEADROP_CONDUIT_INFO } from "@/shared/data/tokens/data";
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { motion } from "framer-motion";

type OrderData = {
    parameters: any;
    signature: string;
};

interface NftdetailsProps {
    initialTabId: string;
}

const Nftdetails = ({ initialTabId }: NftdetailsProps) => {
    const CONTRACT_ADDRESS = CONTRACT_ADDRESS_INFO;
    const SEADROP_ADDRESS = SEADROP_ADDRESS_INFO;
    const SEADROP_CONDUIT = SEADROP_CONDUIT_INFO;
    const SeaDropABI = SeaDropABIData
    const [baseMintPriceEth, setBaseMintPriceEth] = useState<number>(0);
    const [ethToUsd, setEthToUsd] = useState<number>(0);
    const { ready, authenticated } = usePrivy();
    const { login } = useLogin();

    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [txHash, setTxHash] = useState("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [mintPriceEth, setMintPriceEth] = useState<string>("0");
    const [mintPriceUsd, setMintPriceUsd] = useState<string>("0.00");
    const { address: user } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();
    const [isMinting, setIsMinting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [toastTitle, setToastTitle] = useState<string | null>(null);
    const STATIC_MINT_PRICE_ETH = 0.00001; // adjust as needed

    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState("Standard 100m² Plot");
    const [activeTabSeo, setActiveTabSeo] = useState("NFT Collection – Standard");
    const tabList = ["Standard 100m² Plot", "Premium 500m² Plot", "Legendary 1000m² Plot"];
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [orderFetchError, setOrderFetchError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isStandardMintModalOpen, setIsStandardMintModalOpen] = useState(false);
    const [failureTxHash, setFailureTxHash] = useState("");
    const [failureImage, setFailureImage] = useState("");
    const OPENSEA_CONTRACT_ADDRESS = nftInfo.address;
    const TOKEN_ID = "16";
    const [listedLegendaryItems, setListedLegendaryItems] = useState<any[]>([]);
    const [listedPremiumItems, setListedPremiumItems] = useState<any[]>([]);
    const [isLoadingFetchAvailable, setIsLoadingFetchAvailable] = useState<boolean>(false)
    const [modalData, setModalData] = useState({
        id: "",
        image: "",
        name: ""
    });
    const sortedPremiumItems = [...listedPremiumItems].sort((a: any, b: any) =>
        parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
        parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    );
    const sortedLegendaryItems = [...listedLegendaryItems].sort((a: any, b: any) =>
        parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
        parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
    );
    const openseaAddress = process.env.NEXT_PUBLIC_OPENSEA_ADDRESS as string;
    const collection = process.env.NEXT_PUBLIC_OPENSEA_COLLECTION as string

    const apiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
    const [isFailureModalOpen, setFailureModalOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState(false)

    // Map tab IDs to tab names
    const tabIdToName: Record<string, string> = {
        standard: "Standard 100m² Plot",
        premium: "Premium 500m² Plot",
        legendary: "Legendary 1000m² Plot",
    };

    // Map tab IDs to SEO titles
    const tabIdToSeo: Record<string, string> = {
        standard: "NFT Collection – Standard",
        premium: "Premium Collection",
        legendary: "Legendary Collection",
    };

    // Set initial tab based on initialTabId
    useEffect(() => {
        const tabName = tabIdToName[initialTabId] || "Standard 100m² Plot";
        const seoName = tabIdToSeo[initialTabId] || "NFT Collection – Standard";
        setActiveTab(tabName);
        setActiveTabSeo(seoName);
    }, [initialTabId]);

    const handleMintAbi = async (quantity: number) => {
        try {
            setLoading(true);

            if (!walletClient || !ready || !authenticated) {
                login();
                return;
            }
            // ✅ Get address directly from walletClient
            const userAddress = walletClient.account.address;

            // ✅ Use public RPC to read mint price (fix for embedded wallets)
            const publicProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");
            const readSeaDrop = new ethers.Contract(SEADROP_ADDRESS, SeaDropABI, publicProvider);
            const publicDrop = await readSeaDrop.getPublicDrop(CONTRACT_ADDRESS);

            const mintPrice = publicDrop.mintPrice;
            const totalPrice = mintPrice * BigInt(quantity);
            console.log("✅ tx", CONTRACT_ADDRESS, SEADROP_CONDUIT, userAddress, quantity, totalPrice);

            // 🔐 Now create signer from the user's actual wallet to send the tx
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            const seaDrop = new ethers.Contract(SEADROP_ADDRESS, SeaDropABI, signer);
            const tx = await seaDrop.mintPublic(
                CONTRACT_ADDRESS,
                SEADROP_CONDUIT,
                userAddress,
                quantity,
                { value: totalPrice }
            );
            const receipt = await tx.wait();
            console.log("✅ Mint successful!");
            setTxHash(receipt.hash);

            // 3. Extract all Transfer events from your NFT contract
            const transferTopic = id("Transfer(address,address,uint256)");
            const mintedTokenIds: string[] = [];

            for (const log of receipt.logs) {
                if (
                    log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
                    log.topics[0] === transferTopic &&
                    log.topics.length === 4
                ) {
                    const tokenId = BigInt(log.topics[3]).toString();
                    mintedTokenIds.push(tokenId);
                }
            }

            // 4. Show modal with all token IDs
            if (mintedTokenIds.length > 0) {
                setModalData({
                    id: mintedTokenIds.join(", "), // "1896, 1897, 1898"
                    image: "/assets/images/apps/100m2.jpg",
                    name: `Bitgrass - Standard Collection`,
                });
                setIsStandardMintModalOpen(true);
            }

        } catch (error: any) {
            // Case 1: User rejected in wallet
            console.error("❌ Mint failed:", error);

            const rejected =
                error?.code === 4001 ||
                error?.message?.toLowerCase().includes("user rejected");

            if (rejected) {
                setToastTitle("Transaction Rejected");
                setToastMessage("You missed your plot.");
                setShowToast(true);
                return;
            }
            const insufficientFunds =
                error?.code === "INSUFFICIENT_FUNDS" ||
                error?.message?.toLowerCase().includes("insufficient funds");

            if (insufficientFunds) {
                setToastTitle("Insufficient Funds");
                setToastMessage("You need more ETH in your wallet to complete your mint.");
                setShowToast(true);

                return;
            }

            // Case 2: Smart contract custom error
            if (error?.data) {
                try {
                    const iface = new ethers.Interface(SeaDropABI);
                    const parsed = iface.parseError(error.data);
                    const errorName = parsed?.name;

                    switch (errorName) {
                        case "IncorrectPayment":
                            setToastMessage("Incorrect payment amount.");
                            break;
                        case "MintQuantityExceedsMaxSupply":
                            setToastTitle("Supply Reached");
                            setToastMessage("No more plots available.");
                            setShowToast(true);
                            break;
                        case "NotActive":
                            setToastMessage("Mint is not active right now.");
                            break;

                        default:
                            setToastMessage(`⚠️ Mint failed: ${errorName}`);
                    }

                    setShowToast(true);
                    return;
                } catch (parseError) {
                    console.error("Could not parse contract error:", parseError);
                }
            }


            setToastMessage("⚠️ Something went wrong. Please try again.");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const initPrices = async () => {
        try {

            const mintPriceEth = STATIC_MINT_PRICE_ETH;

            setBaseMintPriceEth(mintPriceEth);

            const usdRes = await axios.get(
                `https://deep-index.moralis.io/api/v2.2/erc20/${EthInfo.address}/price?chain=eth&include=percent_change`,
                {
                    headers: {
                        accept: "application/json",
                        "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APY_KEY!,
                    },
                }
            );
            setEthToUsd(usdRes.data.usdPrice);
        } catch (err) {
            console.error("initPrices failed:", err);
        }
    };

    useEffect(() => {
        if (walletClient) {
            initPrices();
        }
    }, [walletClient]);
    useEffect(() => {
        if (baseMintPriceEth > 0 && ethToUsd > 0) {
            const totalEth = baseMintPriceEth * quantity;
            setMintPriceEth(totalEth.toFixed(5));
            setMintPriceUsd((totalEth * ethToUsd).toFixed(2));
        }
    }, [quantity, baseMintPriceEth, ethToUsd]);




    async function fetchAvailableNfts() {
        setIsLoadingFetchAvailable(true)
        if (!walletClient || !isConnected || !apiKey) {
            console.log("Missing wallet client, connection, or API key, skipping fetch...");
            return;
        }

        const chain = "base";
        let legendaryNftDispo: any = [];
        let primaryNftDispo: any = [];
        let nextCursor = null;

        // Keep fetching until both legendary and premium NFTs are found or no more pages
        do {
            try {
                const url = new URL(`https://api.opensea.io/api/v2/listings/collection/${collection}/all`);
                url.searchParams.set("limit", "100");
                if (nextCursor) {
                    url.searchParams.set("next", nextCursor);
                }

                const res = await fetch(url.toString(), {
                    headers: {
                        accept: "application/json",
                        "x-api-key": apiKey,
                    },
                });

                if (!res.ok) {
                    console.error(`Failed to fetch NFTs: ${res.status}`);
                    break;
                }

                const data = await res.json();
                const nfts = data.listings || [];

                console.log("nfts----------", nfts)
                console.log("openseaAddress----------", openseaAddress)


                nextCursor = data.next || null;

                // Categorize NFTs into legendary and premium
                const newLegendary = nfts.flatMap((nft: any) => {



                    if (
                        nft.protocol_data.parameters.offerer.toLowerCase() === openseaAddress.toLowerCase() &&
                        parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria) >= 1 &&
                        parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria) <= 400
                    ) {
                        return [parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria)];
                    }
                    return [];
                });

                console.log("newLegendary-------" , newLegendary)


                const newPremium = nfts.flatMap((nft: any) => {
                    if (
                        nft.protocol_data.parameters.offerer.toLowerCase() === openseaAddress.toLowerCase() &&
                        parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria) >= 401 &&
                        parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria) <= 1200
                    ) {
                        return [parseInt(nft.protocol_data.parameters.offer[0].identifierOrCriteria)];
                    }
                    return [];
                });

                legendaryNftDispo = [...legendaryNftDispo, ...newLegendary];
                primaryNftDispo = [...primaryNftDispo, ...newPremium];

                console.log(`Fetched NFTs: Legendary (${legendaryNftDispo.length}), Premium (${primaryNftDispo.length})`);

                // Stop if both arrays have data
                if (legendaryNftDispo.length > 0 && primaryNftDispo.length > 0) {
                    console.log("Found NFTs for both legendary and premium, stopping fetch.");
                    break;
                }

            } catch (err) {
                console.error("Failed to fetch NFTs:", err);
                break;
            }
        } while (nextCursor);

        // Log final results
        if (legendaryNftDispo.length === 0) {
            console.log("No legendary NFTs found in range 1-400");
        }
        if (primaryNftDispo.length === 0) {
            console.log("No premium NFTs found in range 401-1200");
        }

        // Proceed to listings API for legendary NFTs if any
        if (legendaryNftDispo.length > 0) {
            await fetchListedLegendaryItems(legendaryNftDispo.sort((a:any, b:any) => a - b));
        } else {
            setListedLegendaryItems([]);
        }

        // Proceed to listings API for premium NFTs if any
        if (primaryNftDispo.length > 0) {
            await fetchListedPremiumItems(primaryNftDispo.sort((a:any, b:any) => a - b));
        } else {
            setListedPremiumItems([]);
        }

        setIsLoadingFetchAvailable(false)
    }

    async function fetchListedLegendaryItems(tokenIds: any) {
        if (!walletClient || !isConnected || !apiKey) {
            console.log("Missing wallet client, connection, or API key, skipping fetch...");
            return;
        }

        if (tokenIds.length === 0) {
            console.log("No legendary NFTs available to fetch listings");
            setListedLegendaryItems([]);
            return;
        }

        const firstTokenId = tokenIds[0]; // Use only the first token ID

        try {
            const url = new URL("https://api.opensea.io/api/v2/orders/base/seaport/listings");
            url.searchParams.set("asset_contract_address", OPENSEA_CONTRACT_ADDRESS);
            url.searchParams.set("limit", "50");
            url.searchParams.set("order_by", "created_date");
            url.searchParams.set("order_direction", "desc");
            url.searchParams.set("maker", openseaAddress.toLowerCase());
            url.searchParams.append("token_ids", firstTokenId.toString());

            const res = await fetch(url.toString(), {
                headers: {
                    accept: "application/json",
                    "x-api-key": apiKey,
                },
            });

            if (!res.ok) {
                console.error(`OpenSea fetch failed for legendary listing (token ID ${firstTokenId}): ${res.status}`);
                setListedLegendaryItems([]);
                return;
            }

            const data = await res.json();
            const now = Math.floor(Date.now() / 1000);
            const orders = (data.orders || []).filter((order: any) => {
                const isActive = !order.cancelled && !order.fulfilled && order.expiration_time > now;
                return isActive;
            });

            if (orders.length > 0) {
                const sorted = [...orders]
                    .filter(item => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria)
                    .sort(
                        (a, b) =>
                            parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
                            parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
                    );

                console.log(`Legendary sorted (token ID ${firstTokenId}):`, sorted);
                setListedLegendaryItems(sorted);
            } else {
                console.log(`No active legendary NFT listings found for token ID ${firstTokenId}`);
                setListedLegendaryItems([]);
            }
        } catch (err) {
            console.error(`Failed to fetch legendary listing for token ID ${firstTokenId}:`, err);
            setListedLegendaryItems([]);
        }
    }

    async function fetchListedPremiumItems(tokenIds: any) {
        if (!walletClient || !isConnected || !apiKey) {
            console.log("Missing wallet client, connection, or API key, skipping fetch...");
            return;
        }

        if (tokenIds.length === 0) {
            console.log("No premium NFTs available to fetch listings");
            setListedPremiumItems([]);
            return;
        }

        const firstTokenId = tokenIds[0]; // Use only the first token ID

        try {
            const url = new URL("https://api.opensea.io/api/v2/orders/base/seaport/listings");
            url.searchParams.set("asset_contract_address", OPENSEA_CONTRACT_ADDRESS);
            url.searchParams.set("limit", "50");
            url.searchParams.set("order_by", "created_date");
            url.searchParams.set("order_direction", "desc");
            url.searchParams.set("maker", openseaAddress.toLowerCase());
            url.searchParams.append("token_ids", firstTokenId.toString());

            const res = await fetch(url.toString(), {
                headers: {
                    accept: "application/json",
                    "x-api-key": apiKey,
                },
            });

            if (!res.ok) {
                console.error(`OpenSea fetch failed for premium listing (token ID ${firstTokenId}): ${res.status}`);
                setListedPremiumItems([]);
                return;
            }

            const data = await res.json();
            const now = Math.floor(Date.now() / 1000);
            const orders = (data.orders || []).filter((order: any) => {
                const isActive = !order.cancelled && !order.fulfilled && order.expiration_time > now;
                return isActive;
            });

            if (orders.length > 0) {
                const sorted = [...orders]
                    .filter(item => item?.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria)
                    .sort(
                        (a, b) =>
                            parseInt(a.protocol_data.parameters.offer[0].identifierOrCriteria) -
                            parseInt(b.protocol_data.parameters.offer[0].identifierOrCriteria)
                    );

                console.log(`Premium sorted (token ID ${firstTokenId}):`, sorted);
                setListedPremiumItems(sorted);
            } else {
                console.log(`No active premium NFT listings found for token ID ${firstTokenId}`);
                setListedPremiumItems([]);
            }
        } catch (err) {
            console.error(`Failed to fetch premium listing for token ID ${firstTokenId}:`, err);
            setListedPremiumItems([]);
        }
    }

    useEffect(() => {
        fetchAvailableNfts();
    }, [walletClient, isConnected]);

    useEffect(() => {
        fetchAvailableNfts();
    }, [isModalOpen, isFailureModalOpen]);

    async function handleBuy(order: any, tier: "Legendary" | "Premium") {
        if (!walletClient || !ready || !authenticated) {
            login();
            return;
        }

        console.log("order________", order)

        if (!order) {
            const modalDataFailed: any = await getModalData();
            setFailureTxHash(txHash);
            setFailureImage(modalDataFailed.image);
            setActiveOrder(false)
            setFailureModalOpen(true);
            return;
        }

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
                    "x-api-key": `${apiKey}`,
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

            const txReceipt = await provider.waitForTransaction(txHash);
            if (txReceipt?.status === 1) {
                console.log("✅ Transaction confirmed");
                const modalData: any = await getModalData();
                setModalData(modalData);
                setModalOpen(true);
            } else {
                const modalDataFailed: any = await getModalData();
                setFailureTxHash(txHash);
                setFailureImage(modalDataFailed.image);
                setActiveOrder(true)
                setFailureModalOpen(true);
            }
        } catch (error) {
            console.error("❌ Purchase failed:", error);
            const rejected =
                (error as any)?.code === 4001 ||
                (error as any)?.message?.toLowerCase().includes("user rejected");

            if (rejected) {
                setToastTitle("Transaction Rejected");
                setToastMessage("You missed your plot.");
                setShowToast(true);
                return;
            }
            const modalDataFailed: any = await getModalData();
            setFailureTxHash(txHash);
            setFailureImage(modalDataFailed.image);
            setActiveOrder(true)
            setFailureModalOpen(true);
        }
    }

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // useEffect(() => {
    //     async function fetchOpenSeaOrder() {
    //         if (!walletClient || !isConnected) {
    //             console.log("Wallet client not ready, skipping fetch...");
    //             return;
    //         }

    //         setIsFetchingOrder(true);
    //         setOrderFetchError(null);

    //         try {
    //             const listingApiUrl = `https://api.opensea.io/api/v2/orders/base/seaport/listings?asset_contract_address=${OPENSEA_CONTRACT_ADDRESS}&token_ids=${TOKEN_ID}&limit=1`;

    //             const listingRes = await fetch(listingApiUrl, {
    //                 method: "GET",
    //                 headers: {
    //                     accept: "application/json",
    //                     "x-api-key": `${apiKey}`,
    //                 },
    //             });

    //             if (!listingRes.ok) {
    //                 throw new Error(`OpenSea listing API error: ${listingRes.status}`);
    //             }

    //             const listingData = await listingRes.json();
    //             const sellOrder = listingData.orders?.[0];
    //             if (!sellOrder) {
    //                 setOrderFetchError("No sell order found on OpenSea for this NFT.");
    //                 return;
    //             }

    //             const { order_hash, protocol_address } = sellOrder;

    //             const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    //             await provider.send("eth_requestAccounts", []);
    //             const signer = await provider.getSigner(walletClient.account.address);
    //             const fulfillerAddress = await signer.getAddress();

    //             const fulfillmentRes = await fetch("https://api.opensea.io/api/v2/listings/fulfillment_data", {
    //                 method: "POST",
    //                 headers: {
    //                     accept: "application/json",
    //                     "content-type": "application/json",
    //                     "x-api-key": `${apiKey}`,
    //                 },
    //                 body: JSON.stringify({
    //                     listing: {
    //                         hash: order_hash,
    //                         chain: "base",
    //                         protocol_address: protocol_address,
    //                     },
    //                     fulfiller: {
    //                         address: fulfillerAddress,
    //                     },
    //                 }),
    //             });

    //             if (!fulfillmentRes.ok) {
    //                 throw new Error(`OpenSea fulfillment API error: ${fulfillmentRes.status}`);
    //             }

    //             const fulfillmentDataJson = await fulfillmentRes.json();
    //             const fulfillmentData = fulfillmentDataJson.fulfillment_data;
    //             const fullOrder = fulfillmentData.orders?.[0];

    //             if (!fullOrder || !fullOrder.parameters || !fullOrder.signature) {
    //                 throw new Error("Invalid fulfillment data: missing order parameters or signature.");
    //             }

    //             setOrderData({
    //                 parameters: fullOrder.parameters,
    //                 signature: fullOrder.signature,
    //             });
    //         } catch (err: any) {
    //             console.error("Fetch OpenSea order failed:", err);
    //             setOrderFetchError(err.message || "Unknown error");
    //         } finally {
    //             setIsFetchingOrder(false);
    //         }
    //     }

    //     fetchOpenSeaOrder();
    // }, [walletClient, isConnected]);

    const getModalData = () => {
        let currentItem;

        if (activeTab === "Premium 500m² Plot" && sortedPremiumItems.length > 0) {
            currentItem = sortedPremiumItems[0];
            return {
                id: currentItem.protocol_data.parameters.offer[0].identifierOrCriteria.toString(),
                image: "/assets/images/apps/500m2.jpg",
                name: "Bitgrass - Premium Collection"
            };
        }

        if (activeTab === "Legendary 1000m² Plot" && sortedLegendaryItems.length > 0) {
            currentItem = sortedLegendaryItems[0];
            return {
                id: currentItem.protocol_data.parameters.offer[0].identifierOrCriteria.toString(),
                image: "/assets/images/apps/1000m2.jpg",
                name: "Bitgrass - Legendary Collection"
            };
        }

        return {
            id: "0",
            image: activeTab === "Premium 500m² Plot" ? "/assets/images/apps/500m2.jpg" : activeTab === "Legendary 1000m² Plot" ? "/assets/images/apps/1000m2.jpg" : "/assets/images/apps/100m2.jpg",
            name: activeTab === "Premium 500m² Plot" ? "Bitgrass - Premium Collection" : activeTab === "Legendary 1000m² Plot" ? "Bitgrass - Legendary Collection" : "Bitgrass NFT Collection – Standard",
        };
    };

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return; // Prevent re-setting same tab

        const tabId = Object.keys(tabIdToName).find(key => tabIdToName[key] === tab) || "standard";
        const seoTitle = tabIdToSeo[tabId];

        setActiveTab(tab);
        setActiveTabSeo(seoTitle);

        // Only update URL if needed
        const newUrl = `/ownplot/${tabId}`;
        if (window.location.pathname !== newUrl) {
            window.history.replaceState(null, "", newUrl);
        }
    };

    return (
        <Fragment>
            <div className="container">
                <div className="container">
                    {/* Tabs Header */}
                    <div className="flex gap-4 mt-6 p-[1.25rem]">
                        {tabList.map((tab) => (
                            <Link
                                key={tab}
                                href={`/ownplot/${Object.keys(tabIdToName).find(key => tabIdToName[key] === tab)}`}
                                scroll={false}
                            >
                                <button
                                    onClick={() => handleTabChange(tab)}
                                    className={`text-sm px-4 py-2 font-semibold ${activeTab === tab
                                        ? "border-b-2 border-primary text-primary"
                                        : ""
                                        }`}
                                >
                                    {tab}
                                </button>
                            </Link>
                        ))}
                    </div>

                    {/* Unique Content Per Tab */}
                    {activeTab === "Standard 100m² Plot" && (
                        <div className="mt-6">
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>
                                                <div className="flex items-center font-semibold mb-2">
                                                    <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                        <img src="/assets/images/brand-logos/favicon.ico" alt="" />
                                                    </span>
                                                    bitgrass.base.eth
                                                </div>

                                                <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md"
                                                    >
                                                        <img
                                                            src="/assets/images/apps/100m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full animate-fade-in-img"
                                                        />
                                                    </motion.div>
                                                </div>
                                                <div className="text-center my-2">
                                                    <p className="text-lg font-semibold">{mintPriceEth} ETH</p>
                                                    <p className="text-sm text-gray-500">~ ${mintPriceUsd} USD</p>
                                                </div>
                                                <div className="w-full h-full flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                                        className="btn-qty"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        min={1}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (val >= 1) setQuantity(val);
                                                        }}
                                                        className="input-qty"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuantity((prev) => prev + 1)}
                                                        className="btn-qty"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    className=" w-full bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm mt-2"
                                                    onClick={() => handleMintAbi(quantity)}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Minting..." : "Mint Plot"}
                                                </button>

                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Standard 100m² NFT
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
                                                                <img src="/assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            0.05
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to 0.1 tCO2 /year
                                                        </div>
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
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path>
                                                                        <path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path>
                                                                        <path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path>
                                                                        <path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path>
                                                                        <path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path>
                                                                        <path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path>
                                                                        <path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
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
                        </div>
                    )}
                    {activeTab === "Premium 500m² Plot" && (
                        <div className="mt-6">
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>
                                                <div className="flex items-center font-semibold mb-2">
                                                    <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                        <img src="/assets/images/brand-logos/favicon.ico" alt="" />
                                                    </span>
                                                    bitgrass.base.eth
                                                </div>

                                                <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md"
                                                    >
                                                        <img
                                                            src="/assets/images/apps/500m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </motion.div>
                                                </div>

                                                <button
                                                    onClick={() => handleBuy(listedPremiumItems[0], "Premium")}
                                                    className="w-full bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm mt-2"
                                                    style={{
                                                        cursor: isLoadingFetchAvailable ? "not-allowed" : "pointer",
                                                        userSelect: isLoadingFetchAvailable ? "none" : "auto"
                                                    }}
                                                    disabled={isLoadingFetchAvailable}
                                                >
                                                    {isLoadingFetchAvailable ? "Processing" : "Buy Now"}
                                                </button>

                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Premium 500m² NFT
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
                                                                <img src="/assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            0.2
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to 0.5 tCO2 /year
                                                        </div>
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
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path>
                                                                        <path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path>
                                                                        <path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path>
                                                                        <path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path>
                                                                        <path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path>
                                                                        <path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path>
                                                                        <path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
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
                        </div>
                    )}
                    {activeTab === "Legendary 1000m² Plot" && (
                        <div className="mt-6">
                            <div className="box custom-box overflow-hidden mt-6">
                                <div className="box-body">
                                    <div className="grid grid-cols-12 md:gap-x-[3rem]">
                                        <div className="xl:col-span-4 col-span-12">
                                            <div>

                                                <div className="flex items-center font-semibold mb-2">
                                                    <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                        <img src="/assets/images/brand-logos/favicon.ico" alt="" />
                                                    </span>
                                                    bitgrass.base.eth
                                                </div>

                                                <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md"
                                                    >
                                                        <img
                                                            src="/assets/images/apps/1000m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </motion.div>
                                                </div>

                                                <button
                                                    onClick={() => handleBuy(listedLegendaryItems[0], "Legendary")}
                                                    className="w-full bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm mt-2"
                                                    style={{
                                                        cursor: isLoadingFetchAvailable ? "not-allowed" : "pointer",
                                                        userSelect: isLoadingFetchAvailable ? "none" : "auto"
                                                    }}
                                                    disabled={isLoadingFetchAvailable}
                                                >
                                                    {isLoadingFetchAvailable ? "Processing" : "Buy Now"}

                                                </button>

                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] font-semibold mb-0">
                                                    Bitgrass NFT Collection – Legendary 1000m² NFT
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
                                                                <img src="/assets/images/brand-logos/eth.png" alt="" />
                                                            </span>
                                                            0.35
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[.9375rem] font-semibold">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-xs avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to 1.0 tCO2 /year
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-[.9375rem] font-semibold mb-1">Description :</p>
                                                    <p>
                                                        <b>Discover the Bitgrass NFT </b>—a <b>Tokenized 1000 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        This NFT offers multiple utilities: Boost your $BTG APY, earn Carbon credits or $BTG by staking your Landplot, or choose to burn it to offset your carbon footprint. Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="M13.08 8.63 12 6.44 10.92 8.63 8.5 8.98 10.25 10.69 9.84 13.1 12 11.96 14.16 13.1 13.75 10.69 15.5 8.98 13.08 8.63z"></path>
                                                                        <path d="m17.16,3.01c-.36-.62-1.02-1.01-1.74-1.01h-6.84c-.72,0-1.38.39-1.74,1.01l-3.43,6c-.35.61-.35,1.37,0,1.98l3.43,6c.04.08.1.14.16.2v3.8c0,.35.18.67.47.85.29.18.66.2.97.04l3.55-1.78,3.55,1.78c.14.07.29.11.45.11.18,0,.37-.05.53-.15.29-.18.47-.5.47-.85v-3.8c.05-.07.11-.13.16-.2l3.43-6c.35-.61.35-1.37,0-1.98l-3.43-6Zm-1.74,12.99h-6.84l-3.43-6,3.43-6v-1s0,1,0,1h6.84l3.43,6-3.43,6Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Proof of Ownership</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m20.26,14h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-4.5-6c-.38-.5-1.22-.5-1.6,0l-2.2,2.93-2.2-2.93c-.38-.5-1.22-.5-1.6,0l-4.5,6c-.23.3-.26.71-.09,1.05s.52.55.89.55l-1.8,2.4c-.23.3-.26.71-.09,1.05s.52.55.89.55h.2l-1.54,2.47c-.19.31-.2.7-.03,1.01.18.32.51.52.87.52h5v4h2v-4h4v4h2v-4h5c.37,0,.7-.2.88-.52.18-.32.16-.71-.04-1.02l-1.58-2.46Zm-15.46,2l1.54-2.47c.19-.31.2-.7.03-1.01-.18-.32-.51-.52-.87-.52l1.8-2.4c.23-.3.26-.71.09-1.05s-.52-.55-.89-.55l2.5-3.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46H4.8Zm10.74,0l-1.29-2h.24c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.8-2.4c.38,0,.73-.21.89-.55s.13-.74-.09-1.05l-1.05-1.4,1.75-2.33,2.5,3.33c-.38,0-.73.21-.89.55s-.13.74.09,1.05l1.8,2.4h-.07c-.37,0-.7.2-.88.52-.18.32-.16.71.04,1.02l1.58,2.46h-3.62Z"></path>
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{ fill: "rgb(var(--primary))" }} viewBox="0 0 24 24">
                                                                        <path d="m12,11c1.71,0,3-1.29,3-3s-1.29-3-3-3-3,1.29-3,3,1.29,3,3,3Zm0-4c.6,0,1,.4,1,1s-.4,1-1,1-1-.4-1-1,.4-1,1-1Z"></path>
                                                                        <path d="m13,12h-2c-2.76,0-5,2.24-5,5v.5c0,.83.67,1.5,1.5,1.5h9c.83,0,1.5-.67,1.5-1.5v-.5c0-2.76-2.24-5-5-5Zm-5,5c0-1.65,1.35-3,3-3h2c1.65,0,3,1.35,3,3h-8Z"></path>
                                                                        <path d="m6.5,11c.47,0,.9-.12,1.27-.33-.48-.77-.77-1.68-.77-2.67,0-.66.13-1.28.35-1.85-.26-.09-.55-.15-.85-.15-1.44,0-2.5,1.06-2.5,2.5s1.06,2.5,2.5,2.5Z"></path>
                                                                        <path d="m6.11,12h-.61c-1.93,0-3.5,1.57-3.5,3.5v1c0,.28.22.5.5.5h1.5c0-1.96.81-3.73,2.11-5Z"></path>
                                                                        <path d="m17.5,11c1.44,0,2.5-1.06,2.5-2.5s-1.06-2.5-2.5-2.5c-.31,0-.59.06-.85.15.22.57.35,1.19.35,1.85,0,.99-.29,1.9-.77,2.67.37.21.79.33,1.27.33Z"></path>
                                                                        <path d="m18.5,12h-.61c1.3,1.27,2.11,3.04,2.11,5h1.5c.28,0,.5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5Z"></path>
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
                        </div>
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
                    token="0xe2d29582718057c9e3f69400ea0d2bb415908370"
                    id={modalData.id}
                    image={modalData.image}
                />
                <PurchaseFailedModal
                    isOpen={isFailureModalOpen}
                    onClose={() => {
                        setFailureModalOpen(false);
                        setActiveOrder(true);
                    }}
                    image={failureImage}
                    activeOrder={activeOrder}
                />
                <MintCelebrationModal
                    isOpen={isStandardMintModalOpen}
                    onClose={() => {
                        setIsStandardMintModalOpen(false);
                        setModalData({ id: "", image: "", name: "" });
                    }}
                    name={modalData.name}
                    token="0xe2d29582718057c9e3f69400ea0d2bb415908370"
                    id={modalData.id}
                    image={modalData.image}
                />

                {showToast && toastMessage && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:left-auto md:right-6 md:translate-x-0">
                        <div
                            role="alert"
                            className="bg-bgW shadow-lg rounded-md w-full max-w-md min-w-[320px] px-5 py-4 text-redW"
                        >
                            <div className="flex items-center gap-3">
                                {/* Left custom icon - vertically centered */}
                                <div className="flex-shrink-0">
                                    <img
                                        src="/assets/images/svg/errorIcon.svg"
                                        alt="Warning"
                                        width={25}
                                        height={25}
                                        className="mt-0.5"
                                    />
                                </div>

                                {/* Text content and Close */}
                                <div className="flex justify-between items-start flex-1">
                                    {/* Title + Description */}
                                    <div className="flex flex-col">
                                        <strong className="text-sm font-bold">{toastTitle}</strong>
                                        <p className="text-xs">{toastMessage}</p>
                                    </div>

                                    {/* Close button */}
                                    <button
                                        onClick={() => setShowToast(false)}
                                        className="text-redW hover:text-red-400 transition-colors duration-200 ml-4 mt-0.5"
                                        aria-label="Close"
                                    >
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 1L15 15M15 1L1 15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </Fragment>
    );

};

export default Nftdetails;
