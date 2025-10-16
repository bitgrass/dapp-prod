"use client";
import React, { Fragment, useState, useEffect } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import BalanceCard from "./BalanceCard";
import PortfolioTabs from "./PortfolioTabs";
import axios from "axios";
import { Token } from "@coinbase/onchainkit/token";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { btgToken, nftInfo, EthInfo } from "@/shared/data/tokens/data";
import CarbonAssetsCard from "./CarbonAssetsCard";
import { useConnectedAddress } from "../useConnectedAddress";


function dedupeByHash<T extends { transactionHash?: string; timestamp: number; grayValue?: string; type?: string }>(
  items: T[]
): T[] {
  const seen = new Map<string, T>();
  const duplicates: string[] = [];
  
  items.forEach((item) => {
    // For NFT transfers, include token ID in the key to handle bulk transfers
    // grayValue contains "NFT ID: {tokenId}"
    const uniqueKey = item.grayValue 
      ? `${item.transactionHash}-${item.grayValue}` 
      : item.transactionHash || `${item.timestamp}`;
    
    if (!seen.has(uniqueKey)) {
      seen.set(uniqueKey, item);
    } else {
      duplicates.push(uniqueKey);
    }
  });
  
  // Sort by timestamp descending (newest first)
  const sorted = Array.from(seen.values()).sort((a, b) => b.timestamp - a.timestamp);
  
  console.log('🔍 Deduplication:', {
    input: items.length,
    output: sorted.length,
    duplicatesRemoved: duplicates.length,
    types: sorted.reduce((acc, item) => {
      acc[item.type || 'unknown'] = (acc[item.type || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });
  
  return sorted;
}


const Crypto = () => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  // 👇 add loading flags for each section
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingNftGrid, setLoadingNftGrid] = useState(false);

  // Use the custom hook - this will prioritize Farcaster wallet in miniapp
  const { address, _debug, isLoading: addressLoading } = useConnectedAddress();
  
  // Debug logging to track address changes
  useEffect(() => {
    console.log('📍 Portfolio Address Debug:', {
      address,
      addressLoading,
      priorityUsed: _debug?.priorityUsed,
      walletsCount: _debug?.walletsCount,
      isWalletsLoading: _debug?.isWalletsLoading
    });
  }, [address, addressLoading, _debug]);
  const [hasInitialNftLoad, setHasInitialNftLoad] = useState(false);
  const [hasInitialTransaction, setHasInitialTransaction] = useState(false);
  
  // Track if we're currently auto-fetching to prevent infinite loops
  const isAutoFetchingTx = React.useRef(false);
  const isAutoFetchingNft = React.useRef(false);
  
  // Track seen transaction hashes to prevent duplicates during fetch
  const seenCryptoHashes = React.useRef(new Set<string>());
  const seenNftHashes = React.useRef(new Set<string>());

  const [status, setStatus] = useState("loading");
  const [btgBalance, setBtgBalance] = useState("0.00");
  const [btgPrice, setBtgPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [ethBalance, setEthBalance] = useState("0.00");
  const [totalBalance, setTotalBalance] = useState("0.00");
  // Separate state for crypto and NFT transactions
  const [cryptoTransactions, setCryptoTransactions] = useState<any[]>([]);
  const [nftTransactions, setNftTransactions] = useState<any[]>([]);
  const [transactionCursor, setTransactionCursor] = useState(null);
  const [nftTransactionCursor, setNftTransactionCursor] = useState(null);
  const [nftData, setNftData] = useState<any[]>([]);
  const [nftCursor, setNftCursor] = useState(null);
  const [activeTab, setActiveTab] = useState("crypto-tab-pane");
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentNftPage, setCurrentNftPage] = useState(1);
  const [ethSupply, setEthSupply] = useState("0");
  const TRANSACTIONS_PER_PAGE = 5;
  const NFTS_PER_PAGE = 4;

  // Fetch ETH Data - now properly uses the address from useConnectedAddress
  useEffect(() => {
    async function fetchEthData() {
      if (!address) {
        // Only clear data if we're not loading and not authenticated (truly disconnected)
        if (!addressLoading && !authenticated) {
          console.log("No address available for ETH data fetch - clearing ETH data");
          setEthPrice(0);
          setEthBalance("0.00");
        }
        return;
      }

      console.log("Fetching ETH data for address:", address);

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
  }, [address, addressLoading, authenticated]); // Dependency on address from useConnectedAddress

  useEffect(() => {
    async function fetchEthSupply() {
      try {
        // Use V2 endpoint
        const res = await axios.get(
          "https://api.etherscan.io/v2/api?chainid=1&module=stats&action=ethsupply&apikey=Z816H8MXCPSYM93P9E7Q3J4HJWS3KHGG43"
        );
        
        console.log('📊 ETH Supply API Response:', res.data);
        
        // V2 API returns result directly as string in Wei
        const rawSupply = res.data.result;
        
        if (!rawSupply || res.data.status === "0") {
          console.error('❌ ETH supply API error:', res.data.message);
          return;
        }
        
        const supplyNum = parseFloat(rawSupply) / 1e18;
        
        if (isNaN(supplyNum)) {
          console.error('❌ Invalid ETH supply value:', rawSupply);
          setEthSupply("120000000"); // Fallback
          return;
        }
        
        const supplyEth = supplyNum.toLocaleString(undefined, { maximumFractionDigits: 2 });
        console.log('✅ ETH Supply set to:', supplyEth);
        setEthSupply(supplyEth);
      } catch (err) {
        console.error("Error fetching ETH supply:", err);
        setEthSupply("120000000"); // Fallback to approximate current supply
      }
    }
    fetchEthSupply();
  }, []);

  // Fetch BTG Data - now properly uses the address from useConnectedAddress
  useEffect(() => {
    async function fetchBtgData() {
      if (!address) {
        // Only clear data if we're not loading and not authenticated (truly disconnected)
        if (!addressLoading && !authenticated) {
          console.log("No address available for BTG data fetch - clearing BTG data");
          setBtgPrice(0);
          setBtgBalance("0.00");
          setTotalBalance("0.00");
        }
        return;
      }

      console.log("Fetching BTG data for address:", address);

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
  }, [address, addressLoading, authenticated]); // Dependency on address from useConnectedAddress

  // Fetch Crypto Transactions
  const fetchCryptoTransactions = async (cursor = null, limit = 10) => {
    if (!address) {
      console.log("No address available for crypto transactions fetch");
      setLoadingTx(true); // 👈 start loader
      return;
    }
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

      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/swaps?${params.toString()}`,
        {
          headers: { accept: "application/json", "X-API-Key": API_KEY },
        }
      );

      const fetchedCryptoTxs = response.data.result
        .filter((tx: any) => {
          // Skip if we've already seen this transaction
          if (seenCryptoHashes.current.has(tx.transactionHash)) {
            console.log('⚠️ Skipping duplicate crypto tx:', tx.transactionHash);
            return false;
          }
          seenCryptoHashes.current.add(tx.transactionHash);
          return true;
        })
        .map((tx: any) => {
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

      console.log('💰 Fetched crypto transactions:', {
        received: response.data.result.length,
        afterFilter: fetchedCryptoTxs.length,
        cursor: response.data.cursor ? 'exists' : 'null'
      });

      // Update crypto transactions state - append without deduping yet
      if (fetchedCryptoTxs.length > 0) {
        setCryptoTransactions((prev) => [...prev, ...fetchedCryptoTxs]);
      }
      setTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching crypto transactions:", error);
    } finally {
      setLoadingTx(false); // 👈 stop loader
    }
  };

  // Fetch NFT Transactions
  const fetchNftTransactions = async (cursor = null, limit = 10) => {
    if (!address) {
      console.log("No address available for NFT transactions fetch");
      setLoadingNFTs(true);
      return;
    }

    // Only set loading if it's not already loading
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

      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft/transfers?${params.toString()}`,
        {
          headers: { accept: "application/json", "X-API-Key": API_KEY },
        }
      );
      // Fetch full transaction details to check if ETH was paid
      const transactionsWithValue = await Promise.all(
        response.data.result
          .filter((tx: any) => tx.token_address.toLowerCase() === nftInfo.address.toLowerCase())
          .map(async (tx: any) => {
            try {
              // Fetch the full transaction to get the value
              const txResponse = await axios.get(
                `https://deep-index.moralis.io/api/v2.2/transaction/${tx.transaction_hash}?chain=base`,
                {
                  headers: { accept: "application/json", "X-API-Key": API_KEY },
                }
              );
              return { ...tx, transaction_value: txResponse.data.value };
            } catch (error) {
              console.error('Error fetching transaction details:', error);
              return { ...tx, transaction_value: "0" };
            }
          })
      );

      const fetchedNftTxs = transactionsWithValue
        .filter((tx: any) => {
          // Create unique key for NFT transactions (hash + token ID)
          const uniqueKey = `${tx.transaction_hash}-${tx.token_id}`;
          if (seenNftHashes.current.has(uniqueKey)) {
            console.log('⚠️ Skipping duplicate NFT tx:', uniqueKey);
            return false;
          }
          seenNftHashes.current.add(uniqueKey);
          return true;
        })
        .map((tx: any) => {
          // Debug logging to see what data we have
          console.log('NFT Transfer Data:', {
            token_id: tx.token_id,
            from: tx.from_address,
            to: tx.to_address,
            operator: tx.operator,
            nft_value: tx.value,
            transaction_value: tx.transaction_value,
            transaction_hash: tx.transaction_hash,
            possible_spam: tx.possible_spam,
            verified_collection: tx.verified_collection
          });
          
          const tokenId = parseInt(tx.token_id);
          let NftType = "Standard 100m²";
          let transactionType = "NFT Transfer"; // default

          // classify NFT type by tokenId ranges
          if (tokenId >= 1 && tokenId <= 400) {
            NftType = "Legendary 1000m²";
          } else if (tokenId >= 401 && tokenId <= 1200) {
            NftType = "Premium 500m²";
          }

          // classify transaction type
          if (tx.from_address === "0x0000000000000000000000000000000000000000") {
            transactionType = "NFT Mint"; // minted from null address
          } else if (tx.transaction_value && tx.transaction_value !== "0") {
            transactionType = "NFT Purchase"; // has value = purchase
          } else {
            transactionType = "NFT Transfer"; // no value = transfer
          }

          // value sign depending on direction
          let nftValue = `+1 NFT`;
          if (tx.from_address?.toLowerCase() === address.toLowerCase()) {
            nftValue = `-1 NFT`; // outgoing
          }

          return {
            type: "nft",
            transaction: transactionType,
            NftType,
            value: nftValue,
            grayValue: `NFT ID: ${tx.token_id}`,
            date: new Date(tx.block_timestamp).toLocaleString(),
            timestamp: new Date(tx.block_timestamp).getTime(),
            transactionHash: tx.transaction_hash || tx.transactionHash,
          };
        });


      console.log('🎨 Fetched NFT transactions:', {
        received: transactionsWithValue.length,
        afterFilter: fetchedNftTxs.length,
        cursor: response.data.cursor ? 'exists' : 'null'
      });

      // Update NFT transactions state - append without deduping yet
      if (fetchedNftTxs.length > 0) {
        setNftTransactions((prev) => [...prev, ...fetchedNftTxs]);
        
        // Check if there's a new incoming NFT purchase/mint
        const hasNewIncomingNft = fetchedNftTxs.some(tx => 
          tx.value.startsWith('+') && // Incoming
          (tx.transaction === 'NFT Purchase' || tx.transaction === 'NFT Mint')
        );
        
        if (hasNewIncomingNft && !cursor) {
          console.log('🎉 New NFT detected! Refreshing NFT grid immediately...');
          
          // Refresh NFT data immediately
          setNftData([]); // Clear existing data
          setNftCursor(null);
          fetchNfts(null, 100);
        }
      }
      setNftTransactionCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFT transactions:", error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Fetch NFTs
  const fetchNfts = async (cursor = null, limit = 4) => {
    if (!address) {
      console.log("No address available for NFTs fetch");
      setLoadingNftGrid(true)
      return;
    }
    if (!cursor) {
      setLoadingNftGrid(true);
    }
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

      const nfts = response.data.result.map((nft: any) => {
        // Use token ID as timestamp proxy (higher ID = more recent)
        // This works for sequential minting
        const tokenId = parseInt(nft.token_id);
        const timestamp = tokenId * 1000000; // Multiply to make it sortable
        
        return {
          type: "nft",
          transaction: "NFT Minted",
          value: `+${nft.amount || 1} NFT`,
          grayValue: `NFT ID: ${nft.token_id}`,
          date: new Date(nft.last_token_uri_sync || nft.last_metadata_sync).toLocaleString(),
          timestamp: timestamp, // Use token ID as proxy for mint order
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

      // Append NFT data without deduping yet
      setNftData((prev) => [...prev, ...nfts]);
      setNftCursor(response.data.cursor || null);
    } catch (error) {
      console.error("Error fetching NFTs from Moralis:", error);
    } finally {
      setLoadingNftGrid(false);
    }
  };

  // Merge crypto and NFT transactions, dedupe and sort
  const allTransactions = React.useMemo(() => {
    console.log('🔄 Merging transactions:', {
      cryptoRaw: cryptoTransactions.length,
      nftRaw: nftTransactions.length,
      combined: cryptoTransactions.length + nftTransactions.length
    });
    const merged = dedupeByHash([...cryptoTransactions, ...nftTransactions]);
    console.log('✅ Merge complete:', {
      final: merged.length,
      cryptoInFinal: merged.filter(t => t.type === 'crypto').length,
      nftInFinal: merged.filter(t => t.type === 'nft').length
    });
    return merged;
  }, [cryptoTransactions, nftTransactions]);

  // Calculate pagination for transactions
  const totalTransactionPages = Math.ceil(allTransactions.length / TRANSACTIONS_PER_PAGE);
  const paginatedTransactions = allTransactions.slice(
    (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE,
    currentTransactionPage * TRANSACTIONS_PER_PAGE
  );
  
  console.log('📊 Transaction Pagination:', {
    total: allTransactions.length,
    perPage: TRANSACTIONS_PER_PAGE,
    currentPage: currentTransactionPage,
    totalPages: totalTransactionPages,
    showing: paginatedTransactions.length,
    firstItem: paginatedTransactions[0]?.transaction || 'none',
    lastItem: paginatedTransactions[paginatedTransactions.length - 1]?.transaction || 'none'
  });

  // Deduplicate and sort NFT data by timestamp (newest first)
  const allNftData = React.useMemo(() => {
    const deduped = dedupeByHash(nftData);
    console.log('🖼️ Deduped & Sorted NFTs:', {
      raw: nftData.length,
      deduped: deduped.length,
      firstNFT: deduped[0] ? {
        tokenId: deduped[0].tokenId,
        date: deduped[0].date,
        timestamp: deduped[0].timestamp
      } : 'none',
      lastNFT: deduped[deduped.length - 1] ? {
        tokenId: deduped[deduped.length - 1].tokenId,
        date: deduped[deduped.length - 1].date,
        timestamp: deduped[deduped.length - 1].timestamp
      } : 'none'
    });
    return deduped;
  }, [nftData]);

  // Calculate pagination for NFTs
  const totalNftPages = Math.ceil(allNftData.length / NFTS_PER_PAGE);
  const paginatedNfts = allNftData.slice(
    (currentNftPage - 1) * NFTS_PER_PAGE,
    currentNftPage * NFTS_PER_PAGE
  );
  
  console.log('🖼️ NFT Pagination:', {
    total: allNftData.length,
    perPage: NFTS_PER_PAGE,
    currentPage: currentNftPage,
    totalPages: totalNftPages,
    showing: paginatedNfts.length,
    nftIds: paginatedNfts.map(n => n.tokenId)
  });



  // DISABLED: Auto-fetch causes infinite loops and duplicates
  // Instead, we fetch everything on initial load with high limits
  
  // // Auto-fetch all remaining NFTs after initial load
  // useEffect(() => {
  //   if (hasInitialNftLoad && nftCursor && !loadingNftGrid && !isAutoFetchingNft.current) {
  //     console.log('🖼️ Auto-fetching remaining NFTs...', { cursor: nftCursor });
  //     isAutoFetchingNft.current = true;
  //     fetchNfts(nftCursor, 100).finally(() => {
  //       // Don't reset the flag - we only want to fetch once per cursor
  //     });
  //   }
  // }, [hasInitialNftLoad, nftCursor, loadingNftGrid]);

  // // Auto-fetch all remaining transactions after initial load
  // useEffect(() => {
  //   if (hasInitialTransaction && (transactionCursor || nftTransactionCursor) && !loadingTx && !loadingNFTs && !isAutoFetchingTx.current) {
  //     console.log('📊 Auto-fetching remaining transactions...', {
  //       cryptoCursor: transactionCursor ? 'exists' : 'null',
  //       nftCursor: nftTransactionCursor ? 'exists' : 'null'
  //     });
  //     
  //     isAutoFetchingTx.current = true;
  //     
  //     // Fetch crypto transactions if cursor exists
  //     if (transactionCursor) {
  //       fetchCryptoTransactions(transactionCursor, 100); // Fetch all at once
  //     }
  //     
  //     // Fetch NFT transactions if cursor exists
  //     if (nftTransactionCursor) {
  //       fetchNftTransactions(nftTransactionCursor, 100); // Fetch all at once
  //     }
  //   }
  // }, [hasInitialTransaction, transactionCursor, nftTransactionCursor, loadingTx, loadingNFTs]);

  // Handle transaction page change - just navigate, don't fetch
  const handleTransactionPageChange = (newPage: number) => {
    setCurrentTransactionPage(newPage);
  };

  // Handle NFT page change - just navigate, don't fetch
  const handleNftPageChange = (newPage: number) => {
    setCurrentNftPage(newPage);
  };

  // Manual refresh NFTs - for when user purchases new NFT
 
  // Initial Fetch - will use the correct address from useConnectedAddress
  useEffect(() => {
    // Wait for address loading to complete
    if (addressLoading) {
      console.log("⏳ Waiting for address to load...");
      return;
    }
    
    if (address) {
      console.log("✅ Initializing data fetch for address:", address);

      // Set loading states BEFORE starting fetch
      setLoadingTx(true);
      setLoadingNFTs(true);
      setLoadingNftGrid(true);

      // Reset state
      setCryptoTransactions([]);
      setNftTransactions([]);
      setTransactionCursor(null);
      setNftTransactionCursor(null);
      setNftData([]);
      setNftCursor(null);
      setHasInitialNftLoad(false);
      setHasInitialTransaction(false);
      setCurrentTransactionPage(1); // Reset to first page
      setCurrentNftPage(1); // Reset NFT page to first
      
      // Clear seen hashes
      seenCryptoHashes.current.clear();
      seenNftHashes.current.clear();
      isAutoFetchingTx.current = false;
      isAutoFetchingNft.current = false;

      // Fetch ALL data at once (no auto-fetch needed)
      Promise.all([
        fetchCryptoTransactions(null, 100), // Fetch up to 100 crypto transactions
        fetchNftTransactions(null, 100),    // Fetch up to 100 NFT transactions
        fetchNfts(null, 100),               // Fetch up to 100 NFTs
      ]).finally(() => {
        setHasInitialNftLoad(true);
        setHasInitialTransaction(true);
        console.log('✅ Initial data fetch complete');
      });
    } else {
      // Only clear data if we're truly disconnected (not just loading)
      if (!authenticated) {
        console.log("❌ No address available - clearing data");
        // Clear all data when disconnected
        setCryptoTransactions([]);
        setNftTransactions([]);
        setTransactionCursor(null);
        setNftTransactionCursor(null);
        setNftData([]);
        setNftCursor(null);
        setHasInitialNftLoad(false);
        setHasInitialTransaction(false);
        setLoadingTx(false);
        setLoadingNFTs(false);
        setLoadingNftGrid(false);
        
        // Clear seen hashes
        seenCryptoHashes.current.clear();
        seenNftHashes.current.clear();
        isAutoFetchingTx.current = false;
        isAutoFetchingNft.current = false;
      }
    }
  }, [address, addressLoading, authenticated]);


  // Wallet Connection Status - updated to handle the new address source
  useEffect(() => {
    // Show loading only when Privy is not ready OR address is actively loading
    if (!ready || addressLoading) {
      setStatus("loading");
      return;
    }
    
    // Once loading is complete, check if we have a connected wallet
    if (authenticated && address) {
      console.log("✅ Status: loaded with address:", address);
      setStatus("loaded");
    } else {
      // Not authenticated OR no address = disconnected
      console.log("❌ Status: disconnected", { authenticated, address });
      setStatus("disconnected");
    }
  }, [ready, authenticated, address, addressLoading]);

  // Handle Tab Navigation
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
            {/* Debug Banner - Remove in production */}
            
            <BalanceCard
              totalBalance={totalBalance}
              btgBalance={btgBalance}
              btgToken={btgToken}
            />
            <PortfolioTabs
              address={address}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              transactions={paginatedTransactions}
              allTransactions={allTransactions}
              currentTransactionPage={currentTransactionPage}
              totalTransactionPages={totalTransactionPages}
              onTransactionPageChange={handleTransactionPageChange}
              nftData={paginatedNfts}
              allNftData={allNftData}
              currentNftPage={currentNftPage}
              totalNftPages={totalNftPages}
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