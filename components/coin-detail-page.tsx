"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { PriceCard } from "@/components/price-card";
import { PriceCalculator } from "@/components/price-calculator";
import { PriceChart } from "@/components/price-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector, type Currency } from "@/components/currency-selector";
import type { MarketSeed } from "@/lib/markets";
import { fetchChartData, fetchCoinQuote } from "@/lib/coingecko";
import { formatPercent, formatCurrency } from "@/lib/format";
import { LoadingState, ErrorState } from "@/components/states";

type ChartDataPoint = {
  time: number;
  value: number;
};

type QuoteData = {
  usd: number;
  usd24hChange: number;
  inr: number;
  inr24hChange: number;
  eur: number;
  eur24hChange: number;
  gbp: number;
  gbp24hChange: number;
};

type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

type CoinDetailPageProps = {
  market: MarketSeed;
};

export function CoinDetailPage({ market }: CoinDetailPageProps) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [range, setRange] = useState<TimeRange>("1D");

  // Quote state - fetched once with all currencies
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<Error | null>(null);

  // Chart state - refetched when currency or range changes
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<Error | null>(null);

  // Fetch quote data (all currencies) - runs once on mount
  useEffect(() => {
    async function fetchQuote() {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const quote = await fetchCoinQuote(market.geckoId);
        setQuoteData(quote);
      } catch (err) {
        console.error("Failed to fetch quote:", err);
        setQuoteError(err instanceof Error ? err : new Error("Failed to fetch price"));
      } finally {
        setQuoteLoading(false);
      }
    }

    fetchQuote();
  }, [market.geckoId]);

  // Fetch chart data - runs when currency or range changes
  useEffect(() => {
    async function fetchChart() {
      setChartLoading(true);
      setChartError(null);

      try {
        const rangeMap: Record<TimeRange, number> = {
          "1D": 1,
          "1W": 7,
          "1M": 30,
          "1Y": 365,
          "5Y": 1825,
        };

        const rawData = await fetchChartData(
          market.geckoId,
          rangeMap[range],
          currency.toLowerCase() as "usd" | "inr" | "eur" | "gbp"
        );

        const formatted: ChartDataPoint[] = rawData.map(([timestamp, price]) => ({
          time: Math.floor(timestamp / 1000),
          value: price,
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch chart:", err);
        setChartError(err instanceof Error ? err : new Error("Failed to fetch chart"));
      } finally {
        setChartLoading(false);
      }
    }

    fetchChart();
  }, [market.geckoId, currency, range]);

  const currentPrice = useMemo(() => {
    if (!quoteData) return 0;
    switch (currency) {
      case "USD":
        return quoteData.usd;
      case "INR":
        return quoteData.inr;
      case "EUR":
        return quoteData.eur;
      case "GBP":
        return quoteData.gbp;
      default:
        return quoteData.usd;
    }
  }, [quoteData, currency]);

  const change24h = useMemo(() => {
    if (!quoteData) return 0;
    switch (currency) {
      case "USD":
        return quoteData.usd24hChange;
      case "INR":
        return quoteData.inr24hChange;
      case "EUR":
        return quoteData.eur24hChange;
      case "GBP":
        return quoteData.gbp24hChange;
      default:
        return quoteData.usd24hChange;
    }
  }, [quoteData, currency]);

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  // Build prices object for calculator
  const pricesForCalculator = quoteData ? {
    usd: quoteData.usd,
    inr: quoteData.inr,
    eur: quoteData.eur,
    gbp: quoteData.gbp,
    usd24hChange: quoteData.usd24hChange,
  } : null;

  // Combine loading/error states for overall UI (if needed)
  const isLoading = quoteLoading || chartLoading;
  const error = quoteError || chartError;

  return (
    <Layout
      headerCenter={
        <div className="hidden text-sm text-muted md:block">
          {market.name} live price detail
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
            href="/"
          >
            Back to markets
          </Link>
          <ThemeToggle />
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Coin detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              {market.name}
            </h1>
          </div>
          <CurrencySelector activeCurrency={currency} onCurrencyChange={setCurrency} />
        </div>

        <PriceChart
          coinId={market.geckoId}
          coinName={market.name}
          currency={currency}
          data={chartData}
          isLoading={chartLoading}
          error={chartError}
          onRangeChange={handleRangeChange}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <PriceCard
            description={`Live CoinGecko quote for ${market.name}. All prices are from a single API response.`}
            details={quoteData ? [
              { label: `${currency} price`, value: formatCurrency(currentPrice, currency) },
              { label: "Symbol", value: market.symbol },
              {
                label: "24h change",
                tone: (change24h ?? 0) >= 0 ? "positive" : "negative",
                value: formatPercent(change24h),
              },
            ] : []}
            price={
              quoteLoading
                ? <LoadingState message="" />
                : quoteError
                ? <ErrorState message="Unable to load price" onRetry={() => window.location.reload()} />
                : formatCurrency(currentPrice, currency)
            }
            priceLabel={market.geckoId}
            title={market.name}
          >
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              All prices fetched directly from CoinGecko API — one request, consistent data.
            </div>
          </PriceCard>

          <PriceCalculator
            coinName={market.name}
            geckoId={market.geckoId}
            title={`${market.name} Calculator`}
            prices={pricesForCalculator}
            isLoading={quoteLoading}
            error={quoteError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    </Layout>
  );
}
