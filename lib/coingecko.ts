const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const BINANCE_BASE_URL = "https://api.binance.com/api/v3";
const COINPAPRIKA_BASE_URL = "https://api.coinpaprika.com/v1";
const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v2";

export type Quote = {
  inr?: number;
  inr24hChange?: number;
  usd?: number;
  usd24hChange?: number;
  eur?: number;
  eur24hChange?: number;
  gbp?: number;
  gbp24hChange?: number;
};

type SimplePriceResponse = Record<string, Record<string, number>>;

type ExchangeRatesResponse = {
  rates: Record<
    string,
    {
      name: string;
      type: string;
      unit: string;
      value: number;
    }
  >;
};

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
      },
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

// CoinGecko API (Primary)
async function fetchCoinGeckoQuotes(ids: string[], currencies: string[] = ["usd"]): Promise<Record<string, Quote>> {
  if (!ids.length) return {};

  try {
    const payload = await fetchJson<SimplePriceResponse>(
      `${COINGECKO_BASE_URL}${buildSimplePriceUrl(ids, currencies)}`,
    );

    return Object.fromEntries(
      Object.entries(payload).map(([id, entry]) => [
        id,
        {
          usd: entry.usd,
          usd24hChange: entry.usd_24h_change,
          inr: entry.inr,
          inr24hChange: entry.inr_24h_change,
          eur: entry.eur,
          eur24hChange: entry.eur_24h_change,
          gbp: entry.gbp,
          gbp24hChange: entry.gbp_24h_change,
        } satisfies Partial<Quote> as Quote,
      ]),
    ) as Record<string, Quote>;
  } catch (error) {
    console.warn("CoinGecko fetch failed:", error);
    throw error;
  }
}

// Binance API (Fallback)
async function fetchBinanceQuotes(geckoIds: string[], _currencies: string[] = ["usd"]): Promise<Record<string, Quote>> {
  if (!geckoIds.length) return {};

  try {
    const symbols = geckoIds
      .map((id) => BINANCE_SYMBOLS[id])
      .filter(Boolean);

    if (symbols.length === 0) return {};

    const tickers = await fetchJson<BinanceTicker[]>(
      `${BINANCE_BASE_URL}/ticker/24hr?symbols=${JSON.stringify(symbols)}`,
    );

    const result: Record<string, Quote> = {};

    for (const ticker of tickers) {
      const geckoId = Object.entries(BINANCE_SYMBOLS).find(
        ([_, symbol]) => symbol === ticker.symbol,
      )?.[0];

      if (geckoId) {
        result[geckoId] = {
          usd: parseFloat(ticker.lastPrice),
          usd24hChange: parseFloat(ticker.priceChangePercent),
          // Other currencies will be converted via exchange rates if requested
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
async function fetchCoinPaprikaQuotes(geckoIds: string[], _currencies: string[] = ["usd"]): Promise<Record<string, Quote>> {
  if (!geckoIds.length) return {};

  try {
    const paprikaIds = geckoIds
      .map((id) => COINPAPRIKA_IDS[id])
      .filter(Boolean);

    if (paprikaIds.length === 0) return {};

    const tickers = await fetchJson<CoinPaprikaTicker[]>(
      `${COINPAPRIKA_BASE_URL}/tickers?ids=${paprikaIds.join(",")}`,
    );

    const result: Record<string, Quote> = {};

    for (const ticker of tickers) {
      const geckoId = Object.entries(COINPAPRIKA_IDS).find(
        ([_, paprikaId]) => paprikaId === ticker.id,
      )?.[0];

      if (geckoId) {
        result[geckoId] = {
          usd: ticker.quotes.USD.price,
          usd24hChange: ticker.quotes.USD.percent_change_24h,
          // Other currencies are converted by fetchQuotes if needed
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

  const apis = [
    (ids: string[]) => fetchCoinGeckoQuotes(ids, currencies),
    fetchBinanceQuotes,
    fetchCoinPaprikaQuotes,
  ];

  let lastError: Error | null = null;

  for (const fetchFn of apis) {
    try {
      const result = await fetchFn(ids);
      if (Object.keys(result).length > 0) {
        // If we got data from an API that doesn't provide all requested currencies,
        // fill missing ones with USD conversion using exchange rates
        if (currencies.length > 1 && currencies.includes("usd")) {
          const hasAllCurrencies = Object.values(result).every(quote =>
            currencies.every(c => quote[c as keyof Quote] !== undefined)
          );

          if (!hasAllCurrencies && result[ids[0]]?.usd !== undefined) {
            const targetCurrencies = currencies.filter(c => c !== "usd").map(c => c.toUpperCase() as "INR" | "EUR" | "GBP");
            const { rates } = await fetchExchangeRates("USD", targetCurrencies);
            for (const id in result) {
              const quote = result[id];
              const baseUsd = quote.usd;
              const baseChange = quote.usd24hChange;

              if (baseUsd !== undefined) {
                if (currencies.includes("inr") && quote.inr === undefined) {
                  quote.inr = baseUsd * (rates.INR ?? 83);
                  quote.inr24hChange = baseChange;
                }
                if (currencies.includes("eur") && quote.eur === undefined) {
                  quote.eur = baseUsd * (rates.EUR ?? 0.92);
                  quote.eur24hChange = baseChange;
                }
                if (currencies.includes("gbp") && quote.gbp === undefined) {
                  quote.gbp = baseUsd * (rates.GBP ?? 0.79);
                  quote.gbp24hChange = baseChange;
                }
              }
            }
           }
         }

         return result as Record<string, Quote>;
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  throw lastError || new Error("All APIs failed to fetch quotes");
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

export async function fetchUsdToInrRate() {
  try {
    const payload = await fetchJson<ExchangeRatesResponse>(
      `${COINGECKO_BASE_URL}/exchange_rates`,
    );
    const usdRate = payload.rates.usd?.value ?? 1;
    const inrRate = payload.rates.inr?.value;

    if (!inrRate || !usdRate) {
      return 83;
    }

    return inrRate / usdRate;
  } catch (error) {
    console.warn("Failed to fetch exchange rate, using fallback:", error);
    return 83;
  }
}

export async function fetchExchangeRates(base: string = "USD", symbols: string[] = ["INR", "EUR", "GBP"]) {
  try {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/latest?base=${base}&symbols=${symbols.join(",")}`);
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.statusText}`);
    }
    return await response.json() as { rates: Record<string, number> };
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
