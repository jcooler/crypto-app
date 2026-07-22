import { useState } from "react";
import type { Coin } from "../../api/types.ts";

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

