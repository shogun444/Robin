const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 6,
  minimumFractionDigits: 2,
  style: "currency",
});

const inrFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 4,
  minimumFractionDigits: 2,
  style: "currency",
});

const eurFormatter = new Intl.NumberFormat("en-GB", {
  currency: "EUR",
  maximumFractionDigits: 6,
  minimumFractionDigits: 2,
  style: "currency",
});

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  currency: "GBP",
  maximumFractionDigits: 6,
  minimumFractionDigits: 2,
  style: "currency",
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});

export function formatUsd(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return usdFormatter.format(value);
}

export function formatInr(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return inrFormatter.format(value);
}

export function formatCompactUsd(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `$${compactUsdFormatter.format(value)}`;
}

export function formatEur(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return eurFormatter.format(value);
}

export function formatGbp(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return gbpFormatter.format(value);
}

export function formatCurrency(value: number | null | undefined, currency: "USD" | "INR" | "EUR" | "GBP") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  switch (currency) {
    case "USD":
      return usdFormatter.format(value);
    case "INR":
      return inrFormatter.format(value);
    case "EUR":
      return eurFormatter.format(value);
    case "GBP":
      return gbpFormatter.format(value);
  }
}

export function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatNumber(value: number | null | undefined, fractionDigits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}
