"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import useSWR from "swr";
import { Layout } from "@/components/layout";
import { MarketTable } from "@/components/market-table";
import { PriceCard } from "@/components/price-card";
import { Tabs } from "@/components/tabs";
import { ApiStatus } from "@/components/api-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatCompactUsd, formatPercent, formatUsd } from "@/lib/format";
import {
  getMarketsForTab,
  marketTabs,
  type MarketSeed,
  type MarketTabId,
} from "@/lib/markets";

async function fetchMarketQuotes() {
  const res = await fetch("/api/prices");
  return res.json();
}

function filterMarkets(markets: MarketSeed[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return markets;
  }

  return markets.filter((market) => {
    return [market.name, market.symbol, market.pair]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

export function MarketDashboard() {
  const [activeTab, setActiveTab] = useState<MarketTabId>("futures");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const {
    data: quotes = {},
    error,
    isLoading,
  } = useSWR("market-quotes", fetchMarketQuotes, {
    shouldRetryOnError: false,
    errorRetryCount: 1,
    dedupingInterval: 30000,
  });

  const activeMarkets = getMarketsForTab(activeTab);
  const visibleMarkets = filterMarkets(activeMarkets, deferredSearch);
  const selectedMarket = visibleMarkets[0] ?? activeMarkets[0] ?? null;
  const selectedQuote = selectedMarket ? quotes[selectedMarket.geckoId] : undefined;

  return (
    <Layout
      headerCenter={
        <div className="hidden w-full max-w-xl md:block">
          <label className="block">
            <span className="sr-only">Search markets</span>
            <input
              aria-label="Search markets"
              className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground/40"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search BTC, ETH, XLM..."
              value={search}
            />
          </label>
        </div>
      }
      headerRight={
        <div className="flex items-center gap-4">
          <ApiStatus />
          <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
            href="/xlm"
          >
            XLM calculator
          </Link>
          <ThemeToggle />
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <section className="space-y-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
                  Live market view
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
                  Crypto markets
                </h1>
              </div>
              <div className="text-right text-sm text-muted">
                <div>{activeTab === "futures" ? "Futures" : "Spot"}</div>
                <div suppressHydrationWarning>{visibleMarkets.length} markets</div>
              </div>
            </div>

            <div className="md:hidden">
              <label className="block">
                <span className="sr-only">Search markets</span>
                <input
                  aria-label="Search markets"
                  className="h-11 w-full rounded-full border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-foreground/40"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search BTC, ETH, XLM..."
                  value={search}
                />
              </label>
            </div>

            <Tabs
              activeId={activeTab}
              onChange={(tabId) => setActiveTab(tabId as MarketTabId)}
              tabs={marketTabs}
            />
          </div>

          <MarketTable
            error={error ? "Unable to load market prices. Using alternative data sources..." : null}
            items={visibleMarkets}
            loading={isLoading}
            quotes={quotes}
          />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {selectedMarket ? (
            <PriceCard
              action={
                <Link
                  className="inline-flex h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
                  href={`/${selectedMarket.slug}`}
                >
                  Open detail
                </Link>
              }
              description={`Live snapshot for ${selectedMarket.name}. The price updates from CoinGecko while the list data stays anchored to the seed dataset.`}
              details={[
                { label: "Volume", value: formatCompactUsd(selectedMarket.volume) },
                {
                  label: "24h change",
                  tone: selectedMarket.change24h >= 0 ? "positive" : "negative",
                  value: formatPercent(selectedMarket.change24h),
                },
                { label: "Pair", value: selectedMarket.pair },
                { label: "CoinGecko", value: selectedMarket.geckoId },
              ]}
              price={selectedQuote ? formatUsd(selectedQuote.usd) : "Loading..."}
              priceLabel="Selected market"
              title={selectedMarket.name}
            >
              <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                Search and tab state stay local to the client. The first visible market in the active list is shown here as a compact live preview.
              </div>
            </PriceCard>
          ) : null}
        </aside>
      </div>
    </Layout>
  );
}

