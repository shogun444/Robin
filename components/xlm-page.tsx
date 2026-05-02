"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { PriceCalculator } from "@/components/price-calculator";
import { PriceChart } from "@/components/price-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchCoinQuote, fetchChartData } from "@/lib/coingecko";
import type { Quote } from "@/lib/coingecko";
import { LoadingState, ErrorState } from "@/components/states";

type ChartDataPoint = {
  time: number;
  value: number;
};

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

export function XlmPage() {
  const [quoteData, setQuoteData] = useState<Quote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [range, setRange] = useState<TimeRange>("1M");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch quote (all currencies)
        const quote = await fetchCoinQuote("stellar");
        setQuoteData(quote);

        // Fetch chart data with current range
        const rangeMap: Record<TimeRange, number> = {
          "1D": 1,
          "1W": 7,
          "1M": 30,
          "1Y": 365,
          "5Y": 1825,
        };
        const raw = await fetchChartData("stellar", rangeMap[range], "usd");
        const formatted: ChartDataPoint[] = raw.map(([ts, price]) => ({
          time: Math.floor(ts / 1000),
          value: price,
        }));
        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch XLM data:", err);
        setError(err instanceof Error ? err : new Error("Failed to load data"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [range]);

  const prices = quoteData;

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  return (
    <Layout
      headerCenter={
        <div className="hidden text-sm text-muted md:block">
          XLM price calculator
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
            href="/"
          >
            Markets
          </Link>
          <ThemeToggle />
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            Calculator
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Stellar Lumens
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Enter an amount in USD or INR and get a live XLM estimate using CoinGecko pricing and a live USD-to-INR conversion rate.
          </p>
        </div>

        <PriceChart
          coinId="stellar"
          coinName="Stellar Lumens"
          currency="USD"
          data={chartData}
          isLoading={isLoading}
          error={error}
          onRangeChange={handleRangeChange}
        />

        <PriceCalculator
          coinName="Stellar Lumens"
          geckoId="stellar"
          title="Stellar Lumens"
          prices={prices}
          isLoading={isLoading}
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    </Layout>
  );
}
