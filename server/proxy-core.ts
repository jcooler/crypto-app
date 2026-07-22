// Shared CoinStats proxy logic used by both the Netlify Function (production)
// and the Vite dev-server middleware. The API key never leaves the server.
import {
  fixtureChart,
  fixtureCoinById,
  fixtureCoins,
  fixtureMarkets,
  fixtureNews,
} from "./fixtures.ts";

const UPSTREAM = "https://openapiv1.coinstats.app";

interface Rule {
  pattern: RegExp;
  ttl: number; // seconds
  fixture: (path: string, params: URLSearchParams) => unknown;
}

const num = (v: string | null, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const ALLOW: Rule[] = [
  {
    pattern: /^coins$/,
    ttl: 30,
    fixture: (_p, q) => fixtureCoins(num(q.get("limit"), 100)),
  },
  {
    pattern: /^coins\/[\w-]+$/,
    ttl: 60,
    fixture: (p) => fixtureCoinById(p.split("/")[1]!) ?? { error: "not found" },
  },
  {
    pattern: /^coins\/[\w-]+\/charts$/,
    ttl: 300,
    fixture: (p, q) => fixtureChart(p.split("/")[1]!, q.get("period") ?? "1w"),
  },
  { pattern: /^markets$/, ttl: 300, fixture: () => fixtureMarkets() },
  {
    pattern: /^news$/,
    ttl: 600,
    fixture: (_p, q) => fixtureNews(num(q.get("limit"), 12)),
  },
];

interface CacheEntry {
  expires: number;
  body: string;
  fixture: boolean;
}
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<ProxyResult>>();

export interface ProxyResult {
  status: number;
  body: string;
  headers: Record<string, string>;
}

const headersFor = (ttl: number, fixture: boolean): Record<string, string> => ({
  "content-type": "application/json; charset=utf-8",
  "netlify-cdn-cache-control": fixture
    ? "public, s-maxage=30"
    : `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}`,
  "cache-control": "public, max-age=0, must-revalidate",
  ...(fixture ? { "x-qv-data": "fixture" } : {}),
});

const serveFixture = (rule: Rule, path: string, params: URLSearchParams): ProxyResult => ({
  status: 200,
  body: JSON.stringify(rule.fixture(path, params)),
  headers: headersFor(rule.ttl, true),
});

/**
 * Handle a request for `/api/<path>?<params>`. `path` excludes the `/api/` prefix.
 * Sparkline batching is layered on top in `handleApiRequest`.
 */
async function proxyOne(
  path: string,
  params: URLSearchParams,
  apiKey: string | undefined,
): Promise<ProxyResult> {
  const rule = ALLOW.find((r) => r.pattern.test(path));
  if (!rule) {
    return {
      status: 404,
      body: JSON.stringify({ error: `Unknown API route: ${path}` }),
      headers: { "content-type": "application/json" },
    };
  }
  params.sort();
  const key = `${path}?${params.toString()}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return {
      status: 200,
      body: hit.body,
      headers: { ...headersFor(rule.ttl, hit.fixture), "x-qv-cache": "hit" },
    };
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const work = (async (): Promise<ProxyResult> => {
    if (!apiKey) {
      const res = serveFixture(rule, path, params);
      cache.set(key, { expires: Date.now() + 30_000, body: res.body, fixture: true });
      return res;
    }
    let upstream: Response;
    try {
      upstream = await fetch(`${UPSTREAM}/${path}?${params.toString()}`, {
        headers: { accept: "application/json", "X-API-KEY": apiKey },
      });
    } catch {
      // network failure: serve stale if we have it, else error
      if (hit) return { status: 200, body: hit.body, headers: headersFor(rule.ttl, hit.fixture) };
      return {
        status: 502,
        body: JSON.stringify({ error: "Upstream unreachable" }),
        headers: { "content-type": "application/json" },
      };
    }
    if (upstream.ok) {
      const body = await upstream.text();
      cache.set(key, { expires: Date.now() + rule.ttl * 1000, body, fixture: false });
      return { status: 200, body, headers: headersFor(rule.ttl, false) };
    }
    if (upstream.status === 401 || upstream.status === 403) {
      // invalid key: fall back to demo data, clearly flagged
      const res = serveFixture(rule, path, params);
      cache.set(key, { expires: Date.now() + 60_000, body: res.body, fixture: true });
      return res;
    }
    if (hit) {
      // rate limited or 5xx: serve stale over failure
      return { status: 200, body: hit.body, headers: headersFor(rule.ttl, hit.fixture) };
    }
    return {
      status: upstream.status,
      body: JSON.stringify({ error: `Upstream error ${upstream.status}` }),
      headers: {
        "content-type": "application/json",
        ...(upstream.status === 429 ? { "retry-after": upstream.headers.get("retry-after") ?? "2" } : {}),
      },
    };
  })();

  inflight.set(key, work);
  try {
    return await work;
  } finally {
    inflight.delete(key);
  }
}

export async function handleApiRequest(
  pathname: string,
  params: URLSearchParams,
  apiKey: string | undefined,
): Promise<ProxyResult> {
  const path = pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  const key = apiKey && apiKey.trim() ? apiKey.trim() : undefined;
  return proxyOne(path, params, key);
}
