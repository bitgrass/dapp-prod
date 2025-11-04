import React, { useMemo, useCallback } from "react";
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
  timestamp: number; // ✅ Added for sorting by buy date
  date?: string; // Optional formatted date string
}

interface NFTTableProps {
  nftData: NftData[];
  allNftData: NftData[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  hasInitiallyLoaded?: boolean;
}

const NFTTable = ({
  nftData,
  allNftData,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  hasInitiallyLoaded = false
}: NFTTableProps) => {

  // ✅ Sort NFTs by timestamp (buy date) - newest first
  const sortedNftData = useMemo(() => {
    return [...nftData].sort((a, b) => b.timestamp - a.timestamp);
  }, [nftData]);

  // Helper: get tier details by tokenId
  const getTier = (tokenId: number) => {
    if (tokenId >= 1 && tokenId <= 400) {
      return {
        label: "Legendary",
        badgeBg: "bg-gradient-to-r from-yellow-400 to-yellow-500",
        icon: "/assets/images/brand-logos/Legendary.svg",
      };
    }
    if (tokenId >= 401 && tokenId <= 1200) {
      return {
        label: "Premium",
        badgeBg: "bg-gradient-to-r from-cyan-400 to-sky-500",
        icon: "/assets/images/brand-logos/Premium.svg",
      };
    }
    if (tokenId >= 1201 && tokenId <= 3200) {
      return {
        label: "Standard",
        badgeBg: "bg-secondary",
        icon: "/assets/images/brand-logos/Standard.svg",
      };
    }
    return null;
  };

  const getNftImage = (tokenId: number, originalImage?: string) => {
    if (tokenId >= 1 && tokenId <= 400) {
      return "/assets/images/apps/1000m2v1.jpg";
    }
    if (tokenId >= 401 && tokenId <= 1200) {
      return "/assets/images/apps/500m2v1.jpg";
    }
    if (tokenId >= 1201 && tokenId <= 3200) {
      return "/assets/images/apps/100m2v1.jpg";
    }
    return originalImage || "/assets/images/apps/placeholder.jpg";
  };

  // ✅ Memoize page numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }

    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  }, [currentPage, totalPages]);

  // ✅ Add click guard
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) {
      return;
    }
    onPageChange(newPage);
  }, [currentPage, totalPages, onPageChange]);

  // 1️⃣ Initial loading state
  if (loading && !hasInitiallyLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <p className="ml-3 text-sm">Loading NFTs, please wait...</p>
      </div>
    );
  }

  // 2️⃣ Loaded but no NFTs
  if (hasInitiallyLoaded && (!sortedNftData || sortedNftData.length === 0)) {
    return (
      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-full">
          <div className="box text-center">
            <div className="box-body">
              <p className="mb-4 inline-flex">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="20" fill="#EAECF0" />
                  <path d="M7.00391 19.3687C7.00391 26.2995 12.8215 31.9179 19.9981 31.9179C19.9981 24.987 14.1805 19.3687 7.00391 19.3687Z" fill="#98A2B3" />
                  <path d="M33.0039 19.3687C25.8274 19.3687 20.0098 24.987 20.0098 31.9179C27.1863 31.9179 33.0039 26.2995 33.0039 19.3687Z" fill="#98A2B3" />
                  <path d="M20.0039 8.3999C18.4636 11.4804 16.0844 13.8596 13.0039 15.3999C16.0844 16.9402 18.4636 19.3194 20.0039 22.3999C21.5442 19.3194 23.9234 16.9402 27.0039 15.3999C23.9234 13.8596 21.5442 11.4804 20.0039 8.3999Z" fill="#98A2B3" />
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
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3️⃣ NFTs exist - Use sortedNftData
  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-full">
        <div className="box">
          <div className="box-body">
            <div className="grid grid-cols-12 gap-x-6 gap-y-4">
              {sortedNftData.map((nft) => (
                <div
                  className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12"
                  key={`nft-${nft.tokenId}-${nft.timestamp}`}
                >
                  <div className="box overflow-hidden">
                    <div className="relative aspect-[4/5]">
                      <img
                        src={getNftImage(Number(nft.tokenId), nft.image)}
                        className="w-full h-full object-cover rounded-t-lg"
                        alt={nft.name || "NFT Image"}
                      />

                      {/* Badge Overlay */}
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

                      {/* ✅ Show purchase date if available */}
                      {nft.date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Purchased: {nft.date}
                        </p>
                      )}

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

          {/* Pagination */}
          {allNftData && allNftData.length > 0 && totalPages > 1 && (
            <div className="box-footer" style={{ paddingInline: "0px" }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
                  Showing page {currentPage} of {totalPages} ({allNftData?.length || 0} total NFTs)
                </div>

                <nav aria-label="NFT pagination" className="w-full md:w-auto flex justify-center">
                  <ul className="ti-pagination mb-0 flex items-center gap-2 flex-wrap justify-center">
                    <li className="page-item">
                      <button
                        className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors text-sm ${currentPage === 1
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                            : 'bg-white dark:bg-bodybg hover:bg-secondary hover:text-white'
                          }`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        type="button"
                      >
                        Previous
                      </button>
                    </li>

                    {pageNumbers.map((pageNum) => (
                      <li key={`nft-page-${pageNum}`} className="page-item">
                        <button
                          className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded font-semibold transition-colors text-sm ${currentPage === pageNum
                              ? '!bg-secondary !text-white shadow-md border-secondary'
                              : 'bg-white dark:bg-bodybg hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={currentPage === pageNum}
                          type="button"
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}

                    <li className="page-item">
                      <button
                        className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors text-sm ${currentPage === totalPages
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                            : 'bg-white dark:bg-bodybg hover:bg-secondary hover:text-white'
                          }`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        type="button"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NFTTable);