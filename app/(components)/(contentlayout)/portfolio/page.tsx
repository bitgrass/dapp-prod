"use client";
import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import BalanceCard from "./BalanceCard";
import PortfolioTabs from "./PortfolioTabs";
import axios from "axios";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { btgToken, nftInfo, EthInfo } from "@/shared/data/tokens/data";
import CarbonAssetsCard from "./CarbonAssetsCard";
import { useConnectedAddress } from "../useConnectedAddress";
import { flushSync } from "react-dom";
// ✅ CRITICAL FIX: More comprehensive deduplication
function dedupeTransactions<T extends {
  transactionHash?: string;
  timestamp: number;
  grayValue?: string;
  type?: string;
  tokenId?: string;
}>(items: T[]): T[] {
  // Use a Set for O(1) lookups
  const seenKeys = new Set<string>();
  const deduped: T[] = [];

  // Sort FIRST by timestamp descending to ensure we keep newest
  const sorted = [...items].sort((a, b) => b.timestamp - a.timestamp);

  for (const item of sorted) {
    let uniqueKey: string;

    if (item.type === 'nft' && item.tokenId) {
      // NFT: Use hash + tokenId + timestamp
      uniqueKey = `nft::${item.transactionHash || 'no-hash'}::${item.tokenId}::${item.timestamp}`;
    } else if (item.transactionHash && item.type === 'crypto') {
      // Crypto: Use hash + grayValue (to distinguish different swaps in same tx)
      uniqueKey = `crypto::${item.transactionHash}::${item.grayValue || ''}`;
    } else {
      // Fallback: Include ALL available data
      uniqueKey = `fallback::${item.timestamp}::${item.type || ''}::${item.grayValue || ''}::${item.tokenId || ''}::${item.transactionHash || ''}`;
    }

    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      deduped.push(item);
    }
  }

  console.log(`🧹 Dedupe: ${items.length} → ${deduped.length} (removed ${items.length - deduped.length} duplicates)`);

  return deduped;
}

const Crypto = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [renderingTxPage, setRenderingTxPage] = useState(1);
  const [renderingNftPage, setRenderingNftPage] = useState(1);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingNftGrid, setLoadingNftGrid] = useState(false);

  const { address, _debug, isLoading: addressLoading } = useConnectedAddress();

  const [hasInitialNftLoad, setHasInitialNftLoad] = useState(false);
  const [hasInitialTransaction, setHasInitialTransaction] = useState(false);

  const [status, setStatus] = useState("loading");
  const [btgBalance, setBtgBalance] = useState("0.00");
  const [btgPrice, setBtgPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [ethBalance, setEthBalance] = useState("0.00");
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [ethSupplyLoaded, setEthSupplyLoaded] = useState(false);

  // ✅ CRITICAL: Use Map for instant deduplication during fetch
  const [cryptoTxMap, setCryptoTxMap] = useState<Map<string, any>>(new Map());
  const [nftTxMap, setNftTxMap] = useState<Map<string, any>>(new Map());
  const [ethTxMap, setEthTxMap] = useState<Map<string, any>>(new Map());

  const [transactionCursor, setTransactionCursor] = useState(null);
  const [nftTransactionCursor, setNftTransactionCursor] = useState(null);
  const [ethTransactionCursor, setEthTransactionCursor] = useState(null);
  const [nftData, setNftData] = useState<any[]>([]);
  
  // ✅ Cache for API responses (5 minute TTL)
  const apiCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const getCachedOrFetch = useCallback(async (url: string, headers: any) => {
    const now = Date.now();
    const cached = apiCache.current.get(url);
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log('💾 Cache hit:', url.slice(0, 80));
      return cached.data;
    }
    
    console.log('🌐 API call:', url.slice(0, 80));
    const response = await axios.get(url, { headers });
    apiCache.current.set(url, { data: response.data, timestamp: now });
    
    // Clean old cache entries (keep last 50)
    if (apiCache.current.size > 50) {
      const entries = Array.from(apiCache.current.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      apiCache.current = new Map(entries.slice(0, 50));
    }
    
    return response.data;
  }, []);
  const [nftCursor, setNftCursor] = useState(null);
  const [activeTab, setActiveTab] = useState("crypto-tab-pane");
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentNftPage, setCurrentNftPage] = useState(1);
  const [ethSupply, setEthSupply] = useState("0");

  const TRANSACTIONS_PER_PAGE = 5;
  const NFTS_PER_PAGE = 4;

  const prevAddressRef = useRef<string | undefined>(undefined);
  const isInitialMount = useRef(true);
  const initialFetchComplete = useRef(false);





  // Fetch ETH Data
  useEffect(() => {
    async function fetchEthData() {
      if (!address) {
        if (!addressLoading && !authenticated) {
          setEthPrice(0);
          setEthBalance("0.00");
        }
        return;
      }

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
        console.error("Error fetching ETH data:", error);
      }
    }
    fetchEthData();
  }, [address, addressLoading, authenticated]);

  // Fetch ETH Supply
  useEffect(() => {
    // Set fixed ETH supply value
    setEthSupply("120,698,693");
    setEthSupplyLoaded(true);
    console.log("✅ ETH Supply set to fixed value: 120,698,693");
  }, []);

  // Fetch BTG Data
  useEffect(() => {
    async function fetchBtgData() {
      if (!address) {
        if (!addressLoading && !authenticated) {
          setBtgPrice(0);
          setBtgBalance("0.00");
          setTotalBalance("0.00");
        }
        return;
      }

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
        console.error("Error fetching BTG data:", error);
      }
    }
    fetchBtgData();
  }, [address, addressLoading, authenticated]);

  // ✅ CRITICAL FIX: Fetch crypto with Map-based deduplication
  const fetchCryptoTransactions = useCallback(async (cursor = null, limit = 10) => {
    if (!address) return;

    console.log('🔍 Fetching crypto transactions:', { cursor, limit });

    if (!cursor) {
      setLoadingTx(true);
    }

    try {
      const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
      const params = new URLSearchParams({
        chain: "base",
        tokenAddress: btgToken.address,
        order: "DESC",
        limit: limit.toString(),
      });
      if (cursor) params.append("cursor", cursor);

      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/swaps?${params.toString()}`;
      const data = await getCachedOrFetch(url, { 
        accept: "application/json", 
        "X-API-Key": API_KEY 
      });
      const response = { data };

      const fetchedCryptoTxs = response.data.result.map((tx: any) => {
        const baseToken = tx.bought;
        const quoteToken = tx.sold;
        const uniqueKey = `crypto::${tx.transactionHash}::${parseFloat(quoteToken.amount).toFixed(6)} ${quoteToken.symbol}`;

        return {
          _key: uniqueKey,
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

      console.log('💰 Fetched crypto txs:', fetchedCryptoTxs.length);

      // ✅ Use Map for instant deduplication
      setCryptoTxMap((prevMap) => {
        const newMap = new Map(prevMap);
        fetchedCryptoTxs.forEach((tx: any) => {
          if (!newMap.has(tx._key)) {
            newMap.set(tx._key, tx);
          }
        });
        console.log('💰 Crypto Map size:', newMap.size);
        return newMap;
      });

      setTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching crypto transactions:", error);
    } finally {
      setLoadingTx(false);
    }
  }, [address, getCachedOrFetch]);

  // ✅ CRITICAL FIX: Fetch NFT with Map-based deduplication
  const fetchNftTransactions = useCallback(async (cursor = null, limit = 10) => {
    if (!address) return;

    console.log('🎨 Fetching NFT transactions:', { cursor, limit });

    if (!cursor) {
      setLoadingNFTs(true);
    }

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

      const url = `https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers?${params.toString()}`;
      const data = await getCachedOrFetch(url, { 
        accept: "application/json", 
        "X-API-Key": API_KEY 
      });
      const response = { data };

      const transactionsWithValue = await Promise.all(
        response.data.result
          .filter((tx: any) => tx.token_address.toLowerCase() === nftInfo.address.toLowerCase())
          .map(async (tx: any) => {
            try {
              const txResponse = await axios.get(
                `https://deep-index.moralis.io/api/v2.2/transaction/${tx.transaction_hash}?chain=base`,
                {
                  headers: { accept: "application/json", "X-API-Key": API_KEY },
                }
              );
              return { ...tx, transaction_value: txResponse.data.value };
            } catch (error) {
              return { ...tx, transaction_value: "0" };
            }
          })
      );

      const fetchedNftTxs = transactionsWithValue.map((tx: any) => {
        const tokenId = parseInt(tx.token_id);
        let NftType = "Standard 100m²";
        let transactionType = "NFT Transfer";

        if (tokenId >= 1 && tokenId <= 400) {
          NftType = "Legendary 1000m²";
        } else if (tokenId >= 401 && tokenId <= 1200) {
          NftType = "Premium 500m²";
        }

        if (tx.from_address === "0x0000000000000000000000000000000000000000") {
          transactionType = "NFT Purchase";
        } else if (tx.transaction_value && tx.transaction_value !== "0") {
          transactionType = "NFT Purchase";
        }

        let nftValue = `+1 NFT`;
        if (tx.from_address?.toLowerCase() === address.toLowerCase()) {
          nftValue = `-1 NFT`;
        }

        const uniqueKey = `nft::${tx.transaction_hash}::${tx.token_id}::${new Date(tx.block_timestamp).getTime()}`;

        return {
          _key: uniqueKey,
          type: "nft",
          transaction: transactionType,
          NftType,
          value: nftValue,
          grayValue: `NFT ID: ${tx.token_id}`,
          date: new Date(tx.block_timestamp).toLocaleString(),
          timestamp: new Date(tx.block_timestamp).getTime(),
          transactionHash: tx.transaction_hash,
          tokenId: tx.token_id,
        };
      });

      console.log('🎨 Fetched NFT txs:', fetchedNftTxs.length);

      // ✅ Use Map for instant deduplication
      setNftTxMap((prevMap) => {
        const newMap = new Map(prevMap);
        fetchedNftTxs.forEach((tx: any) => {
          if (!newMap.has(tx._key)) {
            newMap.set(tx._key, tx);
          }
        });
        console.log('🎨 NFT Map size:', newMap.size);
        return newMap;
      });

      setNftTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFT transactions:", error);
    } finally {
      setLoadingNFTs(false);
    }
  }, [address, getCachedOrFetch]);

  // ✅ Fetch native ETH transactions
  const fetchEthTransactions = useCallback(async (cursor = null, limit = 10) => {
    if (!address) return;

    console.log('💎 Fetching ETH transactions:', { cursor, limit });

    try {
      const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
      const params = new URLSearchParams({
        chain: "base",
        order: "DESC",
        limit: limit.toString(),
      });
      if (cursor) params.append("cursor", cursor);

      const url = `https://deep-index.moralis.io/api/v2.2/${address}?${params.toString()}`;
      const data = await getCachedOrFetch(url, { 
        accept: "application/json", 
        "X-API-Key": API_KEY 
      });
      const response = { data };

      const fetchedEthTxs = response.data.result
        .filter((tx: any) => {
          // Only include transactions with ETH value (not token transfers)
          const value = parseFloat(tx.value || "0");
          if (value === 0) return false;
          
          // Filter out contract interactions - only keep EOA to EOA transfers
          // Contract interactions typically have input data
          const hasInputData = tx.input && tx.input !== "0x" && tx.input.length > 2;
          
          // Skip if there's input data (contract interaction)
          if (hasInputData) return false;
          
          return true;
        })
        .map((tx: any) => {
          const value = parseFloat(tx.value) / 1e18; // Convert from wei to ETH
          const isSent = tx.from_address?.toLowerCase() === address.toLowerCase();
          const transactionType = isSent ? "Send" : "Receive";
          const uniqueKey = `eth::${tx.hash}::${tx.block_timestamp}`;

          return {
            _key: uniqueKey,
            type: "eth",
            transaction: transactionType,
            value: `${isSent ? "-" : "+"}${value.toFixed(6)} ETH`,
            grayValue: isSent ? `To: ${tx.to_address?.slice(0, 6)}...${tx.to_address?.slice(-4)}` : `From: ${tx.from_address?.slice(0, 6)}...${tx.from_address?.slice(-4)}`,
            date: new Date(tx.block_timestamp).toLocaleString(),
            timestamp: new Date(tx.block_timestamp).getTime(),
            transactionHash: tx.hash,
          };
        });

      console.log('💎 Fetched ETH txs:', fetchedEthTxs.length);

      // ✅ Use Map for instant deduplication
      setEthTxMap((prevMap) => {
        const newMap = new Map(prevMap);
        fetchedEthTxs.forEach((tx: any) => {
          if (!newMap.has(tx._key)) {
            newMap.set(tx._key, tx);
          }
        });
        console.log('💎 ETH Map size:', newMap.size);
        return newMap;
      });

      setEthTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching ETH transactions:", error);
    }
  }, [address, getCachedOrFetch]);

  // Fetch NFTs
  const fetchNfts = useCallback(async (cursor = null, limit = 4) => {
    if (!address) return;

    if (!cursor) {
      setLoadingNftGrid(true);
    }

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

      const url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?${params.toString()}`;
      const data = await getCachedOrFetch(url, {
        accept: "application/json",
        "X-API-Key": API_KEY,
      });
      const response = { data };

      // ✅ OPTIMIZED: Batch fetch transfer history for all NFTs at once
      let transfersMap = new Map();
      
      try {
        // Fetch ALL transfers for this contract in one call
        const transferParams = new URLSearchParams({
          chain: "base",
          format: "decimal",
          limit: "100", // Get more transfers in one call
          order: "DESC",
        });

        const transferUrl = `https://deep-index.moralis.io/api/v2.2/nft/${nftInfo.address}/transfers?${transferParams.toString()}`;
        const transferData = await getCachedOrFetch(transferUrl, {
          accept: "application/json",
          "X-API-Key": API_KEY,
        });
        const transferResponse = { data: transferData };

        // Build a map of tokenId -> most recent transfer to this address
        transferResponse.data.result.forEach((transfer: any) => {
          if (transfer.to_address?.toLowerCase() === address.toLowerCase()) {
            const tokenId = parseInt(transfer.token_id);
            if (!transfersMap.has(tokenId)) {
              transfersMap.set(tokenId, transfer);
            }
          }
        });

        console.log(`📦 Batch fetched transfers for ${transfersMap.size} NFTs`);
      } catch (error) {
        console.warn('Could not batch fetch transfer history:', error);
      }

      // Map NFTs with timestamps from batch data
      const nftsWithTimestamps = response.data.result.map((nft: any) => {
        const tokenId = parseInt(nft.token_id);
        let actualTimestamp = tokenId * 1000000; // Fallback
        let purchaseDate = new Date(nft.last_token_uri_sync || nft.last_metadata_sync).toLocaleString();

        // Use batch-fetched transfer data
        const transfer = transfersMap.get(tokenId);
        if (transfer?.block_timestamp) {
          actualTimestamp = new Date(transfer.block_timestamp).getTime();
          purchaseDate = new Date(transfer.block_timestamp).toLocaleString();
        }

        return {
          type: "nft",
          transaction: "NFT Minted",
          value: `+${nft.amount || 1} NFT`,
          grayValue: `NFT ID: ${nft.token_id}`,
          date: purchaseDate,
          timestamp: actualTimestamp,
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
        };
      });

      setNftData((prev) => {
        const combined = [...prev, ...nftsWithTimestamps];
        return dedupeTransactions(combined);
      });

      setNftCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoadingNftGrid(false);
    }
  }, [address, getCachedOrFetch]);

  const allTransactions = useMemo(() => {
    const cryptoArray = Array.from(cryptoTxMap.values());
    const nftArray = Array.from(nftTxMap.values());
    const ethArray = Array.from(ethTxMap.values());
    const merged = [...cryptoArray, ...nftArray, ...ethArray];

    // Add unique index for stable keys
    const withUniqueKeys = merged.map((tx, idx) => ({
      ...tx,
      _uniqueIndex: idx,
      _key: tx._key || `${tx.type}-${tx.timestamp}-${idx}`
    }));

    const sorted = withUniqueKeys.sort((a, b) => b.timestamp - a.timestamp);
    return sorted;
  }, [cryptoTxMap, nftTxMap, ethTxMap]);

  // ✅ CRITICAL FIX: Stable pagination with proper bounds checking
  const transactionPagination = useMemo(() => {
    const total = allTransactions.length;
    const totalPages = Math.max(1, Math.ceil(total / TRANSACTIONS_PER_PAGE));

    // Use rendering page instead of current page
    const safePage = Math.max(1, Math.min(renderingTxPage, totalPages));

    const startIndex = (safePage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + TRANSACTIONS_PER_PAGE, total);
    const paginated = allTransactions.slice(startIndex, endIndex);

    return {
      data: paginated,
      totalPages,
      currentPage: safePage,
      startIndex,
      endIndex
    };
  }, [allTransactions, renderingTxPage]);

  const allNftData = useMemo(() => {
    const deduped = dedupeTransactions([...nftData]);
    return deduped.sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, [nftData]);

  const nftPagination = useMemo(() => {
    const totalPages = Math.ceil(allNftData.length / NFTS_PER_PAGE);
    const safePage = Math.max(1, Math.min(currentNftPage, totalPages || 1));
    const startIndex = (safePage - 1) * NFTS_PER_PAGE;
    const endIndex = startIndex + NFTS_PER_PAGE;
    const paginated = allNftData.slice(startIndex, endIndex);

    return {
      data: paginated,
      totalPages: totalPages || 1,
      currentPage: safePage,
      startIndex,
      endIndex
    };
  }, [allNftData, currentNftPage]);

  // ✅ CRITICAL FIX: Debounced page change handlers
  const handleTransactionPageChange = useCallback((newPage: number) => {
    console.log('📄 Transaction page change:', { from: renderingTxPage, to: newPage });

    flushSync(() => {
      setRenderingTxPage(newPage);
      setCurrentTransactionPage(newPage);
    });
  }, [renderingTxPage]);

  const handleNftPageChange = useCallback((newPage: number) => {
    console.log('📄 NFT page change:', { from: renderingNftPage, to: newPage });

    flushSync(() => {
      setRenderingNftPage(newPage);
      setCurrentNftPage(newPage);
    });
  }, [renderingNftPage]);
  useEffect(() => {
    setRenderingTxPage(currentTransactionPage);
  }, [currentTransactionPage]);

  useEffect(() => {
    setRenderingNftPage(currentNftPage);
  }, [currentNftPage]);

  // Auto-reset invalid pages
  useEffect(() => {
    const totalPages = Math.ceil(allTransactions.length / TRANSACTIONS_PER_PAGE);
    if (currentTransactionPage > totalPages && totalPages > 0) {
      console.log('⚠️ Current page exceeds total pages, resetting to 1');
      flushSync(() => {
        setCurrentTransactionPage(1);
        setRenderingTxPage(1);
      });
    }
  }, [allTransactions.length, currentTransactionPage]);


  // ✅ OPTIMIZED: Prioritized data fetch with progressive loading
  useEffect(() => {
    if (!ready || addressLoading) {
      console.log("⏳ Waiting for initialization...");
      return;
    }

    if (address) {
      const isNewAddress = prevAddressRef.current !== address;

      if (!isNewAddress && initialFetchComplete.current) {
        console.log("🔄 Same address, already fetched");
        return;
      }

      if (isInitialMount.current && cryptoTxMap.size > 0) {
        console.log("🔄 Initial mount with existing data");
        prevAddressRef.current = address;
        isInitialMount.current = false;
        initialFetchComplete.current = true;
        return;
      }

      if (isNewAddress || !initialFetchComplete.current) {
        console.log("✅ Fetching data for address:", address);
        prevAddressRef.current = address;
        isInitialMount.current = false;

        // Reset everything on new address
        if (isNewAddress) {
          setCryptoTxMap(new Map());
          setNftTxMap(new Map());
          setEthTxMap(new Map());
          setNftData([]);
          setCurrentTransactionPage(1);
          setCurrentNftPage(1);
        }

        setTransactionCursor(null);
        setNftTransactionCursor(null);
        setEthTransactionCursor(null);
        setNftCursor(null);
        setHasInitialNftLoad(false);
        setHasInitialTransaction(false);

        // ✅ OPTIMIZED: Fetch all data but with prioritized display
        console.log('🚀 Fetching all data with progressive display...');
        
        setLoadingTx(true);
        setLoadingNFTs(true);
        setLoadingNftGrid(true);

        // Start all fetches immediately (non-blocking)
        const cryptoPromise = fetchCryptoTransactions(null, 100).then(() => {
          setHasInitialTransaction(true);
          console.log('✅ Crypto transactions loaded');
        });

        const nftTxPromise = fetchNftTransactions(null, 100).then(() => {
          console.log('✅ NFT transactions loaded');
        });

        const ethTxPromise = fetchEthTransactions(null, 100).then(() => {
          console.log('✅ ETH transactions loaded');
        });

        const nftGridPromise = fetchNfts(null, 100).then(() => {
          setHasInitialNftLoad(true);
          console.log('✅ NFT grid loaded');
        });

        // Wait for all to complete
        Promise.all([cryptoPromise, nftTxPromise, ethTxPromise, nftGridPromise]).finally(() => {
          initialFetchComplete.current = true;
          console.log('✅ All data loaded');
        });
      }
    } else {
      if (!authenticated && ready && prevAddressRef.current !== undefined) {
        console.log("❌ User disconnected - clearing data");
        prevAddressRef.current = undefined;
        isInitialMount.current = true;
        initialFetchComplete.current = false;

        setCryptoTxMap(new Map());
        setNftTxMap(new Map());
        setEthTxMap(new Map());
        setNftData([]);
        setTransactionCursor(null);
        setNftTransactionCursor(null);
        setEthTransactionCursor(null);
        setNftCursor(null);
        setHasInitialNftLoad(false);
        setHasInitialTransaction(false);
        setLoadingTx(false);
        setLoadingNFTs(false);
        setLoadingNftGrid(false);
      }
    }
  }, [address, addressLoading, authenticated, ready, fetchCryptoTransactions, fetchNftTransactions, fetchEthTransactions, fetchNfts, cryptoTxMap.size]);

  // Status effect
  useEffect(() => {
    if (!ready || addressLoading) {
      setStatus("loading");
      return;
    }

    if (authenticated && address) {
      setStatus("loaded");
    } else if (!authenticated && !address) {
      setStatus("disconnected");
    } else {
      setStatus("loading");
    }
  }, [ready, authenticated, address, addressLoading]);

  // Handle tab navigation
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
              address={address}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              transactions={transactionPagination.data}
              allTransactions={allTransactions}
              currentTransactionPage={currentTransactionPage}
              totalTransactionPages={transactionPagination.totalPages}
              onTransactionPageChange={handleTransactionPageChange}
              nftData={nftPagination.data}
              allNftData={allNftData}
              currentNftPage={currentNftPage}
              totalNftPages={nftPagination.totalPages}
              onNftPageChange={handleNftPageChange}
              transactionCursor={transactionCursor}
              nftTransactionCursor={nftTransactionCursor}
              nftCursor={nftCursor}
              ethBalance={ethBalance}
              ethPrice={ethPrice}
              btgPrice={btgPrice}
              btgBalance={btgBalance}
              btgToken={btgToken}
              ethSupply={ethSupply}
              ethSupplyLoaded={ethSupplyLoaded}
              loadingTx={loadingTx}
              loadingNFTs={loadingNFTs}
              loadingNftGrid={loadingNftGrid}
              hasInitialNftLoad={hasInitialNftLoad}
              hasInitialTransaction={hasInitialTransaction}
            />
            <CarbonAssetsCard />
          </>
        );
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