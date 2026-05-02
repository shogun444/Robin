import type { ReactNode } from "react";

type PriceCardProps = {
  action?: ReactNode;
  children?: ReactNode;
  description?: string;
  details?: Array<{
    label: string;
    tone?: "neutral" | "positive" | "negative";
    value: string;
  }>;
  price: ReactNode;
  priceLabel: string;
  title: string;
};

export function PriceCard({
  action,
  children,
  description,
  details = [],
  price,
  priceLabel,
  title,
}: PriceCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-(--shadow)">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            {priceLabel}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-6 border-t border-border/70 pt-5">
        <div className="text-[0.72rem] uppercase tracking-[0.24em] text-muted">
          Current price
        </div>
        <div className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          {price}
        </div>
      </div>

      {details.length ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.map((detail, idx) => (
            <div
              className="rounded-2xl border border-border bg-surface-strong px-4 py-3"
              key={`${detail.label}-${idx}`}
            >
              <dt className="text-[0.7rem] uppercase tracking-[0.22em] text-muted">
                {detail.label}
              </dt>
              <dd
                className={`mt-1 text-sm font-medium ${
                  detail.tone === "positive"
                    ? "text-positive"
                    : detail.tone === "negative"
                      ? "text-negative"
                      : "text-foreground"
                }`}
              >
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

