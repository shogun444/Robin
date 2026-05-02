"use client";

type Currency = "USD" | "INR" | "EUR" | "GBP";

type CurrencySelectorProps = {
  activeCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
};

const CURRENCIES: Currency[] = ["USD", "INR", "EUR", "GBP"];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export function CurrencySelector({
  activeCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-strong p-1">
      {CURRENCIES.map((currency) => (
        <button
          key={currency}
          onClick={() => onCurrencyChange(currency)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeCurrency === currency
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground hover:bg-surface"
          }`}
        >
          {currency}
        </button>
      ))}
    </div>
  );
}

export type { Currency };
export { CURRENCY_SYMBOLS };
