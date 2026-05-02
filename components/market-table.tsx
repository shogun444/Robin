import type { Quote } from "@/lib/coingecko";
import type { MarketSeed } from "@/lib/markets";
import { MarketRow } from "@/components/market-row";

type MarketTableProps = {
  error?: string | null;
  items: MarketSeed[];
  loading?: boolean;
  quotes: Record<string, Quote>;
};

export function MarketTable({ error, items, loading, quotes }: MarketTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-(--shadow)">
      <div className="border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 text-[0.7rem] uppercase tracking-[0.24em] text-muted sm:col-span-1">
            Market
          </div>
          <div className="hidden text-right text-[0.7rem] uppercase tracking-[0.24em] text-muted sm:block">
            Price
          </div>
          <div className="hidden text-right text-[0.7rem] uppercase tracking-[0.24em] text-muted sm:block">
            Volume
          </div>
          <div className="hidden text-right text-[0.7rem] uppercase tracking-[0.24em] text-muted sm:block">
            Change
          </div>
        </div>
      </div>

      {error ? (
        <div className="px-4 py-10 text-sm text-negative sm:px-5">{error}</div>
      ) : loading ? (
        <MarketTableSkeleton />
      ) : items.length ? (
        <div>
          {items.map((market) => (
            <MarketRow
              key={`${market.tab}-${market.slug}`}
              market={market}
              quote={quotes[market.geckoId]}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-10 text-sm text-muted sm:px-5">
          No markets match this search.
        </div>
      )}
    </section>
  );
}

function MarketTableSkeleton() {
  return (
    <div className="divide-y divide-border/70">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] sm:px-5"
          key={index}
        >
          <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-strong" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-full bg-surface-strong" />
              <div className="h-2 w-20 animate-pulse rounded-full bg-surface-strong" />
            </div>
          </div>
          <div className="h-8 animate-pulse rounded-full bg-surface-strong" />
          <div className="h-8 animate-pulse rounded-full bg-surface-strong" />
          <div className="h-8 animate-pulse rounded-full bg-surface-strong" />
        </div>
      ))}
    </div>
  );
}


