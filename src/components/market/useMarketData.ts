import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchSparklines } from "../../api/client.ts";
import type { Coin, SparklineMap } from "../../api/types.ts";

export type SortField =
  | "rank"
  | "name"
  | "price"
  | "priceChange1h"
  | "priceChange1d"
  | "priceChange1w"
  | "marketCap"
  | "volume";

export interface SortState {
  field: SortField;
  direction: "asc" | "desc";
}

const DEFAULT_DIRECTION: Record<SortField, "asc" | "desc"> = {
  rank: "asc",
  name: "asc",
  price: "desc",
  priceChange1h: "desc",
  priceChange1d: "desc",
  priceChange1w: "desc",
  marketCap: "desc",
  volume: "desc",
};

export function useSort() {
  const [sort, setSort] = useState<SortState>({ field: "rank", direction: "asc" });
  const toggle = (field: SortField) =>
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: DEFAULT_DIRECTION[field] },
    );
  return { sort, toggle };
}

export function filterAndSort(coins: Coin[], search: string, sort: SortState): Coin[] {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? coins.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
      )
    : coins;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    if (sort.field === "name") return a.name.localeCompare(b.name) * dir;
    const va = a[sort.field] ?? Number.NEGATIVE_INFINITY;
    const vb = b[sort.field] ?? Number.NEGATIVE_INFINITY;
    return (va - vb) * dir;
  });
}

const CHUNK = 10;

/**
 * Sparklines for the rank-chunks covering the given visible coins.
 * Chunks are defined on `rank` over the full list, so cache keys stay stable
 * no matter how the table is sorted or filtered.
 */
export function useSparklinesFor(
  allCoins: Coin[] | undefined,
  visible: Coin[],
): SparklineMap {
  const chunks = useMemo(() => {
    if (!allCoins?.length) return [] as string[][];
    const wanted = new Set(visible.map((c) => Math.floor((c.rank - 1) / CHUNK)));
    return [...wanted]
      .sort((a, b) => a - b)
      .map((i) =>
        allCoins
          .filter((c) => Math.floor((c.rank - 1) / CHUNK) === i)
          .map((c) => c.id)
          .sort(),
      )
      .filter((ids) => ids.length > 0);
  }, [allCoins, visible]);

  const results = useQueries({
    queries: chunks.map((ids) => ({
      queryKey: ["sparklines", ids] as const,
      queryFn: () => fetchSparklines(ids),
      staleTime: 3_600_000,
      gcTime: 3_600_000,
    })),
  });

  return useMemo(() => {
    const merged: SparklineMap = {};
    for (const r of results) if (r.data) Object.assign(merged, r.data);
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map((r) => r.dataUpdatedAt).join(",")]);
}
