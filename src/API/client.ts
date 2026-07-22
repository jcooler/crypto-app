import type {
  ChartPoint,
  Coin,
  GlobalMarkets,
  NewsItem,
  SparklineMap,
} from "./types.ts";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** True once any response has been flagged as demo/fixture data. */
let demoData = false;
const demoListeners = new Set<() => void>();
export const isDemoData = () => demoData;
export const onDemoDataChange = (fn: () => void) => {
  demoListeners.add(fn);
  return () => void demoListeners.delete(fn);
};

async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`/api/${path}${qs}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${path}`, res.status);
  }
  if (res.headers.get("x-qv-data") === "fixture" && !demoData) {
    demoData = true;
    demoListeners.forEach((fn) => fn());
  }
  return (await res.json()) as T;
}

const toNum = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const toNumOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/* eslint-disable @typescript-eslint/no-explicit-any -- tolerant boundary parsing */
const normalizeCoin = (raw: any): Coin => ({
  id: String(raw.id ?? ""),
  icon: String(raw.icon ?? ""),
  name: String(raw.name ?? ""),
  symbol: String(raw.symbol ?? ""),
  rank: toNum(raw.rank),
  price: toNum(raw.price),
  volume: toNum(raw.volume),
  marketCap: toNum(raw.marketCap),
  availableSupply: toNum(raw.availableSupply),
  totalSupply: toNum(raw.totalSupply),
  fullyDilutedValuation: toNumOrNull(raw.fullyDilutedValuation) ?? undefined,
  priceChange1h: toNumOrNull(raw.priceChange1h),
  priceChange1d: toNumOrNull(raw.priceChange1d),
  priceChange1w: toNumOrNull(raw.priceChange1w ?? raw.priceChange7d),
  websiteUrl: typeof raw.websiteUrl === "string" ? raw.websiteUrl : undefined,
});

export async function fetchCoins(limit = 100): Promise<Coin[]> {
  const data = await apiGet<any>("coins", { limit: String(limit), currency: "USD" });
  const list: unknown[] = Array.isArray(data?.result) ? data.result : [];
  return list.map(normalizeCoin).filter((c) => c.id !== "");
}

export async function fetchCoin(id: string): Promise<Coin> {
  const data = await apiGet<any>(`coins/${encodeURIComponent(id)}`, { currency: "USD" });
  // upstream may return the coin bare or wrapped
  return normalizeCoin(data?.result ?? data?.coin ?? data);
}

export async function fetchMarkets(): Promise<GlobalMarkets> {
  const data = await apiGet<any>("markets");
  const g = data?.result ?? data ?? {};
  return {
    marketCap: toNum(g.marketCap ?? g.totalMarketCap),
    volume: toNum(g.volume ?? g.totalVolume ?? g.volume24h),
    btcDominance: toNum(g.btcDominance),
    marketCapChange: toNumOrNull(g.marketCapChange),
    volumeChange: toNumOrNull(g.volumeChange),
    btcDominanceChange: toNumOrNull(g.btcDominanceChange),
  };
}

const normalizeChart = (data: any): ChartPoint[] => {
  const arr: unknown[] = Array.isArray(data) ? data : (data?.chart ?? []);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((p): p is number[] => Array.isArray(p) && p.length >= 2)
    .map((p): ChartPoint => [toNum(p[0]), toNum(p[1])])
    .filter(([t, v]) => t > 0 && v > 0);
};

export async function fetchCoinChart(id: string, period: string): Promise<ChartPoint[]> {
  const data = await apiGet<any>(`coins/${encodeURIComponent(id)}/charts`, { period });
  return normalizeChart(data);
}

export async function fetchSparklines(ids: string[]): Promise<SparklineMap> {
  if (ids.length === 0) return {};
  const data = await apiGet<any>("sparklines", { ids: ids.join(",") });
  const out: SparklineMap = {};
  for (const [id, points] of Object.entries(data ?? {})) {
    out[id] = normalizeChart(points);
  }
  return out;
}

export async function fetchNews(limit = 12): Promise<NewsItem[]> {
  const data = await apiGet<any>("news", { limit: String(limit) });
  const list: unknown[] = Array.isArray(data?.result) ? data.result : [];
  return list.map((raw: any, i: number): NewsItem => {
    const feedDate = toNum(raw.feedDate);
    return {
      id: String(raw.id ?? `news-${i}`),
      // CoinStats feedDate is epoch ms; tolerate seconds just in case
      feedDate: feedDate > 1e12 ? feedDate : feedDate * 1000,
      source: String(raw.source ?? raw.sourceLink ?? "Unknown"),
      title: String(raw.title ?? ""),
      imgUrl:
        typeof raw.imgUrl === "string" && raw.imgUrl
          ? raw.imgUrl
          : typeof raw.imgURL === "string" && raw.imgURL
            ? raw.imgURL
            : null,
      link: String(raw.link ?? raw.sourceLink ?? "#"),
    };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
