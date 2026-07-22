import {
  QueryClient,
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  ApiError,
  fetchCoin,
  fetchCoinChart,
  fetchCoins,
  fetchMarkets,
  fetchNews,
  fetchSparklines,
} from "./client.ts";
import type {
  ChartPeriod,
  ChartPoint,
  Coin,
  GlobalMarkets,
  NewsItem,
  SparklineMap,
} from "./types.ts";

// Free tier budget: 20k credits/month, 2 req/s. The proxy caches server-side;
// client-side we poll coins at 60s (foreground only), news at 10m, and keep
// charts/sparklines long-lived. Retries back off exponentially and never
// retry non-429 4xx errors.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500 && error.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      refetchOnWindowFocus: false,
    },
  },
});

export const coinsQuery = () => ({
  queryKey: ["coins"] as const,
  queryFn: () => fetchCoins(100),
  refetchInterval: 60_000,
  placeholderData: keepPreviousData,
});

export const useCoins = (): UseQueryResult<Coin[]> => useQuery(coinsQuery());

export const useMarkets = (): UseQueryResult<GlobalMarkets> =>
  useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    refetchInterval: 120_000,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const useNews = (): UseQueryResult<NewsItem[]> =>
  useQuery({
    queryKey: ["news"],
    queryFn: () => fetchNews(12),
    staleTime: 600_000,
    refetchInterval: 600_000,
  });

export const coinQuery = (id: string) => ({
  queryKey: ["coin", id] as const,
  queryFn: () => fetchCoin(id),
  staleTime: 60_000,
});

export const useCoin = (id: string): UseQueryResult<Coin> =>
  useQuery({ ...coinQuery(id), refetchInterval: 60_000, placeholderData: keepPreviousData });

export const useCoinChart = (
  id: string,
  period: ChartPeriod,
): UseQueryResult<ChartPoint[]> =>
  useQuery({
    queryKey: ["chart", id, period],
    queryFn: () => fetchCoinChart(id, period),
    staleTime: 300_000,
    placeholderData: keepPreviousData,
  });

/** Sparklines for a rank-chunk of coin ids (stable chunks → stable cache keys). */
export const useSparklines = (
  ids: string[],
  enabled: boolean,
): UseQueryResult<SparklineMap> =>
  useQuery({
    queryKey: ["sparklines", ids],
    queryFn: () => fetchSparklines(ids),
    staleTime: 3_600_000,
    gcTime: 3_600_000,
    enabled: enabled && ids.length > 0,
  });

/** Warm the detail route's coin query (row hover/focus). */
export const prefetchCoin = (id: string) =>
  queryClient.prefetchQuery({ ...coinQuery(id), staleTime: 60_000 });
