import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { btgToken, nftInfo, EthInfo } from "@/shared/data/tokens/data";


interface CryptoTableProps {
  address: string;
  ethBalance: string;
  ethPrice: number;
  btgBalance: string;
  btgPrice: number;
  ethSupply: number;
}

const CryptoTable = ({
  address,
  ethBalance,
  ethPrice,
  btgBalance,
  btgPrice,
  ethSupply,
}: CryptoTableProps) => {
  const [nftData, setNftData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [btgPercentChange, setBtgPercentChange] = useState(0)
  const [ethPercentChange, setEthPercentChange] = useState(0)

  const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
  const getChangeStyle = (percent: number | string) => {
    const value = parseFloat(percent as string);
    if (value >= 0) {
      return {
        color: 'text-green-600', // Tailwind green
        icon: <i className="ri-arrow-up-s-line align-middle ms-1 me-2 text-green-600"></i>
      };
    } else {
      return {
        color: 'text-red-600', // Tailwind red
        icon: <i className="ri-arrow-down-s-line align-middle ms-1 me-2 text-red-600"></i>
      };
    }
  };

  useEffect(() => {
    async function fetchPriceBtg() {
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

        const dayHrPercentChange = response.data.usdPrice24hrPercentChange;

        if (dayHrPercentChange) {
          setBtgPercentChange(dayHrPercentChange.toFixed(2))
        } else {
          console.warn('24HrPercentChange price not found');
        }
      } catch (error) {
        console.error("Error fetching Degen price:", error);
      }
    }

    fetchPriceBtg();
  }, []);


  useEffect(() => {
    async function fetchPriceEth() {
      try {
        const response = await axios.get(
          `https://deep-index.moralis.io/api/v2.2/erc20/${EthInfo.address}/price?chain=eth&include=percent_change`,
          {
            headers: {
              accept: "application/json",
              "X-API-Key": API_KEY!,
            },
          }
        )

        const dayHrPercentChange = response.data.usdPrice24hrPercentChange;

        if (dayHrPercentChange) {
          setEthPercentChange(dayHrPercentChange.toFixed(2))
        } else {
          console.warn('24HrPercentChange price not found');
        }
      } catch (error) {
        console.error("Error fetching Degen price:", error);
      }
    }

    fetchPriceEth();
  }, []);

  // Fetch all NFTs with cursor-based pagination
  useEffect(() => {
    if (!address) return;
    const fetchAllNfts = async () => {
      setLoading(true);
      let allNfts: any[] = [];
      let cursor: string | null = null;
      try {
        do {
          const params = new URLSearchParams({
            chain: "base",
            format: "decimal",
            "token_addresses[0]": nftInfo.address,
            normalizeMetadata: "true",
            media_items: "false",
            include_prices: "false",
            limit: "100",
          });
          if (cursor) params.append("cursor", cursor);

          const response = await axios.get(
            `https://deep-index.moralis.io/api/v2.2/${address}/nft?${params.toString()}`,
            {
              headers: {
                accept: "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APY_KEY!,
              },
            }
          );

          allNfts = [...allNfts, ...(response.data.result || [])];
          cursor = response.data.cursor || null;
        } while (cursor);
      } catch (err) {
        console.error("Error fetching NFTs", err);
      } finally {
        setNftData(allNfts);
        setLoading(false);
      }
    };

    fetchAllNfts();
  }, [address]);

  // Helper to count tiers
  const getTierCounts = (nfts: any[]) => {
    let legendary = 0, premium = 0, standard = 0;
    nfts.forEach((nft) => {
      const tokenId = Number(nft.token_id || nft.tokenId);
      if (tokenId >= 1 && tokenId <= 400) legendary++;
      else if (tokenId >= 401 && tokenId <= 1200) premium++;
      else if (tokenId >= 1201 && tokenId <= 3200) standard++;
    });
    return { legendary, premium, standard };
  };

  const { legendary, premium, standard } = getTierCounts(nftData);

  const supplyNum = Number((ethSupply + "").replace(/,/g, ""));
  const priceNum = Number((ethPrice + "").replace(/,/g, ""));

  const formatLargeValue = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(Math.round(value / 100_000_000) / 10).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(Math.round(value / 100_000) / 10).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(Math.round(value / 100) / 10).toFixed(1)}K`;
    } else {
      return `$${value}`;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-12">
        <div className="flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-6 mb-6">
          {/* Standard Card */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px] shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Standard.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">{standard}</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50">Total Standard NFTs</div>
            </div>
          </div>
          {/* Premium Card */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px] shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Premium.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">{premium}</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50">Total Premium NFTs</div>
            </div>
          </div>
          {/* Legendary Card */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px] shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Legendary.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">{legendary}</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50">Total Legendary NFTs</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-4 text-center font-semibold text-lg">Loading NFT data…</div>
        ) : (
          <div className="box">
            <div className="table-responsive">
              <table className="table whitespace-nowrap min-w-full">
                <thead>
                  <tr>
                    <th scope="row" className="text-start">Asset</th>
                    <th scope="row" className="text-start">Balance</th>
                    <th scope="row" className="text-start">Price</th>
                    <th scope="row" className="text-start">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border !border-x-0 border-defaultborder dark:border-defaultborder/10">
                    <td>
                      <div className="flex items-center">
                        <div className="leading-none">
                          <span className="avatar avatar-md avatar-rounded me-2">
                            <img src="../../../assets/images/brand-logos/eth.png" alt="" />
                          </span>
                        </div>
                        <div className="items-center">
                          <p className="mb-0 font-semibold">
                            ETH<i className="bi bi-patch-check-fill text-secondary ms-2"></i>
                          </p>
                          <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">Ethereum</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="items-center">
                        <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">{ethBalance} ETH</span>
                        <p className="mb-0 font-semibold">${(parseFloat(ethBalance) * ethPrice).toFixed(2)} USD</p>
                      </div>
                    </td>
                    <td>
                      <div className="items-center">
                        <span className={`font-semibold ${getChangeStyle(ethPercentChange).color}`}>
                          {ethPercentChange}%
                          {getChangeStyle(ethPercentChange).icon}
                        </span>
                        <p className="mb-0 font-semibold">${ethPrice} USD</p>
                      </div>
                    </td>

                    <td>
                      <div className="items-center">
                        <p className="mb-0 font-semibold">
                          {formatLargeValue(supplyNum * priceNum)}
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr className="border !border-x-0 border-defaultborder dark:border-defaultborder/10">
                    <td>
                      <div className="flex items-center">
                        <div className="leading-none">
                          <span className="avatar avatar-md avatar-rounded me-2">
                            <img src="../../../assets/images/brand-logos/logo-btg.svg" alt="" />
                          </span>
                        </div>
                        <div className="items-center">
                          <p className="mb-0 font-semibold">
                            BTG<i className="bi bi-patch-check-fill text-secondary ms-2"></i>
                          </p>
                          <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">Bitgrass</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="items-center">
                        <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">{btgBalance} BTG</span>
                        <p className="mb-0 font-semibold">${(parseFloat(btgBalance) * btgPrice).toFixed(2)} USD</p>
                      </div>
                    </td>
                    <td>
                      <div className="items-center">
                        <span className={`font-semibold ${getChangeStyle(btgPercentChange).color}`}>
                          {btgPercentChange}%
                          {getChangeStyle(btgPercentChange).icon}
                        </span>
                        <p className="mb-0 font-semibold">${btgPrice} USD</p>
                      </div>
                    </td>

                    <td>
                      <div className="items-center">
                        <p className="mb-0 font-semibold">
                          {formatLargeValue(1000000000 * btgPrice)}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTable;
