// CoinStats openapiv1 response shapes (normalized — see client.ts for the
// tolerant parsing that maps minor upstream field variations onto these).

export interface Coin {
  id: string;
  icon: string;
  name: string;
  symbol: string;
  rank: number;
  price: number;
  volume: number;
  marketCap: number;
  availableSupply: number;
  totalSupply: number;
  fullyDilutedValuation?: number;
  priceChange1h: number | null;
  priceChange1d: number | null;
  priceChange1w: number | null;
  websiteUrl?: string;
}

export interface CoinsResponse {
  result: Coin[];
  meta?: { page: number; limit: number; itemCount: number; pageCount: number };
}

export interface GlobalMarkets {
  marketCap: number;
  volume: number;
  btcDominance: number;
  marketCapChange: number | null;
  volumeChange: number | null;
  btcDominanceChange: number | null;
}

export interface NewsItem {
  id: string;
  feedDate: number; // epoch ms
  source: string;
  title: string;
  imgUrl: string | null;
  link: string;
}

export interface NewsResponse {
  result: NewsItem[];
}

/** [epochSeconds, priceUsd] */
export type ChartPoint = [number, number];

export type ChartPeriod = "24h" | "1w" | "1m" | "3m" | "1y" | "all";

/** coinId → 7d sparkline points */
export type SparklineMap = Record<string, ChartPoint[]>;
