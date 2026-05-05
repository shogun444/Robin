import Link from "next/link";
import Image from "next/image";
import type { Quote } from "@/lib/coingecko";
import { formatCompactUsd, formatPercent, formatUsd } from "@/lib/format";
import type { MarketSeed } from "@/lib/markets";

type MarketRowProps = {
  market: MarketSeed;
  quote?: Quote;
};

export function MarketRow({ market, quote }: MarketRowProps) {
  return (
    <Link
      className="group block border-b border-border/70 transition last:border-b-0 hover:bg-surface-strong/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      href={`/${market.slug}`}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] sm:items-center sm:px-5">
        <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
          {quote?.image || market.image ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface-strong">
              <Image
                src={(quote?.image || market.image) as string}
                alt={market.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-strong text-sm font-semibold text-foreground">
              {market.name.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {market.name}
            </div>
            <div className="truncate text-xs uppercase tracking-[0.18em] text-muted">
              {market.symbol}
            </div>
          </div>
        </div>

        <StatCell label="Price" value={formatUsd(quote?.usd)} emphasis />
        <StatCell label="Volume" value={formatCompactUsd(market.volume)} />
        <StatCell
          label="Change"
          tone={market.change24h >= 0 ? "positive" : "negative"}
          value={formatPercent(market.change24h)}
        />
      </div>
    </Link>
  );
}

function StatCell({
  emphasis,
  label,
  tone = "neutral",
  value,
}: {
  emphasis?: boolean;
  label: string;
  tone?: "neutral" | "positive" | "negative";
  value: string;
}) {
  return (
    <div className="flex flex-col items-start justify-center gap-0.5 sm:items-end">
      <span className="text-[0.7rem] uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          emphasis
            ? "font-semibold text-foreground"
            : tone === "positive"
              ? "text-positive"
              : tone === "negative"
                ? "text-negative"
                : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
