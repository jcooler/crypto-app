import NumberFlow, { type Format } from "@number-flow/react";
import Skeleton from "react-loading-skeleton";
import { useCoins, useMarkets } from "../api/queries.ts";
import { formatPercent } from "../lib/format.ts";

function ChangeChip({ value }: { value: number | null }) {
  const change = formatPercent(value);
  if (change.direction === "flat")
    return <span className="tabular text-xs text-muted">{change.text}</span>;
  const cls = change.direction === "up" ? "text-up" : "text-down";
  return (
    <span className={`tabular flex items-center gap-0.5 text-xs font-medium ${cls}`}>
      <span aria-hidden="true">{change.direction === "up" ? "▲" : "▼"}</span>
      <span className="sr-only">{change.direction === "up" ? "up" : "down"}</span>
      {change.text}
    </span>
  );
}

const compactFormat: Format = {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
};

function Stat({
  label,
  value,
  format,
  suffix,
  change,
}: {
  label: string;
  value: number | undefined;
  format: Format;
  suffix?: string;
  change: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 sm:flex-col sm:shrink-0 sm:items-start sm:justify-center sm:gap-1 sm:px-6 sm:py-3 sm:first:pl-0">
      <span className="microlabel whitespace-nowrap">{label}</span>
      <span className="flex h-7 items-baseline gap-2">
        {value === undefined ? (
          <Skeleton width={140} height={20} />
        ) : (
          <>
            <span className="tabular whitespace-nowrap text-base font-semibold tracking-tight text-body sm:text-lg">
              <NumberFlow value={value} format={format} suffix={suffix} />
            </span>
            <ChangeChip value={change} />
          </>
        )}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const markets = useMarkets();
  const coins = useCoins();

  // fall back to deriving global stats from the coins list if /markets fails
  const derived = coins.data
    ? {
        marketCap: coins.data.reduce((s, c) => s + c.marketCap, 0),
        volume: coins.data.reduce((s, c) => s + c.volume, 0),
        btcDominance:
          ((coins.data.find((c) => c.id === "bitcoin")?.marketCap ?? 0) /
            Math.max(
              1,
              coins.data.reduce((s, c) => s + c.marketCap, 0),
            )) *
          100,
        marketCapChange: null,
        volumeChange: null,
        btcDominanceChange: null,
      }
    : undefined;

  const g = markets.data ?? (markets.isError ? derived : undefined);

  return (
    <section aria-label="Global market statistics">
      {/* stacked rows on phones; horizontal strip with hairline dividers from sm up */}
      <div className="divide-y sm:flex sm:divide-y-0 sm:divide-x [&>*]:hairline">
        <Stat
          label="Total market cap"
          value={g?.marketCap}
          format={compactFormat}
          change={g?.marketCapChange ?? null}
        />
        <Stat
          label="24h volume"
          value={g?.volume}
          format={compactFormat}
          change={g?.volumeChange ?? null}
        />
        <Stat
          label="BTC dominance"
          value={g?.btcDominance}
          format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
          suffix="%"
          change={g?.btcDominanceChange ?? null}
        />
      </div>
    </section>
  );
}
