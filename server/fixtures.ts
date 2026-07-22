// Deterministic demo data served when no valid CoinStats key is configured.
// Values follow a seeded random walk keyed to the current minute so prices
// "move" between polls, exercising the live-update UI honestly — every
// response built from this module is flagged with the `x-qv-data: fixture`
// header so the client can label it as demo data.

interface SeedCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  mcap: number; // billions USD
  hue: number;
}

const SEED_COINS: SeedCoin[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 118250, mcap: 2330, hue: 36 },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 3640, mcap: 437, hue: 250 },
  { id: "tether", name: "Tether", symbol: "USDT", price: 1.0, mcap: 160, hue: 160 },
  { id: "ripple", name: "XRP", symbol: "XRP", price: 3.42, mcap: 202, hue: 210 },
  { id: "binance-coin", name: "BNB", symbol: "BNB", price: 752, mcap: 105, hue: 45 },
  { id: "solana", name: "Solana", symbol: "SOL", price: 186.4, mcap: 100, hue: 275 },
  { id: "usd-coin", name: "USDC", symbol: "USDC", price: 0.9998, mcap: 64, hue: 215 },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", price: 0.2381, mcap: 35.8, hue: 50 },
  { id: "cardano", name: "Cardano", symbol: "ADA", price: 0.8214, mcap: 29.7, hue: 205 },
  { id: "tron", name: "TRON", symbol: "TRX", price: 0.3145, mcap: 29.8, hue: 0 },
  { id: "hyperliquid", name: "Hyperliquid", symbol: "HYPE", price: 44.2, mcap: 14.8, hue: 150 },
  { id: "stellar", name: "Stellar", symbol: "XLM", price: 0.4666, mcap: 14.5, hue: 190 },
  { id: "chainlink", name: "Chainlink", symbol: "LINK", price: 18.92, mcap: 12.8, hue: 225 },
  { id: "hedera", name: "Hedera", symbol: "HBAR", price: 0.2843, mcap: 12.0, hue: 265 },
  { id: "bitcoin-cash", name: "Bitcoin Cash", symbol: "BCH", price: 522.3, mcap: 10.4, hue: 120 },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", price: 24.51, mcap: 10.3, hue: 355 },
  { id: "litecoin", name: "Litecoin", symbol: "LTC", price: 114.2, mcap: 8.7, hue: 220 },
  { id: "the-open-network", name: "Toncoin", symbol: "TON", price: 3.24, mcap: 8.0, hue: 200 },
  { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB", price: 0.00001402, mcap: 8.3, hue: 25 },
  { id: "uniswap", name: "Uniswap", symbol: "UNI", price: 10.44, mcap: 6.3, hue: 320 },
  { id: "polkadot", name: "Polkadot", symbol: "DOT", price: 4.12, mcap: 6.3, hue: 330 },
  { id: "monero", name: "Monero", symbol: "XMR", price: 327.5, mcap: 6.0, hue: 20 },
  { id: "pepe", name: "Pepe", symbol: "PEPE", price: 0.0000128, mcap: 5.4, hue: 110 },
  { id: "aave", name: "Aave", symbol: "AAVE", price: 302.1, mcap: 4.6, hue: 285 },
  { id: "bittensor", name: "Bittensor", symbol: "TAO", price: 428.7, mcap: 4.0, hue: 240 },
  { id: "near-protocol", name: "NEAR Protocol", symbol: "NEAR", price: 2.91, mcap: 3.6, hue: 145 },
  { id: "aptos", name: "Aptos", symbol: "APT", price: 5.18, mcap: 3.4, hue: 175 },
  { id: "internet-computer", name: "Internet Computer", symbol: "ICP", price: 5.62, mcap: 3.0, hue: 260 },
  { id: "ethereum-classic", name: "Ethereum Classic", symbol: "ETC", price: 22.87, mcap: 3.5, hue: 95 },
  { id: "ondo-finance", name: "Ondo", symbol: "ONDO", price: 1.06, mcap: 3.3, hue: 230 },
  { id: "kaspa", name: "Kaspa", symbol: "KAS", price: 0.1042, mcap: 2.7, hue: 165 },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", price: 0.4521, mcap: 2.3, hue: 212 },
  { id: "render-token", name: "Render", symbol: "RNDR", price: 4.32, mcap: 2.2, hue: 5 },
  { id: "cosmos", name: "Cosmos", symbol: "ATOM", price: 4.87, mcap: 1.9, hue: 255 },
  { id: "algorand", name: "Algorand", symbol: "ALGO", price: 0.2872, mcap: 2.5, hue: 0 },
  { id: "filecoin", name: "Filecoin", symbol: "FIL", price: 2.71, mcap: 1.9, hue: 195 },
  { id: "optimism", name: "Optimism", symbol: "OP", price: 0.7412, mcap: 1.3, hue: 350 },
  { id: "injective-protocol", name: "Injective", symbol: "INJ", price: 13.87, mcap: 1.4, hue: 205 },
  { id: "the-graph", name: "The Graph", symbol: "GRT", price: 0.1121, mcap: 1.1, hue: 270 },
  { id: "sei-network", name: "Sei", symbol: "SEI", price: 0.3312, mcap: 1.9, hue: 340 },
];

// mulberry32 over a string hash — deterministic per (key, timeBucket)
const hash = (s: string) => {
  let h = 1779033703;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
  return h >>> 0;
};
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Symmetric jitter in ±range around 0, deterministic for key+bucket. */
const drift = (key: string, bucketMs: number, range: number) => {
  const bucket = Math.floor(Date.now() / bucketMs);
  return (rng(hash(`${key}:${bucket}`))() * 2 - 1) * range;
};

const iconSvg = (symbol: string, hue: number) => {
  const letter = symbol.slice(0, 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="hsl(${hue} 55% 45%)"/><text x="32" y="41" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const fixtureCoin = (seed: SeedCoin, rank: number) => {
  const stable = seed.symbol.startsWith("USD") || seed.symbol === "USDT";
  const p = (mins: number, range: number) =>
    stable ? drift(seed.id, mins * 60_000, 0.02) : drift(seed.id, mins * 60_000, range);
  const price = seed.price * (1 + (stable ? 0 : drift(seed.id + ":p", 60_000, 0.004)));
  const mcap = seed.mcap * 1e9 * (1 + drift(seed.id + ":m", 60_000, 0.003));
  return {
    id: seed.id,
    icon: iconSvg(seed.symbol, seed.hue),
    name: seed.name,
    symbol: seed.symbol,
    rank,
    price,
    priceBtc: price / 118250,
    volume: mcap * (0.02 + rng(hash(seed.id + ":v"))() * 0.15),
    marketCap: mcap,
    availableSupply: mcap / price,
    totalSupply: (mcap / price) * (1 + rng(hash(seed.id + ":s"))() * 0.3),
    fullyDilutedValuation: mcap * 1.1,
    priceChange1h: +p(60, 1.2).toFixed(2),
    priceChange1d: +p(60 * 24, 5).toFixed(2),
    priceChange1w: +p(60 * 24 * 7, 12).toFixed(2),
    redditUrl: "",
    websiteUrl: "",
    twitterUrl: "",
    explorers: [],
  };
};

export const fixtureCoins = (limit: number) => ({
  result: SEED_COINS.slice(0, limit).map((c, i) => fixtureCoin(c, i + 1)),
  meta: { page: 1, limit, itemCount: Math.min(limit, SEED_COINS.length), pageCount: 1 },
});

export const fixtureCoinById = (id: string) => {
  const i = SEED_COINS.findIndex((c) => c.id === id);
  return i === -1 ? null : fixtureCoin(SEED_COINS[i]!, i + 1);
};

const PERIOD_MS: Record<string, number> = {
  "24h": 864e5,
  "1w": 6048e5,
  "1m": 2592e6,
  "3m": 7776e6,
  "6m": 15552e6,
  "1y": 31536e6,
  all: 94608e6,
};

export const fixtureChart = (id: string, period: string) => {
  const span = PERIOD_MS[period] ?? PERIOD_MS["1w"]!;
  const seed = SEED_COINS.find((c) => c.id === id);
  const base = seed?.price ?? 100;
  const points = 160;
  const step = span / points;
  const now = Date.now();
  const rand = rng(hash(`${id}:${period}:chart`));
  let v = base * (0.82 + rand() * 0.2);
  const out: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    v *= 1 + (rand() * 2 - 1) * 0.018;
    // pull the walk toward the current price near the end
    const t = i / points;
    const target = base;
    v = v * (1 - t * 0.08) + target * (t * 0.08);
    out.push([Math.round((now - span + i * step) / 1000), +v.toPrecision(8)]);
  }
  return out;
};

export const fixtureMarkets = () => {
  const coins = fixtureCoins(40).result;
  const mcap = coins.reduce((s, c) => s + c.marketCap, 0) * 1.22;
  const volume = coins.reduce((s, c) => s + c.volume, 0) * 1.35;
  const btc = coins[0]!;
  return {
    marketCap: mcap,
    volume,
    btcDominance: +((btc.marketCap / mcap) * 100).toFixed(2),
    marketCapChange: +drift("g:mcap", 864e5, 3).toFixed(2),
    volumeChange: +drift("g:vol", 864e5, 9).toFixed(2),
    btcDominanceChange: +drift("g:dom", 864e5, 0.8).toFixed(2),
  };
};

const NEWS_SEEDS: [title: string, source: string, hoursAgo: number][] = [
  ["Bitcoin holds above $118K as ETF inflows hit a three-week high", "CoinDesk", 1],
  ["Ethereum staking withdrawals slow as validator queue clears", "The Block", 3],
  ["Solana DEX volume tops $4B in 24 hours, led by memecoin rotation", "Decrypt", 5],
  ["SEC delays decision on spot XRP ETF applications to September", "Cointelegraph", 7],
  ["Layer-2 fees fall to record lows after latest data-availability upgrade", "The Defiant", 9],
  ["Tether mints another $1B USDT on Tron amid rising exchange demand", "CryptoSlate", 12],
  ["Chainlink expands CCIP to five new chains in interoperability push", "CoinDesk", 15],
  ["Bitcoin miners' hash price recovers as network difficulty dips 3%", "Bitcoin Magazine", 18],
  ["Tokenized treasury funds cross $6B as institutions chase yield on-chain", "Blockworks", 21],
  ["Aave v4 proposal advances with unified liquidity layer design", "The Defiant", 26],
  ["Stablecoin settlement volume rivals major card networks in Q2 report", "The Block", 30],
  ["Kaspa upgrade cuts block times as throughput experiment continues", "CryptoSlate", 34],
];

const newsThumb = (i: number) => {
  const hue = (i * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 45% 22%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360} 50% 12%)"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="${80 + ((i * 83) % 480)}" cy="${60 + ((i * 61) % 240)}" r="90" fill="hsl(${(hue + 30) % 360} 55% 35%)" opacity="0.55"/><circle cx="${420 - ((i * 37) % 300)}" cy="${240 - ((i * 29) % 180)}" r="60" fill="hsl(${(hue + 90) % 360} 60% 45%)" opacity="0.4"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const fixtureNews = (limit: number) => ({
  result: NEWS_SEEDS.slice(0, limit).map(([title, source, hoursAgo], i) => ({
    id: `fixture-${i}`,
    feedDate: Date.now() - hoursAgo * 36e5,
    source,
    sourceLink: "#",
    title,
    imgUrl: newsThumb(i),
    link: "#",
    description: "",
  })),
});
