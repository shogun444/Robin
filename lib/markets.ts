export type MarketTabId = "futures" | "spot";

export type MarketSeed = {
  slug: string;
  name: string;
  symbol: string;
  pair: string;
  geckoId: string;
  tab: MarketTabId;
  volume: number;
  change24h: number;
};

export const marketTabs: Array<{ id: MarketTabId; label: string }> = [
  { id: "futures", label: "Futures" },
  { id: "spot", label: "Spot" },
];

export const futuresMarkets: MarketSeed[] = [
  {
    slug: "btc",
    name: "Bitcoin",
    symbol: "BTC-PERP",
    pair: "BTC-PERP",
    geckoId: "bitcoin",
    tab: "futures",
    volume: 482_000_000,
    change24h: 2.41,
  },
  {
    slug: "eth",
    name: "Ethereum",
    symbol: "ETH-PERP",
    pair: "ETH-PERP",
    geckoId: "ethereum",
    tab: "futures",
    volume: 251_000_000,
    change24h: -1.18,
  },
  {
    slug: "sol",
    name: "Solana",
    symbol: "SOL-PERP",
    pair: "SOL-PERP",
    geckoId: "solana",
    tab: "futures",
    volume: 138_500_000,
    change24h: 4.92,
  },
  {
    slug: "xrp",
    name: "XRP",
    symbol: "XRP-PERP",
    pair: "XRP-PERP",
    geckoId: "ripple",
    tab: "futures",
    volume: 114_200_000,
    change24h: -0.66,
  },
  {
    slug: "doge",
    name: "Dogecoin",
    symbol: "DOGE-PERP",
    pair: "DOGE-PERP",
    geckoId: "dogecoin",
    tab: "futures",
    volume: 92_000_000,
    change24h: 1.84,
  },
  {
    slug: "ada",
    name: "Cardano",
    symbol: "ADA-PERP",
    pair: "ADA-PERP",
    geckoId: "cardano",
    tab: "futures",
    volume: 88_600_000,
    change24h: 0.93,
  },
  {
    slug: "avax",
    name: "Avalanche",
    symbol: "AVAX-PERP",
    pair: "AVAX-PERP",
    geckoId: "avalanche-2",
    tab: "futures",
    volume: 72_400_000,
    change24h: -2.14,
  },
  {
    slug: "ton",
    name: "Toncoin",
    symbol: "TON-PERP",
    pair: "TON-PERP",
    geckoId: "toncoin",
    tab: "futures",
    volume: 65_100_000,
    change24h: 3.08,
  },
];

export const spotMarkets: MarketSeed[] = [
  {
    slug: "btc",
    name: "Bitcoin",
    symbol: "BTC/USD",
    pair: "BTC/USD",
    geckoId: "bitcoin",
    tab: "spot",
    volume: 1_248_000_000,
    change24h: 2.41,
  },
  {
    slug: "eth",
    name: "Ethereum",
    symbol: "ETH/USD",
    pair: "ETH/USD",
    geckoId: "ethereum",
    tab: "spot",
    volume: 812_000_000,
    change24h: -1.18,
  },
  {
    slug: "sol",
    name: "Solana",
    symbol: "SOL/USD",
    pair: "SOL/USD",
    geckoId: "solana",
    tab: "spot",
    volume: 308_000_000,
    change24h: 4.92,
  },
  {
    slug: "link",
    name: "Chainlink",
    symbol: "LINK/USD",
    pair: "LINK/USD",
    geckoId: "chainlink",
    tab: "spot",
    volume: 188_000_000,
    change24h: 0.74,
  },
  {
    slug: "xrp",
    name: "XRP",
    symbol: "XRP/USD",
    pair: "XRP/USD",
    geckoId: "ripple",
    tab: "spot",
    volume: 174_500_000,
    change24h: -0.66,
  },
  {
    slug: "xlm",
    name: "Stellar Lumens",
    symbol: "XLM/USD",
    pair: "XLM/USD",
    geckoId: "stellar",
    tab: "spot",
    volume: 108_000_000,
    change24h: 1.27,
  },
  {
    slug: "trx",
    name: "TRON",
    symbol: "TRX/USD",
    pair: "TRX/USD",
    geckoId: "tron",
    tab: "spot",
    volume: 99_500_000,
    change24h: 0.48,
  },
  {
    slug: "avax",
    name: "Avalanche",
    symbol: "AVAX/USD",
    pair: "AVAX/USD",
    geckoId: "avalanche-2",
    tab: "spot",
    volume: 87_000_000,
    change24h: -2.14,
  },
];

export const allMarkets = [...futuresMarkets, ...spotMarkets];

export const marketBySlug = new Map(
  allMarkets.map((market) => [market.slug, market] as const),
);

export function getMarketBySlug(slug: string) {
  return marketBySlug.get(slug.toLowerCase());
}

export function getMarketsForTab(tab: MarketTabId) {
  return tab === "futures" ? futuresMarkets : spotMarkets;
}

export function getUniqueGeckoIds(markets: MarketSeed[]) {
  return [...new Set(markets.map((market) => market.geckoId))];
}
