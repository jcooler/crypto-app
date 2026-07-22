const USD = "en-US";

const compact = new Intl.NumberFormat(USD, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const wholeCurrency = new Intl.NumberFormat(USD, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const twoDp = new Intl.NumberFormat(USD, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1.23T / $890.4B / $12.34M; plain below 1M. */
export const formatCompactCurrency = (n: number): string =>
  Math.abs(n) >= 1e6 ? compact.format(n) : wholeCurrency.format(n);

/** Prices: ≥$1 → 2 decimals with grouping; <$1 → 4 significant digits. */
export const formatPrice = (n: number): string => {
  if (n === 0 || Math.abs(n) >= 1) return twoDp.format(n);
  return new Intl.NumberFormat(USD, {
    style: "currency",
    currency: "USD",
    minimumSignificantDigits: 4,
    maximumSignificantDigits: 4,
  }).format(n);
};

export type Direction = "up" | "down" | "flat";

export interface PercentChange {
  /** Absolute magnitude, e.g. "3.20%" — pair with a ▲/▼ glyph for sign. */
  text: string;
  direction: Direction;
}

/** Sign is conveyed by `direction` (rendered as ▲/▼/−), never by text alone. */
export const formatPercent = (n: number | null | undefined): PercentChange => {
  if (n == null || !Number.isFinite(n)) return { text: "—", direction: "flat" };
  const rounded = Math.abs(n).toFixed(2);
  const direction: Direction = rounded === "0.00" ? "flat" : n > 0 ? "up" : "down";
  return { text: `${rounded}%`, direction };
};

/** "just now" / "5m ago" / "2h ago" / "3d ago" */
export const relativeTime = (timestampMs: number, nowMs: number = Date.now()): string => {
  const diff = Math.max(0, nowMs - timestampMs);
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/** Plain large-number formatting with grouping (supply, etc.). */
export const formatNumber = (n: number): string =>
  new Intl.NumberFormat(USD, { maximumFractionDigits: 0 }).format(n);
