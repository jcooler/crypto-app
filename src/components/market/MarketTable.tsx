import { memo, useEffect, useMemo, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useNavigate } from "react-router-dom";
import { prefetchCoin, useCoins } from "../../api/queries.ts";
import type { Coin } from "../../api/types.ts";
import { formatCompactCurrency, formatPercent, formatPrice } from "../../lib/format.ts";
import { useDebouncedValue } from "../../lib/useDebouncedValue.ts";
import { useMediaQuery } from "../../lib/useMediaQuery.ts";
import LastUpdated from "../LastUpdated.tsx";
import { EmptyState, ErrorState, SectionHeading } from "../ui/states.tsx";
import { filterAndSort, useSort, type SortField, type SortState } from "./useMarketData.ts";

const PAGE_SIZE = 20;

function PercentCell({ value }: { value: number | null }) {
  const change = formatPercent(value);
  const cls =
    change.direction === "up"
      ? "text-up"
      : change.direction === "down"
        ? "text-down"
        : "text-muted";
  return (
    <span className={`tabular inline-flex items-center justify-end gap-1 text-sm ${cls}`}>
      {change.direction !== "flat" ? (
        <>
          <span aria-hidden="true" className="text-[9px]">
            {change.direction === "up" ? "▲" : "▼"}
          </span>
          <span className="sr-only">{change.direction === "up" ? "up " : "down "}</span>
        </>
      ) : null}
      {change.text}
    </span>
  );
}

const COLUMNS: { field: SortField; label: string; align: "left" | "right"; className?: string }[] = [
  { field: "rank", label: "#", align: "left", className: "w-10" },
  { field: "name", label: "Coin", align: "left" },
  { field: "price", label: "Price", align: "right" },
  { field: "priceChange1h", label: "1h", align: "right", className: "hidden lg:table-cell" },
  { field: "priceChange1d", label: "24h", align: "right" },
  { field: "priceChange1w", label: "7d", align: "right", className: "hidden sm:table-cell" },
  { field: "marketCap", label: "Market cap", align: "right", className: "hidden md:table-cell" },
  { field: "volume", label: "Volume (24h)", align: "right", className: "hidden xl:table-cell" },
];

function SortHeader({
  column,
  sort,
  onSort,
}: {
  column: (typeof COLUMNS)[number];
  sort: SortState;
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === column.field;
  const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`${column.className ?? ""} px-3 py-2.5 first:pl-4 last:pr-4`}
    >
      <button
        type="button"
        onClick={() => onSort(column.field)}
        className={`microlabel inline-flex w-full items-center gap-1 transition-colors hover:text-body ${
          column.align === "right" ? "justify-end" : "justify-start"
        } ${active ? "!text-body" : ""}`}
      >
        {column.label}
        <span aria-hidden="true" className={`text-[8px] ${active ? "opacity-100" : "opacity-0"}`}>
          {active && sort.direction === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

const CoinRow = memo(function CoinRow({
  coin,
  onNavigate,
}: {
  coin: Coin;
  onNavigate: (id: string) => void;
}) {
  return (
    <tr
      onClick={() => onNavigate(coin.id)}
      onMouseEnter={() => prefetchCoin(coin.id)}
      className="h-14 cursor-pointer border-b hairline transition-colors last:border-b-0 hover:bg-surface-2"
    >
      <td className="tabular w-10 px-3 pl-4 text-sm text-muted">{coin.rank}</td>
      <td className="px-3">
        <span className="flex items-center gap-3">
          <img src={coin.icon} alt="" width={24} height={24} className="rounded-full" loading="lazy" />
          <span className="flex min-w-0 flex-col">
            <Link
              to={`/coin/${coin.id}`}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => prefetchCoin(coin.id)}
              className="truncate text-sm font-medium text-body hover:text-accent"
            >
              {coin.name}
            </Link>
            <span className="font-mono text-[11px] uppercase text-muted">{coin.symbol}</span>
          </span>
        </span>
      </td>
      <td className="tabular px-3 text-right text-sm font-medium text-body">
        {formatPrice(coin.price)}
      </td>
      <td className="hidden px-3 text-right lg:table-cell">
        <PercentCell value={coin.priceChange1h} />
      </td>
      <td className="px-3 text-right">
        <PercentCell value={coin.priceChange1d} />
      </td>
      <td className="hidden px-3 text-right sm:table-cell">
        <PercentCell value={coin.priceChange1w} />
      </td>
      <td className="tabular hidden px-3 text-right text-sm text-body md:table-cell">
        {formatCompactCurrency(coin.marketCap)}
      </td>
      <td className="tabular hidden px-3 pr-4 text-right text-sm text-muted xl:table-cell">
        {formatCompactCurrency(coin.volume)}
      </td>
    </tr>
  );
});

const CoinCard = memo(function CoinCard({ coin }: { coin: Coin }) {
  return (
    <li>
      <Link
        to={`/coin/${coin.id}`}
        onFocus={() => prefetchCoin(coin.id)}
        onTouchStart={() => prefetchCoin(coin.id)}
        className="flex items-center gap-3 border-b hairline px-4 py-3 transition-colors hover:bg-surface-2"
      >
        <span className="tabular w-6 shrink-0 text-xs text-muted">{coin.rank}</span>
        <img src={coin.icon} alt="" width={28} height={28} className="rounded-full" loading="lazy" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-body">{coin.name}</span>
          <span className="font-mono text-[11px] uppercase text-muted">{coin.symbol}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="tabular text-sm font-medium text-body">{formatPrice(coin.price)}</span>
          <PercentCell value={coin.priceChange1d} />
        </span>
      </Link>
    </li>
  );
});

function TableSkeleton() {
  return (
    <div className="px-4">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="flex h-14 items-center gap-4 border-b hairline last:border-b-0">
          <Skeleton width={20} height={14} />
          <Skeleton circle width={24} height={24} />
          <div className="flex-1">
            <Skeleton width={120} height={14} />
          </div>
          <Skeleton width={80} height={14} />
          <Skeleton width={56} height={14} className="hidden sm:block" />
          <Skeleton width={100} height={14} className="hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const buttonCls =
    "rounded-lg border hairline bg-surface-2 px-3 py-1.5 font-mono text-xs font-medium text-body transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-inherit disabled:hover:text-body";
  return (
    <nav
      aria-label="Table pages"
      className="flex items-center justify-between gap-3 border-t hairline px-4 py-3"
    >
      <p className="font-mono text-[11px] text-muted">
        {from}–{to} <span aria-hidden="true">/</span>
        <span className="sr-only">of</span> {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={buttonCls}
        >
          <span aria-hidden="true">←</span> Prev
        </button>
        <span className="tabular px-1 font-mono text-xs text-muted">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className={buttonCls}
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}

function DataTable({
  pageRows,
  sort,
  onSort,
}: {
  pageRows: Coin[];
  sort: SortState;
  onSort: (f: SortField) => void;
}) {
  const navigate = useNavigate();

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">
        Cryptocurrency market data: prices, changes, market cap, and volume.
        Column headers sort the table.
      </caption>
      <thead>
        <tr className="border-b hairline">
          {COLUMNS.map((col) => (
            <SortHeader key={col.field} column={col} sort={sort} onSort={onSort} />
          ))}
        </tr>
      </thead>
      <tbody>
        {pageRows.map((coin) => (
          <CoinRow key={coin.id} coin={coin} onNavigate={(id) => navigate(`/coin/${id}`)} />
        ))}
      </tbody>
    </table>
  );
}

export default function MarketTable() {
  const { data: coins, isPending, isError, refetch, dataUpdatedAt } = useCoins();
  const { sort, toggle } = useSort();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const sectionRef = useRef<HTMLElement>(null);

  const rows = useMemo(
    () => filterAndSort(coins ?? [], debouncedSearch, sort),
    [coins, debouncedSearch, sort],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = rows.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  // new search or sort → back to the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), pageCount));
    sectionRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="market-heading"
      className="scroll-mt-16 pt-10"
    >
      <SectionHeading id="market-heading" label="Markets" title="Top 100 by market cap">
        <div className="flex items-center gap-4">
          <LastUpdated updatedAt={dataUpdatedAt} />
          <label className="relative block">
            <span className="sr-only">Search coins</span>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins"
              className="h-9 w-44 rounded-lg border hairline bg-surface-2 pl-9 pr-3 text-sm text-body placeholder:text-muted focus:border-accent/50 sm:w-56"
            />
          </label>
        </div>
      </SectionHeading>

      <div className="surface-panel overflow-hidden">
        {isPending ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorState
            title="Couldn't load market data"
            detail="The markets feed didn't respond. Your connection may be offline, or the data service may be rate limited."
            onRetry={() => void refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title={`No coins match “${debouncedSearch}”`}
            detail="Try a different name or ticker symbol."
          />
        ) : (
          <>
            {isDesktop ? (
              <DataTable pageRows={pageRows} sort={sort} onSort={toggle} />
            ) : (
              <ul className="list-none">
                {pageRows.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
                ))}
              </ul>
            )}
            <Pagination
              page={clampedPage}
              pageCount={pageCount}
              total={rows.length}
              onPage={goToPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
