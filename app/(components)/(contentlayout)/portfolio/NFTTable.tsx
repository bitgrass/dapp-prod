import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface NftData {
  contract_address: string;
  name: string;
  slug: string | null;
  description: string | null;
  image: string | undefined;
  floor_price: number | null;
  symbol: string;
  tokenId: string;
  collectionName: string;
}

interface NFTTableProps {
  nftData: NftData[];
  nftCursor: string | null;
  fetchMore?: (cursor: any | null) => void;
  loading?: boolean; // controlled by parent
  hasInitiallyLoaded?: boolean; // Add this to track if initial load is complete
}

const NFTTable = ({
  nftData,
  nftCursor,
  fetchMore,
  loading = false,
  hasInitiallyLoaded = false
}: NFTTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Helper: get tier details by tokenId
  const getTier = (tokenId: number) => {
    if (tokenId >= 1 && tokenId <= 400) {
      return {
        label: "Legendary",
        // Warm gold tones, smooth blend
        badgeBg: "bg-gradient-to-r from-yellow-400 to-yellow-500",
        icon: "/assets/images/brand-logos/Legendary.svg",
      };
    }
    if (tokenId >= 401 && tokenId <= 1200) {
      return {
        label: "Premium",
        // Softer cyan/blue blend
        badgeBg: "bg-gradient-to-r from-cyan-400 to-sky-500",
        icon: "/assets/images/brand-logos/Premium.svg",
      };
    }
    if (tokenId >= 1201 && tokenId <= 3200) {
      return {
        label: "Standard",
        // Natural green blend, not too far apart
        badgeBg: "bg-secondary",
        icon: "/assets/images/brand-logos/Standard.svg",
      };
    }
    return null;
  };


  const getNftImage = (tokenId: number, originalImage?: string) => {
    if (tokenId >= 1 && tokenId <= 400) {
      // Legendary
      return "/assets/images/apps/1000m2v1.jpg";
    }
    if (tokenId >= 401 && tokenId <= 1200) {
      // Premium
      return "/assets/images/apps/500m2v1.jpg";
    }
    if (tokenId >= 1201 && tokenId <= 3200) {
      // Standard
      return "/assets/images/apps/100m2v1.jpg";
    }
    // fallback to API image if no match
    return originalImage || "/assets/images/apps/placeholder.jpg";
  };


  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;
    const onScroll = () => {
      setShowScrollHint(scrollArea.scrollTop <= 20);
    };
    scrollArea.addEventListener("scroll", onScroll);
    return () => scrollArea.removeEventListener("scroll", onScroll);
  }, []);

  // 1️⃣ Initial loading state - show spinner when initially loading OR when loading and no data has been loaded yet
  if (loading && !hasInitiallyLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <p className="ml-3 text-sm">Loading NFTs, please wait...</p>
      </div>
    );
  }

  // 2️⃣ Loaded but no NFTs - only show this if we've completed initial load and have no data
  if (hasInitiallyLoaded && (!nftData || nftData.length === 0)) {
    return (
      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-full">
          <div className="box text-center">
            <div className="box-body">
              <p className="mb-4 inline-flex">
                {/* SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="w-12 h-12"
                >
                  <linearGradient id="a" x1="32" x2="32" y1="63.7" y2="0.8" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2ab793" />
                    <stop offset="1" stopColor="#2c98b5" />
                  </linearGradient>
                  <path
                    fill="url(#a)"
                    d="M53 26V13.4L32 1.9 11 13.4v25.2l21 11.6 21-11.5V33h-2v4.4L32 47.9l-13-7.2V19l12-6.6V45h2V25.6l18-9.9V26h2z"
                  />
                </svg>
              </p>
              <p className="box-title font-semibold">Still missing your NFT?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Last week, hundreds of users joined the revolution of tokenized land ownership. <br />
                Today, it's your turn.
              </p>
              <Link
                href="/ownplot/standard"
                className="ti-btn bg-secondary text-white !font-medium px-6 py-2"
              >
                Mint Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3️⃣ NFTs exist
  return (
    <div className="flex flex-col" style={{ height: "70vh" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
          {nftData.map((nft) => (
            <div
              className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12"
              key={nft.tokenId}
            >
              <div className="box overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <img
                    src={getNftImage(Number(nft.tokenId), nft.image)}
                    className="w-full h-full object-cover rounded-t-lg"
                    alt={nft.name || "NFT Image"}
                  />

                  {/* Badge Overlay - Fixed positioning */}
                  {(() => {
                    const tier = getTier(Number(nft.tokenId));
                    if (!tier) return null;
                    return (
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className={`inline-flex items-center gap-2 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg ${tier.badgeBg}`}
                        >
                          #{nft.tokenId}
                          <img
                            src={tier.icon}
                            alt={tier.label}
                            className="w-4 h-4 object-contain"
                          />
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="box-body">
                  <div className="flex items-center mb-3">
                    <img
                      src={nft.image || "/assets/images/apps/placeholder.jpg"}
                      alt={nft.name}
                      className="avatar avatar-md rounded-md me-2"
                    />
                    <div>
                      <p className="mb-0 font-semibold text-sm">{nft.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0">
                        @{nft.collectionName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {nft.description || "No description available."}
                  </p>
                  <div className="grid">
                    <Link href="/leaderboard" className="ti-btn ti-btn-primary w-full">
                      Check reward eligibility
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          ))}
        </div>
      </div>

      {/* Load More button */}
      {nftCursor && (
        <div className="box-footer text-center">
          <button
            className={`ti-btn bg-secondary text-white px-6 py-2 ${loadingMore ? "btn-loading" : ""}`}
            onClick={async () => {
              setLoadingMore(true);
              await fetchMore?.(nftCursor);
              setLoadingMore(false);
            }}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTTable;