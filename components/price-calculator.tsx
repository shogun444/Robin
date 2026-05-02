"use client";

import { useState, useMemo } from "react";
import { PriceCard } from "@/components/price-card";
import { formatInr, formatUsd, formatEur, formatGbp, formatPercent, formatCurrency } from "@/lib/format";
import { LoadingState, ErrorState } from "@/components/states";
import type { Currency } from "@/components/currency-selector";

type CalculatorCurrency = "USD" | "INR" | "EUR" | "GBP";

type PriceCalculatorProps = {
  coinName: string;
  geckoId: string;
  title?: string;
  prices?: {
    usd: number;
    inr: number;
    eur: number;
    gbp: number;
    usd24hChange: number;
  } | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

export function PriceCalculator({
  coinName,
  geckoId,
  title,
  prices,
  isLoading,
  error,
  onRetry,
}: PriceCalculatorProps) {
  const [currency, setCurrency] = useState<CalculatorCurrency>("USD");
  const [amount, setAmount] = useState("100");

  const numericAmount = Number.parseFloat(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  const coinValue = useMemo(() => {
    if (!prices) return 0;
    const priceMap: Record<CalculatorCurrency, number> = {
      USD: prices.usd,
      INR: prices.inr,
      EUR: prices.eur,
      GBP: prices.gbp,
    };
    const currentPrice = priceMap[currency] || prices.usd;
    return currentPrice > 0 ? safeAmount / currentPrice : 0;
  }, [prices, currency, safeAmount]);

  const currentPriceDisplay = useMemo(() => {
    if (!prices) return "—";
    const priceMap: Record<CalculatorCurrency, number> = {
      USD: prices.usd,
      INR: prices.inr,
      EUR: prices.eur,
      GBP: prices.gbp,
    };
    return formatCurrency(priceMap[currency] || prices.usd, currency);
  }, [prices, currency]);

  const currencyOptions: CalculatorCurrency[] = ["USD", "INR", "EUR", "GBP"];

  return (
    <PriceCard
      description={`Convert ${currencyOptions.join(", ")} into ${coinName} using live prices.`}
      details={
        prices
          ? [
              { label: "USD price", value: formatUsd(prices.usd) },
              { label: "INR price", value: formatInr(prices.inr) },
              { label: "EUR price", value: formatEur(prices.eur) },
              { label: "GBP price", value: formatGbp(prices.gbp) },
              {
                label: "24h change",
                tone: (prices.usd24hChange ?? 0) >= 0 ? "positive" : "negative",
                value: formatPercent(prices.usd24hChange),
              },
            ]
          : []
      }
      price={
        isLoading
          ? <LoadingState message="" />
          : error
          ? <ErrorState message="Unable to load data" onRetry={onRetry} />
          : currentPriceDisplay
      }
      priceLabel={`${coinName} calculator`}
      title={title || coinName}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-muted">
            Amount ({currency})
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
          {currencyOptions.map((option) => {
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
                {option}
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
          {currency} {safeAmount.toFixed(2)} buys approximately {coinValue > 0 ? coinValue.toFixed(4) : "0.0000"} {coinName.toUpperCase()} at {currentPriceDisplay}.
        </div>
      </div>
    </PriceCard>
  );
}
