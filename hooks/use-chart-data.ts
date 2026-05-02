import useSWR from "swr";
import { fetchChartData } from "@/lib/coingecko";

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

type ChartDataPoint = {
  time: number;
  value: number;
};

async function fetchChartDataWithRange(coinId: string, range: TimeRange): Promise<ChartDataPoint[]> {
  const rangeMap: Record<TimeRange, number> = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "1Y": 365,
    "5Y": 1825,
  };

  try {
    const prices = await fetchChartData(coinId, rangeMap[range]);

    return prices.map(([timestamp, price]) => ({
      time: Math.floor(timestamp / 1000),
      value: price,
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw error;
  }
}

export function useChartData(coinId: string, range: TimeRange) {
  return useSWR(
    `chart-${coinId}-${range}`,
    () => fetchChartDataWithRange(coinId, range),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 1,
      keepPreviousData: true,
    }
  );
}

export type { TimeRange, ChartDataPoint };
