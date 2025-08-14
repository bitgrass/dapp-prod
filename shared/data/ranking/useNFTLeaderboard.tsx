import { useEffect, useState } from 'react';
import { nftInfo } from "@/shared/data/tokens/data";

const API_KEY = process.env.NEXT_PUBLIC_MORALIS_APY_KEY;
const CONTRACT_ADDRESS = nftInfo.address;
const CHAIN = "base";

// Address to exclude (lowercased for safety)
const EXCLUDED_ADDRESS = process.env.NEXT_PUBLIC_OPENSEA_ADDRESS?.toLowerCase();;

export interface RankedHolder {
  address: string;
  legendary: number;
  premium: number;
  standard: number;
  btg_claim: number;
}

export function useNFTLeaderboard() {
  const [ranked, setRanked] = useState<RankedHolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      let cursor = null;
      const owners: { owner_of: string; token_id: string }[] = [];

      try {
        while (true) {
          const url: any = `https://deep-index.moralis.io/api/v2.2/nft/${CONTRACT_ADDRESS}/owners?chain=${CHAIN}&format=decimal${cursor ? `&cursor=${cursor}` : ''}`;
          const res = await fetch(url, {
            headers: {
              'accept': 'application/json',
              'X-API-Key': API_KEY || '',
            },
          });
          const data = await res.json();
          owners.push(...data.result);

          if (!data.cursor || data.result.length === 0) break;
          cursor = data.cursor;
        }

        // Aggregate holders
        const map: Record<string, RankedHolder> = {};

        for (const { owner_of, token_id } of owners) {
          const addr = owner_of.toLowerCase();

          // Skip excluded address
          if (addr === EXCLUDED_ADDRESS) continue;

          const id = parseInt(token_id);

          if (!map[addr]) {
            map[addr] = {
              address: addr,
              legendary: 0,
              premium: 0,
              standard: 0,
              btg_claim: 0,
            };
          }

          if (id >= 1 && id <= 400) {
            map[addr].legendary += 1;
            map[addr].btg_claim += 1000;
          } else if (id >= 401 && id <= 1200) {
            map[addr].premium += 1;
            map[addr].btg_claim += 500;
          } else if (id >= 1201 && id <= 3200) {
            map[addr].standard += 1;
            map[addr].btg_claim += 100;
          }
        }

        const rankedArray = Object.values(map).sort((a, b) => b.btg_claim - a.btg_claim);
        setRanked(rankedArray);
      } catch (err) {
        console.error("Error fetching NFT leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  return { ranked, loading };
}
