import { NextResponse } from "next/server";
import { fetchQuotes } from "@/lib/coingecko";
import { allMarkets, getUniqueGeckoIds } from "@/lib/markets";

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 30_000; // 30 seconds

export async function GET() {
  const cached = cache.get("prices");

  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  const ids = getUniqueGeckoIds(allMarkets);
  const quotes = await fetchQuotes(ids, ["usd", "inr", "eur", "gbp"]);

  cache.set("prices", { data: quotes, ts: Date.now() });

  return NextResponse.json(quotes);
}