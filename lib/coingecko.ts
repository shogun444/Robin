const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const BINANCE_BASE_URL = "https://api.binance.com/api/v3";
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1";
const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v2";

export type Quote = {
  usd: number;
  usd24hChange: number;
  inr: number;
  inr24hChange: number;
  eur: number;
  eur24hChange: number;
  gbp: number;
  gbp24hChange: number;
  image?: string;
};

type SimplePriceResponse = Record<string, Record<string, number>>;

type BinanceTicker = {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
};

type CoinPaprikaTicker = {
  id: string;
  name: string;
  symbol: string;
  quotes: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
  };
};

// CoinGecko symbol to Binance symbol mapping
const BINANCE_SYMBOLS: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  "avalanche-2": "AVAXUSDT",
  toncoin: "TONUSDT",
  chainlink: "LINKUSDT",
  cardano: "ADAUSDT",
  dogecoin: "DOGEUSDT",
  tron: "TRXUSDT",
  stellar: "XLMUSDT",
};

// CoinGecko ID to CoinPaprika ID mapping
const COINPAPRIKA_IDS: Record<string, string> = {
  bitcoin: "btc-bitcoin",
  ethereum: "eth-ethereum",
  solana: "sol-solana",
  ripple: "xrp-xrp",
  "avalanche-2": "avax-avalanche",
  toncoin: "ton-toncoin",
  chainlink: "link-chainlink",
  cardano: "ada-cardano",
  dogecoin: "doge-dogecoin",
  tron: "trx-tron",
  stellar: "xlm-stellar",
};

async function fetchJson<T>(url: string, timeout = 10000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function buildSimplePriceUrl(
  ids: string[],
  currencies: string[],
  include24hChange = true,
) {
  const params = new URLSearchParams({
    ids: ids.join(","),
    include_24hr_change: String(include24hChange),
    vs_currencies: currencies.join(","),
  });

  return `/simple/price?${params.toString()}`;
}

// Cache for USD price (Frankfurter exchange rates) - expires after 2 hours
let usdRatesCache: { rates: Record<string, number>; ts: number } | null = null;
const USD_RATES_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// CoinGecko API (USD only, including images)
async function fetchCoinGeckoUsd(ids: string[]): Promise<Record<string, { usd: number; usd24hChange: number; image?: string }>> {
  if (!ids.length) return {};

  try {
    const params = new URLSearchParams({
      vs_currency: "usd",
      ids: ids.join(","),
      order: "market_cap_desc",
      sparkline: "false",
      locale: "en",
    });

    const payload = await fetchJson<any>(
      `${COINGECKO_BASE_URL}/coins/markets?${params.toString()}`,
    );

    const result: Record<string, { usd: number; usd24hChange: number; image?: string }> = {};

    if (Array.isArray(payload)) {
      for (const entry of payload) {
        result[entry.id] = {
          usd: entry.current_price,
          usd24hChange: entry.price_change_percentage_24h ?? 0,
          image: entry.image,
        };
      }
    }

    return result;
  } catch (error) {
    console.warn("CoinGecko fetch failed:", error);
    throw error;
  }
}

// Binance API (Fallback)
async function fetchBinanceUsd(geckoIds: string[]): Promise<Record<string, { usd: number; usd24hChange: number }>> {
  if (!geckoIds.length) return {};

  try {
    const symbols = geckoIds
      .map((id) => BINANCE_SYMBOLS[id])
      .filter(Boolean);

    if (symbols.length === 0) return {};

    const tickers = await fetchJson<BinanceTicker[]>(
      `${BINANCE_BASE_URL}/ticker/24hr?symbols=${JSON.stringify(symbols)}`,
    );

    const result: Record<string, { usd: number; usd24hChange: number }> = {};

    for (const ticker of tickers) {
      const geckoId = Object.entries(BINANCE_SYMBOLS).find(
        ([, binanceSymbol]) => binanceSymbol === ticker.symbol,
      )?.[0];

      if (geckoId) {
        result[geckoId] = {
          usd: parseFloat(ticker.lastPrice),
          usd24hChange: parseFloat(ticker.priceChangePercent),
        };
      }
    }

    return result;
  } catch (error) {
    console.warn("Binance fetch failed:", error);
    throw error;
  }
}

// CoinPaprika API (Fallback)
async function fetchCoinPaprikaUsd(geckoIds: string[]): Promise<Record<string, { usd: number; usd24hChange: number }>> {
  if (!geckoIds.length) return {};

  try {
    const paprikaIds = geckoIds
      .map((id) => COINPAPRIKA_IDS[id])
      .filter(Boolean);

    if (paprikaIds.length === 0) return {};

    const tickers = await fetchJson<CoinPaprikaTicker[]>(
      `${COINPAPRIKA_BASE_URL}/tickers?ids=${paprikaIds.join(",")}`,
    );

    const result: Record<string, { usd: number; usd24hChange: number }> = {};

    for (const ticker of tickers) {
      const geckoId = Object.entries(COINPAPRIKA_IDS).find(
        ([, paprikaId]) => paprikaId === ticker.id,
      )?.[0];

      if (geckoId) {
        result[geckoId] = {
          usd: ticker.quotes.USD.price,
          usd24hChange: ticker.quotes.USD.percent_change_24h,
        };
      }
    }

    return result;
  } catch (error) {
    console.warn("CoinPaprika fetch failed:", error);
    throw error;
  }
}

// Main fetch function with fallbacks
export async function fetchQuotes(ids: string[], currencies: string[] = ["usd"]): Promise<Record<string, Quote>> {
  if (!ids.length) return {} as Record<string, Quote>;

  // Try each API until we get a NON-EMPTY result
  const apis = [
    fetchCoinGeckoUsd,
    fetchBinanceUsd,
    fetchCoinPaprikaUsd,
  ];

  let baseUsdQuotes: Record<string, { usd: number; usd24hChange: number; image?: string }> | null = null;
  let lastError: Error | null = null;

  for (const fetchFn of apis) {
    try {
      const result = await fetchFn(ids);
      if (Object.keys(result).length > 0) {
        baseUsdQuotes = result;
        break;
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  if (!baseUsdQuotes) {
    throw lastError || new Error("All APIs failed to fetch quotes");
  }

  // Fetch exchange rates ONCE from Frankfurter
  let rates: Record<string, number>;
  try {
    const exchangeResponse = await fetchExchangeRates("USD", ["INR", "EUR", "GBP"]);
    rates = exchangeResponse.rates;
  } catch (rateError) {
    console.warn("Failed to fetch exchange rates, using fallback:", rateError);
    rates = { INR: 83, EUR: 0.92, GBP: 0.79 };
  }

  // Build consistent Quote objects using the SAME USD base + SAME exchange rates
  const finalQuotes: Record<string, Quote> = {};

  for (const id of ids) {
    const base = baseUsdQuotes![id];
    if (!base) continue; // skip if this ID wasn't found

    const usd = base.usd;
    const usd24hChange = base.usd24hChange;

    // Compute all other currencies using Frankfurter rates (consistent!)
    const inrRate = rates.INR ?? 83;
    const eurRate = rates.EUR ?? 0.92;
    const gbpRate = rates.GBP ?? 0.79;

    finalQuotes[id] = {
      usd,
      usd24hChange,
      inr: usd * inrRate,
      inr24hChange: usd24hChange,
      eur: usd * eurRate,
      eur24hChange: usd24hChange,
      gbp: usd * gbpRate,
      gbp24hChange: usd24hChange,
      image: base.image,
    };
  }

  return finalQuotes;
}

export async function fetchCoinQuote(geckoId: string) {
  try {
    // Use the multi-API fallback system, requesting all currencies
    const quotes = await fetchQuotes([geckoId], ["usd", "inr", "eur", "gbp"]);
    const quote = quotes[geckoId];

    if (!quote) {
      throw new Error("Quote not found from any source");
    }

    return quote;
  } catch (error) {
    console.error("All quote sources failed:", error);
    throw error;
  }
}

export async function fetchExchangeRates(base: string = "USD", symbols: string[] = ["INR", "EUR", "GBP"]) {
  // Return cached rates if still valid
  if (usdRatesCache && Date.now() - usdRatesCache.ts < USD_RATES_TTL && base === "USD") {
    return { rates: usdRatesCache.rates };
  }

  try {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/latest?base=${base}&symbols=${symbols.join(",")}`);
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Cache the rates for USD base
    if (base === "USD") {
      usdRatesCache = {
        rates: data.rates,
        ts: Date.now(),
      };
    }
    
    return data;
  } catch (error) {
    console.warn("Failed to fetch exchange rates from Frankfurter:", error);
    const fallbackRates: Record<string, number> = {
      INR: 83.0,
      EUR: 0.92,
      GBP: 0.79,
    };
    return { rates: fallbackRates };
  }
}

export async function fetchHistoricalExchangeRate(base: string, target: string, date: string) {
  try {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/${date}?base=${base}&symbols=${target}`);
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.rates[target];
  } catch (error) {
    console.warn("Failed to fetch historical exchange rate:", error);
    return null;
  }
}

export type CoinImage = {
  thumb: string;
  small: string;
  large: string;
};

export type CoinInfo = {
  image: CoinImage;
  description: string;
  genesisDate?: string;
  links?: {
    homepage: string[];
  };
};

export async function fetchCoinInfo(geckoId: string): Promise<CoinInfo | null> {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${geckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    const data = await response.json() as any;
    return {
      image: data.image,
      description: data.description?.en || "",
      genesisDate: data.genesis_date,
      links: data.links,
    };
  } catch (error) {
    console.warn(`Failed to fetch coin info for ${geckoId}:`, error);
    return null;
  }
}

export async function fetchChartData(
  coinId: string,
  days: number,
  currency: string = "usd",
): Promise<[number, number][]> {
  // Try CoinGecko first
  try {
    const response = await fetchJson<{ prices: [number, number][] }>(
      `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
    );
    return response.prices;
  } catch (error) {
    console.warn("CoinGecko chart fetch failed, trying Binance fallback:", error);

    // Fallback: If requesting USD, try Binance klines (which are in USDT)
    if (currency === "usd" || currency === "USDT") {
      try {
        const binanceSymbol = BINANCE_SYMBOLS[coinId];
        if (binanceSymbol) {
          const interval = days <= 1 ? "1h" : days <= 7 ? "4h" : "1d";
          const klines = await fetchJson<[number, string, string, string, string][]>(
            `${BINANCE_BASE_URL}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${Math.min(days * 24, 1000)}`,
          );
          return klines.map((k) => [k[0], parseFloat(k[4])]);
        }
      } catch (binanceError) {
        console.warn("Binance chart fetch failed:", binanceError);
      }
    }

    // If we can't get data from the requested currency, throw error
    throw error;
  }
}
