import NumberFlow, { type Format } from "@number-flow/react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import { useCoin, useCoinChart } from "../api/queries.ts";
import type { ChartPeriod } from "../api/types.ts";
import PriceChart from "../components/chart/PriceChart.tsx";
import { ErrorState } from "../components/ui/states.tsx";
import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatPrice,
} from "../lib/format.ts";

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: "24h", label: "24H" },
  { value: "1w", label: "7D" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

const priceFormat: Format = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

function RangeTabs({
  period,
  onChange,
}: {
  period: ChartPeriod;
  onChange: (p: ChartPeriod) => void;
}) {
  return (
    <fieldset className="flex rounded-lg border hairline bg-surface-2 p-0.5">
      <legend className="sr-only">Chart time range</legend>
      {PERIODS.map(({ value, label }) => (
        <label
          key={value}
          className={`cursor-pointer rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
            period === value ? "bg-accent/15 text-accent" : "text-muted hover:text-body"
          }`}
        >
          <input
            type="radio"
            name="chart-period"
            value={value}
            checked={period === value}
            onChange={() => onChange(value)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border hairline bg-surface p-4">
      <span className="microlabel">{label}</span>
      <span className="tabular text-base font-semibold text-body">{children}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div aria-busy="true">
      <div className="flex items-center gap-3 pt-8">
        <Skeleton circle width={40} height={40} />
        <div>
          <Skeleton width={160} height={22} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <Skeleton width={220} height={34} className="mt-4" />
      <Skeleton height={288} className="mt-6" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} height={76} />
        ))}
      </div>
    </div>
  );
}

export default function CoinDetail() {
  const { id = "" } = useParams();
  const [period, setPeriod] = useState<ChartPeriod>("1w");
  const coin = useCoin(id);
  const chart = useCoinChart(id, period);

  useEffect(() => {
    if (coin.data?.name) document.title = `${coin.data.name} — QuantumVista`;
    return () => {
      document.title = "QuantumVista — Live crypto markets";
    };
  }, [coin.data?.name]);

  const change = formatPercent(coin.data?.priceChange1d);
  const changeCls =
    change.direction === "up" ? "text-up" : change.direction === "down" ? "text-down" : "text-muted";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-body"
        >
          <span aria-hidden="true">←</span> All markets
        </Link>
      </nav>

      {coin.isPending ? (
        <DetailSkeleton />
      ) : coin.isError || !coin.data ? (
        <ErrorState
          title="Couldn't load this coin"
          detail="The coin may not exist, or the data service didn't respond."
          onRetry={() => void coin.refetch()}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
            <div className="flex items-center gap-3">
              <img src={coin.data.icon} alt="" width={40} height={40} className="rounded-full" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-body">
                  {coin.data.name}
                </h1>
                <p className="font-mono text-xs uppercase text-muted">
                  {coin.data.symbol} · Rank #{coin.data.rank}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="tabular text-3xl font-semibold tracking-tight text-body">
                {coin.data.price >= 1 ? (
                  <NumberFlow value={coin.data.price} format={priceFormat} />
                ) : (
                  formatPrice(coin.data.price)
                )}
              </span>
              <span className={`tabular flex items-center gap-1 text-sm font-medium ${changeCls}`}>
                {change.direction !== "flat" ? (
                  <span aria-hidden="true">{change.direction === "up" ? "▲" : "▼"}</span>
                ) : null}
                <span className="sr-only">
                  {change.direction === "up" ? "up" : change.direction === "down" ? "down" : ""}
                </span>
                {change.text} (24h)
              </span>
            </div>
          </div>

          <section aria-label="Price chart" className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="microlabel">Price · USD</p>
              <RangeTabs period={period} onChange={setPeriod} />
            </div>
            <div className="surface-panel p-2 sm:p-4">
              {chart.isPending ? (
                <Skeleton className="!h-72 sm:!h-96" />
              ) : chart.isError ? (
                <ErrorState
                  title="Couldn't load the chart"
                  onRetry={() => void chart.refetch()}
                />
              ) : chart.data && chart.data.length > 1 ? (
                <PriceChart points={chart.data} direction={change.direction} />
              ) : (
                <ErrorState title="No chart data for this range" />
              )}
            </div>
          </section>

          <section aria-label="Key statistics" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Market cap">{formatCompactCurrency(coin.data.marketCap)}</StatTile>
            <StatTile label="Volume (24h)">{formatCompactCurrency(coin.data.volume)}</StatTile>
            <StatTile label="Circulating supply">
              {formatNumber(coin.data.availableSupply)}{" "}
              <span className="font-mono text-xs uppercase text-muted">{coin.data.symbol}</span>
            </StatTile>
            <StatTile label="Total supply">
              {formatNumber(coin.data.totalSupply)}{" "}
              <span className="font-mono text-xs uppercase text-muted">{coin.data.symbol}</span>
            </StatTile>
          </section>

          {coin.data.websiteUrl ? (
            <p className="mt-6">
              <a
                href={coin.data.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              >
                Official website ↗
              </a>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
