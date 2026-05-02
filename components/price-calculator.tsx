"use client";

import { useState } from "react";
import useSWR from "swr";
import { PriceCard } from "@/components/price-card";
import { fetchCoinQuote, fetchUsdToInrRate } from "@/lib/coingecko";
import { formatInr, formatPercent, formatUsd } from "@/lib/format";

type CalculatorCurrency = "usd" | "inr";

type CoinSnapshot = {
  change24h?: number;
  inrPrice: number;
  usdPrice: number;
  usdToInrRate: number;
};

type PriceCalculatorProps = {
  coinName: string;
  geckoId: string;
  title?: string;
};

async function fetchCoinSnapshot(geckoId: string): Promise<CoinSnapshot> {
  const [quote, rate] = await Promise.all([
    fetchCoinQuote(geckoId),
    fetchUsdToInrRate(),
  ]);

  return {
    change24h: quote.usd24hChange,
    inrPrice: quote.inr ?? (quote.usd ?? 0) * rate,
    usdPrice: quote.usd ?? 0,
    usdToInrRate: rate,
  };
}

export function PriceCalculator({ coinName, geckoId, title }: PriceCalculatorProps) {
  const [currency, setCurrency] = useState<CalculatorCurrency>("usd");
  const [amount, setAmount] = useState("100");

  const { data, error, isLoading } = useSWR(
    `coin-snapshot-${geckoId}`,
    () => fetchCoinSnapshot(geckoId)
  );

  const numericAmount = Number.parseFloat(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  const coinValue =
    data && data.usdPrice > 0
      ? currency === "usd"
        ? safeAmount / data.usdPrice
        : safeAmount / data.inrPrice
      : 0;

  const currentPrice = data
    ? currency === "usd"
      ? formatUsd(data.usdPrice)
      : formatInr(data.inrPrice)
    : "—";

  return (
    <PriceCard
      description={`Convert USD or INR into ${coinName} using a live CoinGecko quote and exchange rate.`}
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
              {
                label: "USD to INR",
                value: formatInr(data.usdToInrRate),
              },
            ]
          : []
      }
      price={isLoading ? "Loading live quote..." : error ? "Unable to load quote" : currentPrice}
      priceLabel={`${coinName} calculator`}
      title={title || coinName}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            Amount ({currency.toUpperCase()})
          </span>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted focus:border-foreground/40"
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            value={amount}
          />
        </label>

        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {(["usd", "inr"] as CalculatorCurrency[]).map((option) => {
            const isActive = currency === option;

            return (
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent text-background"
                    : "text-muted hover:bg-surface-strong hover:text-foreground"
                }`}
                key={option}
                onClick={() => setCurrency(option)}
                type="button"
              >
                {option.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface-strong px-4 py-4">
        <div className="text-[0.7rem] uppercase tracking-[0.22em] text-muted">
          Equivalent {coinName.toUpperCase()}
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {coinValue > 0 ? coinValue.toFixed(4) : "0.0000"}
        </div>
        <div className="mt-2 text-sm text-muted">
          {currency.toUpperCase()} {safeAmount.toFixed(2)} buys approximately {coinValue > 0 ? coinValue.toFixed(4) : "0.0000"} {coinName.toUpperCase()} at {currentPrice}.
        </div>
      </div>
    </PriceCard>
  );
}
