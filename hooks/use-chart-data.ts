import useSWR from "swr";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

type ChartDataPoint = {
  time: number;
  value: number;
};

type ChartDataResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

async function fetchChartData(coinId: string, range: TimeRange): Promise<ChartDataPoint[]> {
  const rangeMap: Record<TimeRange, string> = {
    "1D": "1",
    "1W": "7",
    "1M": "30",
    "1Y": "365",
    "5Y": "max",
  };

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${rangeMap[range]}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chart data");
  }

  const data: ChartDataResponse = await response.json();

  return data.prices.map(([timestamp, price]) => ({
    time: Math.floor(timestamp / 1000),
    value: price,
  }));
}

export function useChartData(coinId: string, range: TimeRange) {
  return useSWR(
    `chart-${coinId}-${range}`,
    () => fetchChartData(coinId, range),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}
