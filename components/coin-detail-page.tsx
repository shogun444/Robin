"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout";
import { PriceCard } from "@/components/price-card";
import { PriceCalculator } from "@/components/price-calculator";
import { PriceChart } from "@/components/price-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector, type Currency } from "@/components/currency-selector";
import type { MarketSeed } from "@/lib/markets";
import { fetchChartData, fetchCoinQuote, fetchCoinInfo, type CoinInfo } from "@/lib/coingecko";
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
  image?: string;
  binanceData?: {
    high: string;
    low: string;
    volume: string;
  };
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

  // Binance state
  const [binanceInfo, setBinanceInfo] = useState<{ high: string; low: string; volume: string } | null>(null);

  // Chart state - refetched when currency or range changes
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<Error | null>(null);

  // Info state
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);

  // Fetch quote data (all currencies) - runs once on mount
  useEffect(() => {
    async function fetchData() {
      setQuoteLoading(true);
      setQuoteError(null);

      // Fetch quote first (higher priority, has images)
      try {
        const quote = await fetchCoinQuote(market.geckoId);
        setQuoteData(quote);
      } catch (err) {
        console.error("Failed to fetch quote:", err);
        setQuoteError(err instanceof Error ? err : new Error("Failed to fetch price"));
      } finally {
        setQuoteLoading(false);
      }

      // Fetch extra info separately (lower priority, easily rate limited)
      try {
        const info = await fetchCoinInfo(market.geckoId);
        if (info) setCoinInfo(info);
      } catch (err) {
        console.warn("Failed to fetch extra coin info:", err);
      }

      // Fetch Binance data
      try {
        const binanceSymbol = market.symbol.replace("-PERP", "USDT").replace("/", "");
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
        if (response.ok) {
          const data = await response.json();
          setBinanceInfo({
            high: data.highPrice,
            low: data.lowPrice,
            volume: data.volume,
          });
        }
      } catch (err) {
        console.warn("Failed to fetch Binance ticker:", err);
      }
    }

    fetchData();
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
    image: quoteData.image,
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
          <div className="flex items-center gap-4">
            {(coinInfo?.image?.large || quoteData?.image || market.image) ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-surface-strong shadow-lg">
                <Image
                  src={(coinInfo?.image?.large || quoteData?.image || market.image) as string}
                  alt={market.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-2xl font-bold text-foreground">
                {market.name.charAt(0)}
              </span>
            )}
            <div>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                {market.name}
              </h1>
            </div>
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

        <div className="grid gap-6">
          <PriceCard
            description={`Live market data and information for ${market.name}.`}
            details={quoteData ? [
              { label: "Symbol", value: market.symbol },
              {
                label: "24h change",
                tone: (change24h ?? 0) >= 0 ? "positive" : "negative",
                value: formatPercent(change24h),
              },
              ...(coinInfo?.genesisDate ? [{ label: "Founded", value: coinInfo.genesisDate }] : []),
              ...(binanceInfo ? [
                { label: "Binance 24h High", value: formatCurrency(Number(binanceInfo.high), "USD") },
                { label: "Binance 24h Low", value: formatCurrency(Number(binanceInfo.low), "USD") },
              ] : []),
              ...(coinInfo?.links?.homepage?.[0] && coinInfo.links.homepage[0].startsWith('http') ? [{ label: "Website", value: new URL(coinInfo.links.homepage[0]).hostname }] : []),
            ] : []}
            price={
              quoteLoading
                ? <LoadingState message="" />
                : quoteError
                ? <ErrorState message="Unable to load price" onRetry={() => window.location.reload()} />
                : formatCurrency(currentPrice, currency)
            }
            priceLabel="Coin Detail"
            title={market.name}
            icon={
              (coinInfo?.image?.large || quoteData?.image || market.image) ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                  <Image
                    src={(coinInfo?.image?.large || quoteData?.image || market.image) as string}
                    alt={market.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-background text-2xl font-semibold text-foreground">
                  {market.name.charAt(0)}
                </span>
              )
            }
          >
            <div className="space-y-8">
              {/* Information Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                  Information
                </h3>
                {coinInfo?.description || market.description ? (
                  <div 
                    className="max-h-[400px] overflow-y-auto pr-2 text-sm leading-relaxed text-muted scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    dangerouslySetInnerHTML={{ __html: coinInfo?.description || (market.description as string) }}
                  />
                ) : (
                  <div className="text-sm text-muted italic">
                    {quoteLoading ? "Fetching coin details..." : "Detailed information currently unavailable for this coin."}
                  </div>
                )}
              </div>

              {/* Merged Calculator */}
              <div className="border-t border-border pt-8">
                <PriceCalculator
                  coinName={market.name}
                  geckoId={market.geckoId}
                  title={`${market.name} Calculator`}
                  prices={pricesForCalculator}
                  isLoading={quoteLoading}
                  error={quoteError}
                  onRetry={() => window.location.reload()}
                  minimal
                />
              </div>
            </div>
          </PriceCard>
        </div>
      </div>
    </Layout>
  );
}
