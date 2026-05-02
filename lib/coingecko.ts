const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export type Quote = {
  inr?: number;
  inr24hChange?: number;
  usd?: number;
  usd24hChange?: number;
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

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${COINGECKO_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`CoinGecko request failed: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as T;
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

export async function fetchQuotes(ids: string[], currencies: string[] = ["usd"]) {
  if (!ids.length) {
    return {} as Record<string, Quote>;
  }

  const payload = await fetchJson<SimplePriceResponse>(
    buildSimplePriceUrl(ids, currencies),
  );

  return Object.fromEntries(
    Object.entries(payload).map(([id, entry]) => [
      id,
      {
        inr: entry.inr,
        inr24hChange: entry.inr_24h_change,
        usd: entry.usd,
        usd24hChange: entry.usd_24h_change,
      } satisfies Quote,
    ]),
  ) as Record<string, Quote>;
}

export async function fetchCoinQuote(geckoId: string) {
  const quotes = await fetchQuotes([geckoId], ["usd", "inr"]);
  return quotes[geckoId] ?? {};
}

export async function fetchUsdToInrRate() {
  try {
    const payload = await fetchJson<ExchangeRatesResponse>("/exchange_rates");
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
