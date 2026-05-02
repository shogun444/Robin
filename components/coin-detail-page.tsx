"use client";

import Link from "next/link";
import useSWR from "swr";
import { Layout } from "@/components/layout";
import { PriceCard } from "@/components/price-card";
import { PriceCalculator } from "@/components/price-calculator";
import { PriceChart } from "@/components/price-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import type { MarketSeed } from "@/lib/markets";
import { formatInr, formatPercent, formatUsd } from "@/lib/format";

type CoinDetailPageProps = {
  market: MarketSeed;
};

async function fetchCoinDetails(geckoId: string) {
  const res = await fetch(`/api/coin/${geckoId}`);
  const { quote, rate } = await res.json();
  return {
    change24h: quote.usd24hChange,
    inrPrice: quote.inr ?? (quote.usd ?? 0) * rate,
    usdPrice: quote.usd ?? 0,
  };
}

export function CoinDetailPage({ market }: CoinDetailPageProps) {
  const { data, error, isLoading } = useSWR(
    ["coin-detail", market.geckoId],
    () => fetchCoinDetails(market.geckoId),
  );

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
        </div>

        <PriceChart coinId={market.geckoId} coinName={market.name} />

        <div className="grid gap-6 lg:grid-cols-2">
          <PriceCard
            description={`Live CoinGecko quote for ${market.name}. INR is derived from CoinGecko pricing and exchange rates.`}
            details={
              data
                ? [
                    { label: "USD price", value: formatUsd(data.usdPrice) },
                    { label: "INR price", value: formatInr(data.inrPrice) },
                    {
                      label: "24h change",
                      tone: (data.change24h ?? 0) >= 0 ? "positive" : "negative",
                      value: formatPercent(data.change24h),
                    },
                    { label: "Symbol", value: market.symbol },
                  ]
                : []
            }
            price={isLoading ? "Loading live quote..." : error ? "Unable to load price" : formatUsd(data?.usdPrice)}
            priceLabel={market.geckoId}
            title={market.name}
          >
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              {market.name} is tracked with a one-shot CoinGecko request. The page stays frontend-only and uses the seed dataset for the market identity.
            </div>
          </PriceCard>

          <PriceCalculator 
            coinName={market.name} 
            geckoId={market.geckoId}
            title={`${market.name} Calculator`}
          />
        </div>
      </div>
    </Layout>
  );
}

