import { useEffect, useState } from "react";
import { nftInfo } from "@/shared/data/tokens/data";

const API_KEY =
  process.env.NEXT_PUBLIC_MORALIS_APY_KEY ||
  process.env.NEXT_PUBLIC_MORALIS_API_KEY;
const CONTRACT_ADDRESS = nftInfo.address;
const CHAIN = "base";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_LIMIT = 100; // Moralis cap per page
const CONCURRENCY = 5; // per-token fetch concurrency
const RETRIES = 3;

// Set this to your marketplace/escrow source address (lowercased)
const EXCLUDED_ADDRESS =
  process.env.NEXT_PUBLIC_OPENSEA_ADDRESS?.toLowerCase() || null;

export interface RankedHolder {
  address: string;
  legendary: number;
  premium: number;
  standard: number;
  btg_claim: number;
}

type OwnerRow = { owner_of: string; token_id: string };
type TransferRow = { token_id: string; from_address: string; to_address: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetchJSONWithRetry = async (
  url: string,
  headers: Record<string, string>,
  tries = RETRIES
): Promise<any> => {
  let attempt = 0;
  let lastErr: any;
  while (attempt < tries) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json();

    const body = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status} ${res.statusText} — ${body || "no body"}`);

    // retry on 429/5xx
    if (res.status === 429 || res.status >= 500) {
      const backoff = Math.min(2000, 400 * Math.pow(2, attempt));
      await sleep(backoff);
      attempt++;
      lastErr = err;
      continue;
    }
    throw err; // non-retriable (400/401/403)
  }
  throw lastErr || new Error("Request failed");
};

// For a given token, find the qualifying event recipient:
// - Prefer the earliest transfer where from === EXCLUDED_ADDRESS
// - Else use the mint event (from === ZERO_ADDRESS)
// Return { recipient: string | null, kind: 'firstBuy' | 'mint' | null }
const getQualifyingRecipientForToken = async (
  tokenId: number,
  headers: Record<string, string>
): Promise<{ recipient: string | null; kind: "firstBuy" | "mint" | null }> => {
  let cursor: string | null = null;
  let mintRecipient: string | null = null;

  while (true) {
    const url =
      `https://deep-index.moralis.io/api/v2.2/nft/${CONTRACT_ADDRESS}/${tokenId}/transfers` +
      `?chain=${CHAIN}&format=decimal&order=ASC&limit=${MAX_LIMIT}` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");
    const data = await fetchJSONWithRetry(url, headers);

    const page: TransferRow[] = data?.result || [];
    if (page.length === 0) break;

    // Scan in ascending order; capture mint recipient if seen; return immediately if firstBuy found
    for (let i = 0; i < page.length; i++) {
      const row = page[i];
      const fromLc = (row.from_address || "").toLowerCase();
      const toLc = (row.to_address || "").toLowerCase();

      if (EXCLUDED_ADDRESS && fromLc === EXCLUDED_ADDRESS) {
        // First qualifying "first buy" found
        return { recipient: toLc, kind: "firstBuy" };
      }

      if (!mintRecipient && fromLc === ZERO_ADDRESS) {
        mintRecipient = toLc; // remember earliest mint recipient
      }
    }

    cursor = data?.cursor ?? null;
    if (!cursor) break;
  }

  if (mintRecipient) return { recipient: mintRecipient, kind: "mint" };
  return { recipient: null, kind: null };
};

export function useNFTLeaderboard() {
  const [ranked, setRanked] = useState<RankedHolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!API_KEY) throw new Error("Missing Moralis API key");
        if (!CONTRACT_ADDRESS) throw new Error("Missing contract address");

        const headers = { accept: "application/json", "X-API-Key": API_KEY };

        // 1) Fetch all CURRENT owners (paginated)
        const owners: OwnerRow[] = [];
        let ownersCursor: string | null = null;
        do {
          const url =
            `https://deep-index.moralis.io/api/v2.2/nft/${CONTRACT_ADDRESS}/owners` +
            `?chain=${CHAIN}&format=decimal&limit=${MAX_LIMIT}` +
            (ownersCursor ? `&cursor=${encodeURIComponent(ownersCursor)}` : "");
          const data = await fetchJSONWithRetry(url, headers);
          if (Array.isArray(data?.result)) owners.push(...(data.result as OwnerRow[]));
          ownersCursor = data?.cursor ?? null;
        } while (ownersCursor);

        // Map tokenId -> currentOwner (skip escrow/excluded owners)
        const currentOwnerOfToken = new Map<number, string>();
        for (let i = 0; i < owners.length; i++) {
          const row = owners[i];
          const addr = (row.owner_of || "").toLowerCase();
          if (EXCLUDED_ADDRESS && addr === EXCLUDED_ADDRESS) continue; // ignore escrow balances
          const id = Number.parseInt(row.token_id, 10);
          if (!Number.isFinite(id)) continue;
          currentOwnerOfToken.set(id, addr);
        }

        if (currentOwnerOfToken.size === 0) {
          setRanked([]);
          return;
        }

        // Pre-create holder rows for visibility (counts reflect current holdings)
        const holders: Record<string, RankedHolder> = {};
        currentOwnerOfToken.forEach((addr, tokenId) => {
          if (!holders[addr]) {
            holders[addr] = { address: addr, legendary: 0, premium: 0, standard: 0, btg_claim: 0 };
          }
          if (tokenId >= 1 && tokenId <= 400) {
            holders[addr].legendary += 1;
          } else if (tokenId >= 401 && tokenId <= 1200) {
            holders[addr].premium += 1;
          } else if (tokenId >= 1201 && tokenId <= 3200) {
            holders[addr].standard += 1;
          }
        });

        // 2) For each token currently held, find qualifying recipient (firstBuy>mint)
        const tokenIds: number[] = [];
        currentOwnerOfToken.forEach((_owner, id) => tokenIds.push(id));

        const qualifyingByToken = new Map<
          number,
          { recipient: string | null; kind: "firstBuy" | "mint" | null }
        >();

        const work = async (id: number) => {
          try {
            const q = await getQualifyingRecipientForToken(id, headers);
            qualifyingByToken.set(id, q);
          } catch (e) {
            // final small retry
            try {
              await sleep(300);
              const q = await getQualifyingRecipientForToken(id, headers);
              qualifyingByToken.set(id, q);
            } catch {
              qualifyingByToken.set(id, { recipient: null, kind: null });
            }
          }
        };

        for (let i = 0; i < tokenIds.length; i += CONCURRENCY) {
          const slice = tokenIds.slice(i, i + CONCURRENCY);
          await Promise.all(slice.map((id) => work(id)));
          await sleep(50);
        }

        // 3) Award points if the current owner is the qualifying recipient
        const addPoints = (addr: string, tokenId: number) => {
          if (tokenId >= 1 && tokenId <= 400) {
            holders[addr].btg_claim += 35000;
          } else if (tokenId >= 401 && tokenId <= 1200) {
            holders[addr].btg_claim += 20000;
          } else if (tokenId >= 1201 && tokenId <= 3200) {
            holders[addr].btg_claim += 5000;
          }
        };

        currentOwnerOfToken.forEach((currentOwner, tokenId) => {
          const q = qualifyingByToken.get(tokenId);
          if (!q || !q.recipient) return;
          if (q.recipient === currentOwner) addPoints(currentOwner, tokenId);
        });

        // 4) Build final ranking (hide ineligible: btg_claim === 0)
        const arr: RankedHolder[] = Object.values(holders)
          .filter((h) => h.btg_claim > 0) // only eligible holders
          .sort((a, b) => b.btg_claim - a.btg_claim);

        setRanked(arr);
      } catch (e) {
        setRanked([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { ranked, loading };
}
