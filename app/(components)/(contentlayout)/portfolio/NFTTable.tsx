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
}

const NFTTable = ({ nftData, nftCursor, fetchMore }: NFTTableProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;
    const onScroll = () => {
      if (scrollArea.scrollTop > 20) setShowScrollHint(false);
      else setShowScrollHint(true);
    };
    scrollArea.addEventListener("scroll", onScroll);
    return () => scrollArea.removeEventListener("scroll", onScroll);
  }, []);

  if (!nftData?.length) {
    return (
      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-full">
          <div className="box text-center">
            <div className="box-body">
              <p className="mb-4 inline-flex">
                {/* ...SVG as before... */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="w-12 h-12"
                >
                  <linearGradient
                    id="a"
                    x1="32"
                    x2="32"
                    y1="63.723"
                    y2="0.835"
                    gradientTransform="matrix(1 0,0,-1,0 63.89)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#2ab793" />
                    <stop offset="1" stopColor="#2c98b5" />
                  </linearGradient>
                  <path
                    fill="url(#a)"
                    d="M53 26 V13.4L32 1.9 11 13.4v25.2l21 11.6 21-11.5V33h-2v4.4L32 47.9l-13-7.2V19l12-6.6V45h2V25.6l18-9.9V26h2zm-3.1-12L32 23.9l-11.9-6.6 17.7-10 7.76L49.9 14zM35.6 6.1L18 16.2 14.1 14 32 4.1l3.6 2zM17 39.6l-4-2.2V15.7l4 2.2v21.7z"
                  />
                  <linearGradient
                    id="b"
                    x1="35.769"
                    x2="35.769"
                    y1="63.723"
                    y2="0.835"
                    gradientTransform="matrix(1 0 0 -1 0 63.89)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#2ab793" />
                    <stop offset="1" stopColor="#2c98b5" />
                  </linearGradient>
                  <path
                    fill="url(#b)"
                    d="M38 26v2h-6c7.2 0 13 5.8 13 13s-5.8 13-13 13H16.4l5.3-5.3-1.4-1.4-7.8 7.7 8.8 7.7 1.3-1.5-6-5.2H44c8.3 0 15-6.7 15-15s-6.7-15-15-15h-6z"
                  />
                </svg>
              </p>
              <p className="box-title font-semibold">Still missing your NFT?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Last week, hundreds of users joined the revolution of tokenized land ownership. <br />
                Today, it's your turn.
              </p>
              <Link href="/mint" className="ti-btn bg-secondary text-white !font-medium m-0 !me-[0.375rem] btn btn-primary px-6 py-2">
                Mint Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "70vh" }}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative"
      >

        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
          {nftData.map((nft) => (
            <div
              className="xxl:col-span-3 xl:col-span-3 lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12"
              key={nft.tokenId}
            >
              <div className="box overflow-hidden">
                <img
                  src={nft.image || "/assets/images/apps/placeholder.jpg"}
                  className="card-img-top object-cover h-80 w-full"
                  alt={nft.name || "NFT Image"}
                />
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
                    <button
                      onClick={() => window.open('https://staking.bitgrass.com', '_blank')}
                      type="button"
                      className="ti-btn ti-btn-primary w-full"
                    >
                      Claim rewarded $BTG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {nftCursor && (
        <div className="box-footer text-center">
          <button
            className={`ti-btn bg-secondary text-white !font-medium m-0 !me-[0.375rem] btn btn-primary px-6 py-2${loading ? " btn-loading" : ""}`}
            onClick={async () => {
              setLoading(true);
              await fetchMore?.(nftCursor);
              setTimeout(() => setLoading(false), 500); // for feedback
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTTable;
