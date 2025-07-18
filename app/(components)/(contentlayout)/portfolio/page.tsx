"use client";
import { Fragment, useState, useEffect } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import BalanceCard from "./BalanceCard";
import PortfolioTabs from "./PortfolioTabs";
import { useAccount } from "wagmi";
import axios from "axios";
import { Token } from "@coinbase/onchainkit/token";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { btgToken, nftInfo, EthInfo } from "@/shared/data/tokens/data";
import CarbonAssetsCard from "./CarbonAssetsCard";
const getInitialWalletState = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("walletConnected") === "true";
  }
  return false;
};

const Crypto = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { address } = useAccount();
  const [status, setStatus] = useState("loading");
  const [walletConnected, setWalletConnected] = useState(getInitialWalletState);
  const [btgBalance, setBtgBalance] = useState("0.00");
  const [btgPrice, setBtgPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [ethBalance, setEthBalance] = useState("0.00");
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionCursor, setTransactionCursor] = useState(null);
  const [nftTransactionCursor, setNftTransactionCursor] = useState(null);
  const [nftData, setNftData] = useState<any[]>([]);
  const [nftCursor, setNftCursor] = useState(null);
  const [activeTab, setActiveTab] = useState("crypto-tab-pane");
  const [pageNumber, setPageNumber] = useState<number>(1)

  // Fetch ETH Data (unchanged)
  useEffect(() => {
    async function fetchEthData() {
      if (!address) return;
      try {
        const [priceRes, balanceRes] = await Promise.all([
          axios.get(
            `https://deep-index.moralis.io/api/v2.2/erc20/${EthInfo.address}/price?chain=eth&include=percent_change`,
            {
              headers: {
                accept: "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APY_KEY,
              },
            }
          ),
          axios.get(
            `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=base`,
            {
              headers: {
                accept: "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APY_KEY,
              },
            }
          ),
        ]);

        const ethPrice = priceRes.data.usdPrice;
        const tokenData = balanceRes.data?.result?.[0];

        if (!tokenData) {
          setEthPrice(ethPrice.toFixed(6));
          setEthBalance("0.00");
          setTotalBalance("0.00");
          return;
        }

        const rawBalance = tokenData.balance;
        const decimals = tokenData.decimals;
        const humanReadable = parseFloat(rawBalance) / Math.pow(10, decimals);

        setEthPrice(ethPrice.toFixed(6));
        setEthBalance(humanReadable.toFixed(5));
      } catch (error) {
        console.error("Error fetching ETH data from Moralis:", error);
      }
    }
    fetchEthData();
  }, [address]);

  // Fetch BTG Data (unchanged)
  useEffect(() => {
    async function fetchBtgData() {
      if (!address) return;
      try {
        const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
        const [priceRes, balanceRes] = await Promise.all([
          axios.get(
            `https://deep-index.moralis.io/api/v2.2/erc20/${btgToken.address}/price?chain=base&include=percent_change`,
            {
              headers: { accept: "application/json", "X-API-Key": API_KEY },
            }
          ),
          axios.get(
            `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=base&token_addresses%5B0%5D=${btgToken.address}`,
            {
              headers: { accept: "application/json", "X-API-Key": API_KEY },
            }
          ),
        ]);

        const btgPrice = priceRes.data.usdPrice;
        const tokenData = balanceRes.data?.[0];

        if (!tokenData) {
          setBtgPrice(btgPrice.toFixed(6));
          setBtgBalance("0.00");
          setTotalBalance("0.00");
          return;
        }

        const rawBalance = tokenData.balance;
        const decimals = tokenData.decimals;
        const humanReadable = parseFloat(rawBalance) / Math.pow(10, decimals);
        const totalUsd = humanReadable * btgPrice;

        setBtgPrice(btgPrice.toFixed(6));
        setBtgBalance(humanReadable.toFixed(2));
        setTotalBalance(totalUsd.toFixed(2));
      } catch (error) {
        console.error("Error fetching BTG data from Moralis:", error);
      }
    }
    fetchBtgData();
  }, [address]);

  // Fetch Crypto Transactions (unchanged)
  const fetchCryptoTransactions = async (cursor = null, limit = 10) => {
    if (!address) return;
    try {
      const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
      const params = new URLSearchParams({
        chain: "base",
        tokenAddress: btgToken.address,
        order: "DESC",
        limit: limit.toString(),
      });
      if (cursor) params.append("cursor", cursor);

      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/swaps?${params.toString()}`,
        {
          headers: { accept: "application/json", "X-API-Key": API_KEY },
        }
      );

      const cryptoTransactions = response.data.result.map((tx: any) => {
        const baseToken = tx.bought;
        const quoteToken = tx.sold;
        return {
          type: "crypto",
          transaction: `${quoteToken.symbol} > ${baseToken.symbol}`,
          value: `+${parseFloat(baseToken.amount).toFixed(6)} ${baseToken.symbol}`,
          grayValue: `${parseFloat(quoteToken.amount).toFixed(6)} ${quoteToken.symbol}`,
          date: new Date(tx.blockTimestamp).toLocaleString(),
          timestamp: new Date(tx.blockTimestamp).getTime(),
          bought: baseToken,
          sold: quoteToken,
          transactionHash: tx.transactionHash,
        };
      });

      setTransactions((prev) => [...prev, ...cryptoTransactions]);
      setTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching crypto transactions:", error);
    }
  };

  // Fetch NFT Transactions (unchanged)
  const fetchNftTransactions = async (cursor = null, limit = 10) => {
    if (!address) return;
    try {
      const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
      const params = new URLSearchParams({
        chain: "base",
        format: "decimal",
        "token_addresses[0]": nftInfo.address,
        normalizeMetadata: "true",
        media_items: "false",
        include_prices: "false",
        limit: limit.toString(),
      });
      if (cursor) params.append("cursor", cursor);

      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers?${params.toString()}`, // Changed to /nft/transfers
        {
          headers: { accept: "application/json", "X-API-Key": API_KEY },
        }
      );

      const nftTransactions = response.data.result
        .filter((tx: any) => tx.token_address.toLowerCase() === nftInfo.address.toLowerCase()) // Filter by token_address
        .map((tx: any) => {
          const tokenId = parseInt(tx.token_id); // Assure que token_id est un nombre
          let NftType = "Standard 100m²";
          let transactionType = "NFT Mint"

          if (tokenId >= 1 && tokenId <= 400) {
            NftType = "Legendary 1000m²";
            transactionType = "NFT Sale"
          } else if (tokenId >= 401 && tokenId <= 1200) {
            NftType = "Premium 500m²";
            transactionType = "NFT Sale"
          }

          return {
            type: "nft",
            transaction: transactionType,
            NftType: NftType,
            value: `+${tx.amount || 1} NFT(s)`,
            grayValue: `NFT ID: ${tx.token_id}`,
            date: new Date(tx.block_timestamp).toLocaleString(),
            timestamp: new Date(tx.block_timestamp).getTime(),
            transactionHash: tx.transaction_hash,
          };
        });


      setTransactions((prev) => [...prev, ...nftTransactions]);
      setNftTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFT transactions:", error);
    }
  };

  // Fetch NFTs (unchanged)
  const fetchNfts = async (cursor = null, limit = 4) => {
    if (!address) return;
    try {
      const params = new URLSearchParams({
        chain: "base",
        format: "decimal",
        "token_addresses[0]": nftInfo.address,
        normalizeMetadata: "true",
        media_items: "false",
        include_prices: "false",
        limit: limit.toString(),
      });
      if (cursor) params.append("cursor", cursor);

      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft?${params.toString()}`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APY_KEY,
          },
        }
      );

      const nfts = response.data.result.map((nft: any) => ({
        type: "nft",
        transaction: "NFT Minted",
        value: `+${nft.amount || 1} NFT(s)`,
        grayValue: `NFT ID: ${nft.token_id}`,
        date: new Date(nft.last_token_uri_sync || nft.last_metadata_sync).toLocaleString(),
        timestamp: new Date(nft.last_token_uri_sync || nft.last_metadata_sync).getTime(),
        transactionHash: "",
        contract_address: nft.token_address,
        name: nft.normalized_metadata?.name || nft.name || "Unnamed NFT",
        slug: nft.symbol || null,
        description: nft.normalized_metadata?.description || "No description available",
        image: nft.normalized_metadata?.image?.replace("ipfs://", "https://ipfs.io/ipfs/"),
        floor_price: null,
        symbol: nft.symbol || "N/A",
        tokenId: nft.token_id,
        collectionName: nft.name || "Greener Future",
      }));

      setNftData((prev) => [...prev, ...nfts]);
      setNftCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFTs from Moralis:", error);
    }
  };

  const loadMore = () => {
    if (activeTab === "transactions-tab-pane") {
      const promises = [];

      if (transactionCursor) {
        promises.push(fetchCryptoTransactions(transactionCursor, 10));
      }
      if (nftTransactionCursor) {
        promises.push(fetchNftTransactions(nftTransactionCursor, 10));
      }

      Promise.all(promises)
        .then(() => {
          setPageNumber(prev => prev + 1);
        })
        .catch(error => {
          console.error("Error loading transactions:", error);
        });
    } else if (activeTab === "nfts-tab-pane") {
      fetchNfts(nftCursor, 4);
    }
  };

  // Initial Fetch (unchanged)
  useEffect(() => {
    if (address) {
      setTransactions([]);
      setTransactionCursor(null);
      setNftTransactionCursor(null);
      setNftData([]);
      setNftCursor(null);
      Promise.all([
        fetchCryptoTransactions(null, 10),
        fetchNftTransactions(null, 10),
        fetchNfts(null, 4),
      ]);
    }
  }, [address]);

  // Wallet Connection Status (unchanged)
  useEffect(() => {
    if (!ready) {
      setStatus("loading");
      return;
    }
    if (authenticated && wallets.length > 0 && address) {
      localStorage.setItem("walletConnected", "true");
      setStatus("loaded");
    } else {
      localStorage.setItem("walletConnected", "false");
      setStatus("disconnected");
    }
  }, [ready, authenticated, wallets, address]);

  // Handle Tab Navigation (unchanged)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#nfts-tab-pane" || hash === "#transactions-tab-pane") {
      setActiveTab(hash.substring(1));
    } else {
      setActiveTab("crypto-tab-pane");
    }
  }, []);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p className="mt-3">Loading data, please wait...</p>
          </div>
        );
      case "disconnected":
        return (
          <div className="xl:col-span-12 col-span-12 mt-12">
            <div className="min-h-60 flex flex-col bg-white border shadow-sm rounded-xl dark:bg-bodybg dark:border-white/10">
              <div className="flex flex-auto flex-col justify-center items-center box-body">
                <svg
                  className="size-10 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" x2="2" y1="12" y2="12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  <line x1="6" x2="6.01" y1="16" y2="16" />
                  <line x1="10" x2="10.01" y1="16" y2="16" />
                </svg>
                <p className="mt-5 text-sm text-gray-800 dark:text-gray-300">
                  No data to show - Please connect your wallet
                </p>
              </div>
            </div>
          </div>
        );
      case "loaded":
        return (
          <>
            <BalanceCard
              totalBalance={totalBalance}
              btgBalance={btgBalance}
              btgToken={btgToken}
            />
            <PortfolioTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              transactions={
                (transactionCursor || nftTransactionCursor)
                  ? transactions
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, pageNumber * 5)
                  : transactions.sort((a, b) => b.timestamp - a.timestamp)
              }
              transactionCursor={transactionCursor}
              nftTransactionCursor={nftTransactionCursor} // Pass the NFT transaction cursor
              nftData={nftData}
              nftCursor={nftCursor}
              loadMore={loadMore}
              ethBalance={ethBalance}
              ethPrice={ethPrice}
              btgPrice={btgPrice}
              btgBalance={btgBalance}
              btgToken={btgToken}
            />
            <CarbonAssetsCard
            />
          </>
        );
      default:
        return <div className="loading">Loading...</div>;
    }
  };

  return (
    <Fragment>
      <Seo title="Portfolio" />
      <div className="container">{renderContent()}</div>
    </Fragment>
  );
};

export default Crypto;