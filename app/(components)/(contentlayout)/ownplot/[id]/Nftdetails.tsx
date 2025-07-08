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
    const BASE_CHAIN_ID = 8453;
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
    const [isBuying, setIsBuying] = useState(false);

    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState("");
    const tabList = ["Standard 100m² Plot", "Premium 500m² Plot", "Legendary 1000m² Plot"];
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [orderFetchError, setOrderFetchError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isStandardMintModalOpen, setIsStandardMintModalOpen] = useState(false);
    const [failureTxHash, setFailureTxHash] = useState("");
    const [failureImage, setFailureImage] = useState("");
    const OPENSEA_CONTRACT_ADDRESS = nftInfo.address;
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

    const ensureBaseChain = async () => {
        if (!walletClient) throw new Error("No wallet client");
        const chainId = await walletClient.getChainId();
        if (chainId !== BASE_CHAIN_ID) {
            // Try switching. This will prompt MetaMask/Phantom if not already on Base
            try {
                await switchChainAsync({ chainId: BASE_CHAIN_ID });
                return true;
            } catch (err) {
                setToastTitle("Wrong Network");
                setToastMessage("Please switch your wallet to Base before minting.");
                setShowToast(true);
                return false;
            }
        }
        return true;
    };
    // Set initial tab based on initialTabId
    useEffect(() => {
        const tabName = tabIdToName[initialTabId] || "Standard 100m² Plot";
        setActiveTab(tabName);
    }, [initialTabId]);

    const handleMintAbi = async (quantity: number) => {
        try {
            setLoading(true);

            // Check wallet/connection status
            if (!walletClient || !ready || !authenticated) {
                login();
                return;
            }
            const onBase = await ensureBaseChain();
            if (!onBase) {
                setLoading(false);
                return;
            }
            const userAddress = walletClient.account.address;

            // Use a public provider just to read contract state (mint price)
            const publicProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");
            const readSeaDrop = new ethers.Contract(SEADROP_ADDRESS, SeaDropABI, publicProvider);
            const publicDrop = await readSeaDrop.getPublicDrop(CONTRACT_ADDRESS);

            const mintPrice = publicDrop.mintPrice; // should be a BigInt
            const totalPrice = mintPrice * BigInt(quantity);

            // Prepare calldata for mintPublic
            const iface = new ethers.Interface(SeaDropABI);
            const calldata = iface.encodeFunctionData("mintPublic", [
                CONTRACT_ADDRESS,
                SEADROP_CONDUIT,
                userAddress,
                quantity,
            ]) as `0x${string}`;

            // Debug: Print info before sending
            console.log("Wallet Address:", userAddress);
            console.log("ChainId (walletClient):", await walletClient.getChainId());
            console.log("Mint Price:", mintPrice.toString());
            console.log("Total Price (Wei):", totalPrice.toString());

            // Send the transaction using walletClient (supports embedded/email wallets)
            const txHash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: SEADROP_ADDRESS,
                value: totalPrice,
                data: calldata,
            });

            // Wait for confirmation using a public provider
            const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
            const receipt = await provider.waitForTransaction(txHash);

            // Extract all Transfer events from your NFT contract
            const transferTopic = id("Transfer(address,address,uint256)");
            const mintedTokenIds: string[] = [];
            if (!receipt) return
            for (const log of receipt?.logs) {
                if (
                    log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase() &&
                    log.topics[0] === transferTopic &&
                    log.topics.length === 4
                ) {
                    const tokenId = BigInt(log.topics[3]).toString();
                    mintedTokenIds.push(tokenId);
                }
            }

            // Show modal with all token IDs
            if (mintedTokenIds.length > 0) {
                setModalData({
                    id: mintedTokenIds.join(", "), // "1896, 1897, 1898"
                    image: "/assets/images/apps/100m2.jpg",
                    name: `Bitgrass - Standard Collection`,
                });
                setIsStandardMintModalOpen(true);
            }

        } catch (error: any) {
            // Handle user rejection
            const rejected =
                error?.code === 4001 ||
                error?.message?.toLowerCase().includes("user rejected");

            if (rejected) {
                setToastTitle("Transaction Rejected");
                setToastMessage("You missed your plot.");
                setShowToast(true);
                return;
            }
            // Handle insufficient funds
            const insufficientFunds =
                error?.code === "INSUFFICIENT_FUNDS" ||
                error?.message?.toLowerCase().includes("insufficient funds");
            if (insufficientFunds) {
                setToastTitle("Insufficient Funds");
                setToastMessage("You need more ETH in your wallet to complete your mint.");
                setShowToast(true);
                return;
            }

            // Contract custom errors
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
            console.error("❌ Mint failed:", error);

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
            setIsLoadingFetchAvailable(false)
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
                url.searchParams.set("limit", "10");
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

                console.log("newLegendary-------", newLegendary.sort((a: any, b: any) => a - b))


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

                console.log("newPremium-------", newPremium.sort((a: any, b: any) => a - b))

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
            await fetchListedLegendaryItems(legendaryNftDispo.sort((a: any, b: any) => a - b));
        } else {
            setListedLegendaryItems([]);
        }

        // Proceed to listings API for premium NFTs if any
        if (primaryNftDispo.length > 0) {
            await fetchListedPremiumItems(primaryNftDispo.sort((a: any, b: any) => a - b));
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
            setIsBuying(true); // <--- Start transaction loader

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
        } finally {
            setIsBuying(false); // <--- Always stop transaction loader
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

        setActiveTab(tab);

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
                    <div className="flex gap-[2rem] mt-6 p-[1.25rem]">
                        {tabList.map((tab) => (
                            <Link
                                key={tab}
                                href={`/ownplot/${Object.keys(tabIdToName).find(key => tabIdToName[key] === tab)}`}
                                scroll={false}
                            >
                                <button
                                    onClick={() => handleTabChange(tab)}
                                    className={`text-sm py-2 font-semibold ${activeTab === tab
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
                                                    <div

                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md .animate-fade-in-up "
                                                    >
                                                        <img
                                                            src="/assets/images/apps/100m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 my-4">
                                                    <p className="text-lg font-semibold">{mintPriceEth} ETH</p>
                                                    <span className="text-gray-400">|</span>
                                                    <p className="text-[0.8rem] text-[#8C9097]">~ ${mintPriceUsd} USD</p>
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
                                                    {loading && (
                                                        <span className="btn-spinner"></span>
                                                    )}
                                                    {loading ? "Minting..." : "Mint Plot"}
                                                </button>

                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] mb-4 font-semibold mb-0" style={{ fontSize: "22px" }}>
                                                    Bitgrass NFT Collection – Standard 100m² NFT
                                                </p>
                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Price</p>
                                                        <div className="flex items-center font-semibold" style={{ fontSize: "22px" }}>
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/eth.svg" alt="" />
                                                            </span>
                                                            0.05 ETH
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to &nbsp;
                                                            <span className="font-semibold" style={{ fontSize: "22px" }}>
                                                                0.1 tCO2 /year
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-[0.8rem] text-[#8C9097]  mb-1">Description :</p>
                                                    <p>
                                                        A <b>Tokenized 100 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M29.9999 29.0502H1.99994C1.63994 29.0502 1.29994 28.8602 1.09994 28.5502C0.909944 28.2402 0.889944 27.8502 1.04994 27.5302L5.04994 19.5302C5.22994 19.1702 5.58994 18.9502 5.98994 18.9502H12.2899C12.8699 18.9502 13.3399 19.4202 13.3399 20.0002C13.3399 20.5802 12.8699 21.0502 12.2899 21.0502H6.63994L3.68994 26.9402H28.2799L25.0399 20.4602C24.7799 19.9402 24.9899 19.3102 25.5099 19.0502C26.0299 18.7902 26.6599 19.0002 26.9199 19.5202L30.9199 27.5202C31.0799 27.8502 31.0699 28.2302 30.8699 28.5402C30.6799 28.8502 30.3399 29.0402 29.9699 29.0402L29.9999 29.0502ZM19.4999 24.5502C19.2099 24.5502 18.9399 24.4302 18.7399 24.2202C18.4399 23.9102 11.5099 16.4802 11.5099 10.4502C11.5099 6.0402 15.0999 2.4502 19.5099 2.4502C23.9199 2.4502 27.5099 5.9602 27.5099 10.4502C27.5099 16.5902 20.5699 23.9202 20.2699 24.2302C20.0699 24.4402 19.7999 24.5602 19.5099 24.5602L19.4999 24.5502ZM19.4999 4.5502C16.2499 4.5502 13.6099 7.1902 13.6099 10.4402C13.6099 14.5702 17.7599 19.8602 19.5099 21.9102C21.2599 19.8802 25.3999 14.6402 25.3999 10.4402C25.3999 7.1302 22.8099 4.5502 19.5099 4.5502H19.4999ZM19.4999 14.0302C17.4699 14.0302 15.8199 12.3802 15.8199 10.3502C15.8199 8.3202 17.4699 6.6702 19.4999 6.6702C21.5299 6.6702 23.1799 8.3202 23.1799 10.3502C23.1799 12.3802 21.5299 14.0302 19.4999 14.0302ZM19.4999 8.7602C18.6299 8.7602 17.9199 9.4702 17.9199 10.3402C17.9199 11.2102 18.6299 11.9202 19.4999 11.9202C20.3699 11.9202 21.0799 11.2102 21.0799 10.3402C21.0799 9.4702 20.3699 8.7602 19.4999 8.7602Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                                <p>  Each NFT is tied to real land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M23 11.1962V10.5C23 7.365 18.2712 5 12 5C5.72875 5 1 7.365 1 10.5V15.5C1 18.1112 4.28125 20.1863 9 20.8075V21.5C9 24.635 13.7288 27 20 27C26.2712 27 31 24.635 31 21.5V16.5C31 13.9125 27.8225 11.835 23 11.1962ZM29 16.5C29 18.1525 25.1512 20 20 20C19.5337 20 19.0712 19.9838 18.615 19.9538C21.3112 18.9713 23 17.375 23 15.5V13.2175C26.7338 13.7737 29 15.2838 29 16.5ZM9 18.7812V15.8075C9.99472 15.9371 10.9969 16.0014 12 16C13.0031 16.0014 14.0053 15.9371 15 15.8075V18.7812C14.0068 18.928 13.004 19.0011 12 19C10.996 19.0011 9.99324 18.928 9 18.7812ZM21 13.7413V15.5C21 16.5488 19.4488 17.675 17 18.3587V15.4375C18.6137 15.0462 19.98 14.4638 21 13.7413ZM12 7C17.1512 7 21 8.8475 21 10.5C21 12.1525 17.1512 14 12 14C6.84875 14 3 12.1525 3 10.5C3 8.8475 6.84875 7 12 7ZM3 15.5V13.7413C4.02 14.4638 5.38625 15.0462 7 15.4375V18.3587C4.55125 17.675 3 16.5488 3 15.5ZM11 21.5V20.9788C11.3288 20.9913 11.6612 21 12 21C12.485 21 12.9587 20.9837 13.4237 20.9562C13.9403 21.1412 14.4665 21.2981 15 21.4263V24.3587C12.5512 23.675 11 22.5488 11 21.5ZM17 24.7812V21.8C17.9944 21.9337 18.9967 22.0005 20 22C21.0031 22.0014 22.0053 21.9371 23 21.8075V24.7812C21.0106 25.0729 18.9894 25.0729 17 24.7812ZM25 24.3587V21.4375C26.6137 21.0462 27.98 20.4637 29 19.7412V21.5C29 22.5488 27.4488 23.675 25 24.3587Z" fill="rgb(var(--primary))" />
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">$BTG Rewards</p>
                                                                <p>Earn $BTG via Vesting</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">


                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M30.9536 5.98633C30.9393 5.74168 30.8357 5.5108 30.6624 5.33752C30.4891 5.16424 30.2583 5.06061 30.0136 5.04633C23.5436 4.67133 18.3486 6.63883 16.1161 10.3238C14.6411 12.7601 14.6436 15.7188 16.0961 18.5413C15.2694 19.5255 14.6652 20.6768 14.3249 21.9163L12.2911 19.8751C13.2686 17.8338 13.2311 15.7063 12.1661 13.9388C10.5161 11.2151 6.70737 9.75508 1.97862 10.0326C1.73398 10.0469 1.5031 10.1505 1.32982 10.3238C1.15653 10.4971 1.05291 10.7279 1.03862 10.9726C0.759874 15.7013 2.22112 19.5101 4.94487 21.1601C5.84371 21.7092 6.87656 21.9999 7.92987 22.0001C8.95225 21.9875 9.95872 21.7453 10.8749 21.2913L13.9999 24.4163V28.0001C13.9999 28.2653 14.1052 28.5196 14.2928 28.7072C14.4803 28.8947 14.7347 29.0001 14.9999 29.0001C15.2651 29.0001 15.5194 28.8947 15.707 28.7072C15.8945 28.5196 15.9999 28.2653 15.9999 28.0001V24.3138C15.9954 22.7229 16.5368 21.1787 17.5336 19.9388C18.8198 20.611 20.2463 20.9707 21.6974 20.9888C23.1003 20.9934 24.4773 20.6101 25.6761 19.8813C29.3611 17.6513 31.3336 12.4563 30.9536 5.98633ZM5.97612 19.4501C4.05862 18.2888 2.97362 15.5401 2.99987 12.0001C6.53987 11.9701 9.28862 13.0588 10.4499 14.9763C11.0561 15.9763 11.1549 17.1426 10.7574 18.3438L7.70612 15.2926C7.51706 15.113 7.26531 15.0143 7.00455 15.0176C6.74379 15.021 6.49465 15.126 6.31025 15.3104C6.12584 15.4948 6.02077 15.744 6.01744 16.0048C6.0141 16.2655 6.11275 16.5173 6.29237 16.7063L9.34362 19.7576C8.14237 20.1551 6.97738 20.0563 5.97612 19.4501ZM24.6399 18.1726C22.9649 19.1863 20.9961 19.2638 18.9961 18.4226L25.7074 11.7101C25.887 11.521 25.9857 11.2693 25.9823 11.0085C25.979 10.7477 25.8739 10.4986 25.6895 10.3142C25.5051 10.1298 25.256 10.0247 24.9952 10.0214C24.7344 10.018 24.4827 10.1167 24.2936 10.2963L17.5811 17.0001C16.7361 15.0001 16.8124 13.0301 17.8311 11.3563C19.5736 8.48133 23.7061 6.87883 28.9974 7.00258C29.1174 12.2926 27.5174 16.4301 24.6399 18.1726Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">NFT staking</p>
                                                                <p>Earn TCO₂ starting in 2026</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[0.8rem] text-[#8C9097]  mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Standard</td></tr>
                                                                <tr><th className="font-semibold text-start">Standard Supply</th><td>2000 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>100 m² (each NFT corresponds to a real land plot)</td></tr>
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
                                                    <div

                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md .animate-fade-in-up "
                                                    >
                                                        <img
                                                            src="/assets/images/apps/500m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBuy(listedPremiumItems[0], "Premium")}
                                                    className="w-full bg-secondary text-white !font-medium m-0 btn btn-primary px-8 py-3 rounded-sm mt-2"
                                                    style={{
                                                        cursor: isBuying ? "not-allowed" : "pointer",
                                                        userSelect: isBuying ? "none" : "auto"
                                                    }}
                                                    disabled={isLoadingFetchAvailable}
                                                >
                                                    {isBuying && (
                                                        <span className="btn-spinner"></span>
                                                    )}
                                                    {isBuying ? "Processing..." : "Buy Now"}
                                                </button>


                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] mb-4 font-semibold mb-0" style={{ fontSize: "22px" }}>
                                                    Bitgrass NFT Collection – Premium 500m² NFT
                                                </p>
                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Price</p>
                                                        <div className="flex items-center font-semibold" style={{ fontSize: "22px" }}>
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/eth.svg" alt="" />
                                                            </span>
                                                            0.2 ETH
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to &nbsp;
                                                            <span className="font-semibold" style={{ fontSize: "22px" }}>
                                                                0.5 tCO2 /year
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-[0.8rem] text-[#8C9097] mb-1">Description :</p>
                                                    <p>
                                                        A <b>Tokenized 500 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M29.9999 29.0502H1.99994C1.63994 29.0502 1.29994 28.8602 1.09994 28.5502C0.909944 28.2402 0.889944 27.8502 1.04994 27.5302L5.04994 19.5302C5.22994 19.1702 5.58994 18.9502 5.98994 18.9502H12.2899C12.8699 18.9502 13.3399 19.4202 13.3399 20.0002C13.3399 20.5802 12.8699 21.0502 12.2899 21.0502H6.63994L3.68994 26.9402H28.2799L25.0399 20.4602C24.7799 19.9402 24.9899 19.3102 25.5099 19.0502C26.0299 18.7902 26.6599 19.0002 26.9199 19.5202L30.9199 27.5202C31.0799 27.8502 31.0699 28.2302 30.8699 28.5402C30.6799 28.8502 30.3399 29.0402 29.9699 29.0402L29.9999 29.0502ZM19.4999 24.5502C19.2099 24.5502 18.9399 24.4302 18.7399 24.2202C18.4399 23.9102 11.5099 16.4802 11.5099 10.4502C11.5099 6.0402 15.0999 2.4502 19.5099 2.4502C23.9199 2.4502 27.5099 5.9602 27.5099 10.4502C27.5099 16.5902 20.5699 23.9202 20.2699 24.2302C20.0699 24.4402 19.7999 24.5602 19.5099 24.5602L19.4999 24.5502ZM19.4999 4.5502C16.2499 4.5502 13.6099 7.1902 13.6099 10.4402C13.6099 14.5702 17.7599 19.8602 19.5099 21.9102C21.2599 19.8802 25.3999 14.6402 25.3999 10.4402C25.3999 7.1302 22.8099 4.5502 19.5099 4.5502H19.4999ZM19.4999 14.0302C17.4699 14.0302 15.8199 12.3802 15.8199 10.3502C15.8199 8.3202 17.4699 6.6702 19.4999 6.6702C21.5299 6.6702 23.1799 8.3202 23.1799 10.3502C23.1799 12.3802 21.5299 14.0302 19.4999 14.0302ZM19.4999 8.7602C18.6299 8.7602 17.9199 9.4702 17.9199 10.3402C17.9199 11.2102 18.6299 11.9202 19.4999 11.9202C20.3699 11.9202 21.0799 11.2102 21.0799 10.3402C21.0799 9.4702 20.3699 8.7602 19.4999 8.7602Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                                <p>  Each NFT is tied to real land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M23 11.1962V10.5C23 7.365 18.2712 5 12 5C5.72875 5 1 7.365 1 10.5V15.5C1 18.1112 4.28125 20.1863 9 20.8075V21.5C9 24.635 13.7288 27 20 27C26.2712 27 31 24.635 31 21.5V16.5C31 13.9125 27.8225 11.835 23 11.1962ZM29 16.5C29 18.1525 25.1512 20 20 20C19.5337 20 19.0712 19.9838 18.615 19.9538C21.3112 18.9713 23 17.375 23 15.5V13.2175C26.7338 13.7737 29 15.2838 29 16.5ZM9 18.7812V15.8075C9.99472 15.9371 10.9969 16.0014 12 16C13.0031 16.0014 14.0053 15.9371 15 15.8075V18.7812C14.0068 18.928 13.004 19.0011 12 19C10.996 19.0011 9.99324 18.928 9 18.7812ZM21 13.7413V15.5C21 16.5488 19.4488 17.675 17 18.3587V15.4375C18.6137 15.0462 19.98 14.4638 21 13.7413ZM12 7C17.1512 7 21 8.8475 21 10.5C21 12.1525 17.1512 14 12 14C6.84875 14 3 12.1525 3 10.5C3 8.8475 6.84875 7 12 7ZM3 15.5V13.7413C4.02 14.4638 5.38625 15.0462 7 15.4375V18.3587C4.55125 17.675 3 16.5488 3 15.5ZM11 21.5V20.9788C11.3288 20.9913 11.6612 21 12 21C12.485 21 12.9587 20.9837 13.4237 20.9562C13.9403 21.1412 14.4665 21.2981 15 21.4263V24.3587C12.5512 23.675 11 22.5488 11 21.5ZM17 24.7812V21.8C17.9944 21.9337 18.9967 22.0005 20 22C21.0031 22.0014 22.0053 21.9371 23 21.8075V24.7812C21.0106 25.0729 18.9894 25.0729 17 24.7812ZM25 24.3587V21.4375C26.6137 21.0462 27.98 20.4637 29 19.7412V21.5C29 22.5488 27.4488 23.675 25 24.3587Z" fill="rgb(var(--primary))" />
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">$BTG Rewards</p>
                                                                <p>Earn $BTG via Vesting</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">


                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M30.9536 5.98633C30.9393 5.74168 30.8357 5.5108 30.6624 5.33752C30.4891 5.16424 30.2583 5.06061 30.0136 5.04633C23.5436 4.67133 18.3486 6.63883 16.1161 10.3238C14.6411 12.7601 14.6436 15.7188 16.0961 18.5413C15.2694 19.5255 14.6652 20.6768 14.3249 21.9163L12.2911 19.8751C13.2686 17.8338 13.2311 15.7063 12.1661 13.9388C10.5161 11.2151 6.70737 9.75508 1.97862 10.0326C1.73398 10.0469 1.5031 10.1505 1.32982 10.3238C1.15653 10.4971 1.05291 10.7279 1.03862 10.9726C0.759874 15.7013 2.22112 19.5101 4.94487 21.1601C5.84371 21.7092 6.87656 21.9999 7.92987 22.0001C8.95225 21.9875 9.95872 21.7453 10.8749 21.2913L13.9999 24.4163V28.0001C13.9999 28.2653 14.1052 28.5196 14.2928 28.7072C14.4803 28.8947 14.7347 29.0001 14.9999 29.0001C15.2651 29.0001 15.5194 28.8947 15.707 28.7072C15.8945 28.5196 15.9999 28.2653 15.9999 28.0001V24.3138C15.9954 22.7229 16.5368 21.1787 17.5336 19.9388C18.8198 20.611 20.2463 20.9707 21.6974 20.9888C23.1003 20.9934 24.4773 20.6101 25.6761 19.8813C29.3611 17.6513 31.3336 12.4563 30.9536 5.98633ZM5.97612 19.4501C4.05862 18.2888 2.97362 15.5401 2.99987 12.0001C6.53987 11.9701 9.28862 13.0588 10.4499 14.9763C11.0561 15.9763 11.1549 17.1426 10.7574 18.3438L7.70612 15.2926C7.51706 15.113 7.26531 15.0143 7.00455 15.0176C6.74379 15.021 6.49465 15.126 6.31025 15.3104C6.12584 15.4948 6.02077 15.744 6.01744 16.0048C6.0141 16.2655 6.11275 16.5173 6.29237 16.7063L9.34362 19.7576C8.14237 20.1551 6.97738 20.0563 5.97612 19.4501ZM24.6399 18.1726C22.9649 19.1863 20.9961 19.2638 18.9961 18.4226L25.7074 11.7101C25.887 11.521 25.9857 11.2693 25.9823 11.0085C25.979 10.7477 25.8739 10.4986 25.6895 10.3142C25.5051 10.1298 25.256 10.0247 24.9952 10.0214C24.7344 10.018 24.4827 10.1167 24.2936 10.2963L17.5811 17.0001C16.7361 15.0001 16.8124 13.0301 17.8311 11.3563C19.5736 8.48133 23.7061 6.87883 28.9974 7.00258C29.1174 12.2926 27.5174 16.4301 24.6399 18.1726Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">NFT staking</p>
                                                                <p>Earn TCO₂ starting in 2026</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[0.8rem] text-[#8C9097] mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Premium</td></tr>
                                                                <tr><th className="font-semibold text-start">Premium Supply</th><td>800 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>500 m² (each NFT corresponds to a real land plot)</td></tr>
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
                                                    <div

                                                        className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden shadow-md .animate-fade-in-up"
                                                    >
                                                        <img
                                                            src="/assets/images/apps/1000m2v1.jpg"
                                                            alt="Custom NFT Preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
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
                                                    {isBuying && (
                                                        <span className="btn-spinner"></span>
                                                    )}
                                                    {isBuying ? "Processing..." : "Buy Now"}

                                                </button>

                                            </div>
                                        </div>
                                        <div className="xl:col-span-8 col-span-12">
                                            <div className="xxl:mt-0 mt-4">
                                                <p className="text-[1.125rem] mb-4 font-semibold mb-0" style={{ fontSize: "22px" }}>
                                                    Bitgrass NFT Collection – Legendary 1000m² NFT
                                                </p>
                                                <div className="grid grid-cols-12 mb-6">
                                                    <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Price</p>
                                                        <div className="flex items-center font-semibold" style={{ fontSize: "22px" }}>
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/eth.svg" alt="" />
                                                            </span>
                                                            0.35 ETH
                                                        </div>
                                                    </div>
                                                    <div className="xxl:col-span-4 xl:col-span-6 col-span-12 xxl:mt-0 mt-4">
                                                        <p className="mb-1 text-[0.8rem] text-[#8C9097] ">Carbon Removal Potential</p>
                                                        <div className="flex items-center font-semibold">
                                                            <span className="avatar avatar-sm avatar-rounded leading-none me-1 mt-1">
                                                                <img src="/assets/images/faces/Leaf.svg" alt="" />
                                                            </span>
                                                            Up to &nbsp;
                                                            <span className="font-semibold" style={{ fontSize: "22px" }}>
                                                                1.0 tCO2 /year
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-[0.8rem] text-[#8C9097] mb-1">Description :</p>
                                                    <p>
                                                        A <b>Tokenized 1000 m² Land plot</b> that grants you the <b>Right of Use for Carbon Credits</b>.
                                                        <br />
                                                        Experience the transition from tokenized land to tokenized carbon credits with <b>#RWA</b>.
                                                    </p>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-12 sm:gap-x-6 justify-center">
                                                        <div className="xxl:col-span-4 col-span-12">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M29.9999 29.0502H1.99994C1.63994 29.0502 1.29994 28.8602 1.09994 28.5502C0.909944 28.2402 0.889944 27.8502 1.04994 27.5302L5.04994 19.5302C5.22994 19.1702 5.58994 18.9502 5.98994 18.9502H12.2899C12.8699 18.9502 13.3399 19.4202 13.3399 20.0002C13.3399 20.5802 12.8699 21.0502 12.2899 21.0502H6.63994L3.68994 26.9402H28.2799L25.0399 20.4602C24.7799 19.9402 24.9899 19.3102 25.5099 19.0502C26.0299 18.7902 26.6599 19.0002 26.9199 19.5202L30.9199 27.5202C31.0799 27.8502 31.0699 28.2302 30.8699 28.5402C30.6799 28.8502 30.3399 29.0402 29.9699 29.0402L29.9999 29.0502ZM19.4999 24.5502C19.2099 24.5502 18.9399 24.4302 18.7399 24.2202C18.4399 23.9102 11.5099 16.4802 11.5099 10.4502C11.5099 6.0402 15.0999 2.4502 19.5099 2.4502C23.9199 2.4502 27.5099 5.9602 27.5099 10.4502C27.5099 16.5902 20.5699 23.9202 20.2699 24.2302C20.0699 24.4402 19.7999 24.5602 19.5099 24.5602L19.4999 24.5502ZM19.4999 4.5502C16.2499 4.5502 13.6099 7.1902 13.6099 10.4402C13.6099 14.5702 17.7599 19.8602 19.5099 21.9102C21.2599 19.8802 25.3999 14.6402 25.3999 10.4402C25.3999 7.1302 22.8099 4.5502 19.5099 4.5502H19.4999ZM19.4999 14.0302C17.4699 14.0302 15.8199 12.3802 15.8199 10.3502C15.8199 8.3202 17.4699 6.6702 19.4999 6.6702C21.5299 6.6702 23.1799 8.3202 23.1799 10.3502C23.1799 12.3802 21.5299 14.0302 19.4999 14.0302ZM19.4999 8.7602C18.6299 8.7602 17.9199 9.4702 17.9199 10.3402C17.9199 11.2102 18.6299 11.9202 19.4999 11.9202C20.3699 11.9202 21.0799 11.2102 21.0799 10.3402C21.0799 9.4702 20.3699 8.7602 19.4999 8.7602Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">Backed by Real Land</p>
                                                                <p>  Each NFT is tied to real land</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">

                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M23 11.1962V10.5C23 7.365 18.2712 5 12 5C5.72875 5 1 7.365 1 10.5V15.5C1 18.1112 4.28125 20.1863 9 20.8075V21.5C9 24.635 13.7288 27 20 27C26.2712 27 31 24.635 31 21.5V16.5C31 13.9125 27.8225 11.835 23 11.1962ZM29 16.5C29 18.1525 25.1512 20 20 20C19.5337 20 19.0712 19.9838 18.615 19.9538C21.3112 18.9713 23 17.375 23 15.5V13.2175C26.7338 13.7737 29 15.2838 29 16.5ZM9 18.7812V15.8075C9.99472 15.9371 10.9969 16.0014 12 16C13.0031 16.0014 14.0053 15.9371 15 15.8075V18.7812C14.0068 18.928 13.004 19.0011 12 19C10.996 19.0011 9.99324 18.928 9 18.7812ZM21 13.7413V15.5C21 16.5488 19.4488 17.675 17 18.3587V15.4375C18.6137 15.0462 19.98 14.4638 21 13.7413ZM12 7C17.1512 7 21 8.8475 21 10.5C21 12.1525 17.1512 14 12 14C6.84875 14 3 12.1525 3 10.5C3 8.8475 6.84875 7 12 7ZM3 15.5V13.7413C4.02 14.4638 5.38625 15.0462 7 15.4375V18.3587C4.55125 17.675 3 16.5488 3 15.5ZM11 21.5V20.9788C11.3288 20.9913 11.6612 21 12 21C12.485 21 12.9587 20.9837 13.4237 20.9562C13.9403 21.1412 14.4665 21.2981 15 21.4263V24.3587C12.5512 23.675 11 22.5488 11 21.5ZM17 24.7812V21.8C17.9944 21.9337 18.9967 22.0005 20 22C21.0031 22.0014 22.0053 21.9371 23 21.8075V24.7812C21.0106 25.0729 18.9894 25.0729 17 24.7812ZM25 24.3587V21.4375C26.6137 21.0462 27.98 20.4637 29 19.7412V21.5C29 22.5488 27.4488 23.675 25 24.3587Z" fill="rgb(var(--primary))" />
                                                                    </svg>
                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">$BTG Rewards</p>
                                                                <p>Earn $BTG via Vesting</p>
                                                            </div>
                                                        </div>
                                                        <div className="xxl:col-span-4 col-span-12 sm:mt-0 mt-4">
                                                            <div className="ecommerce-assurance">
                                                                <p className="mb-4 !inline-flex">


                                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M30.9536 5.98633C30.9393 5.74168 30.8357 5.5108 30.6624 5.33752C30.4891 5.16424 30.2583 5.06061 30.0136 5.04633C23.5436 4.67133 18.3486 6.63883 16.1161 10.3238C14.6411 12.7601 14.6436 15.7188 16.0961 18.5413C15.2694 19.5255 14.6652 20.6768 14.3249 21.9163L12.2911 19.8751C13.2686 17.8338 13.2311 15.7063 12.1661 13.9388C10.5161 11.2151 6.70737 9.75508 1.97862 10.0326C1.73398 10.0469 1.5031 10.1505 1.32982 10.3238C1.15653 10.4971 1.05291 10.7279 1.03862 10.9726C0.759874 15.7013 2.22112 19.5101 4.94487 21.1601C5.84371 21.7092 6.87656 21.9999 7.92987 22.0001C8.95225 21.9875 9.95872 21.7453 10.8749 21.2913L13.9999 24.4163V28.0001C13.9999 28.2653 14.1052 28.5196 14.2928 28.7072C14.4803 28.8947 14.7347 29.0001 14.9999 29.0001C15.2651 29.0001 15.5194 28.8947 15.707 28.7072C15.8945 28.5196 15.9999 28.2653 15.9999 28.0001V24.3138C15.9954 22.7229 16.5368 21.1787 17.5336 19.9388C18.8198 20.611 20.2463 20.9707 21.6974 20.9888C23.1003 20.9934 24.4773 20.6101 25.6761 19.8813C29.3611 17.6513 31.3336 12.4563 30.9536 5.98633ZM5.97612 19.4501C4.05862 18.2888 2.97362 15.5401 2.99987 12.0001C6.53987 11.9701 9.28862 13.0588 10.4499 14.9763C11.0561 15.9763 11.1549 17.1426 10.7574 18.3438L7.70612 15.2926C7.51706 15.113 7.26531 15.0143 7.00455 15.0176C6.74379 15.021 6.49465 15.126 6.31025 15.3104C6.12584 15.4948 6.02077 15.744 6.01744 16.0048C6.0141 16.2655 6.11275 16.5173 6.29237 16.7063L9.34362 19.7576C8.14237 20.1551 6.97738 20.0563 5.97612 19.4501ZM24.6399 18.1726C22.9649 19.1863 20.9961 19.2638 18.9961 18.4226L25.7074 11.7101C25.887 11.521 25.9857 11.2693 25.9823 11.0085C25.979 10.7477 25.8739 10.4986 25.6895 10.3142C25.5051 10.1298 25.256 10.0247 24.9952 10.0214C24.7344 10.018 24.4827 10.1167 24.2936 10.2963L17.5811 17.0001C16.7361 15.0001 16.8124 13.0301 17.8311 11.3563C19.5736 8.48133 23.7061 6.87883 28.9974 7.00258C29.1174 12.2926 27.5174 16.4301 24.6399 18.1726Z" fill="rgb(var(--primary))" />
                                                                    </svg>

                                                                </p>
                                                                <p className="text-[0.875rem] font-semibold mb-0">NFT staking</p>
                                                                <p>Earn TCO₂ starting in 2026</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[0.8rem] text-[#8C9097] mb-2">NFT Details :</p>
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered whitespace-nowrap min-w-full">
                                                            <tbody>
                                                                <tr><th className="font-semibold text-start">Type</th><td>ERC-721</td></tr>
                                                                <tr><th className="font-semibold text-start">Rarity</th><td>Legendary</td></tr>
                                                                <tr><th className="font-semibold text-start">Legendary Supply</th><td>400 NFTs</td></tr>
                                                                <tr><th className="font-semibold text-start">Covered Area</th><td>1000 m² (each NFT corresponds to a real land plot)</td></tr>
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
