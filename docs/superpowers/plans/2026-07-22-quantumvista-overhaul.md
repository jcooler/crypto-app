# QuantumVista Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the QuantumVista crypto dashboard as a TypeScript, TanStack-Query-powered, accessible fintech product with a secure API proxy, per `docs/superpowers/specs/2026-07-22-quantumvista-overhaul-design.md`.

**Architecture:** Vite + React 18 SPA (kept) with strict TypeScript. All CoinStats traffic goes through `/api/*` — a Netlify Function in production, a small Vite middleware in dev — both injecting `COINSTATS_API_KEY` server-side and caching. One `coins` query feeds ticker + stats + table. Detail route and chart lib are lazy-loaded.

**Tech Stack:** TypeScript (strict), TanStack Query v5, @tanstack/react-virtual, Framer Motion, @number-flow/react, lightweight-charts, react-loading-skeleton, Tailwind 3, Vitest, Playwright (verification), axe.

## Global Constraints

- TypeScript `strict: true`; zero `any` in `src/` except vetted boundary casts.
- The CoinStats key must never appear in client bundle: env var `COINSTATS_API_KEY` (no `VITE_` prefix), read only in `netlify/functions/` and `vite.config.ts`.
- Allowlisted upstream endpoints only: `coins`, `coins/:id`, `coins/:id/charts`, `markets`, `news`.
- Poll intervals: coins 60s; news 10m; charts staleTime 5m; sparklines 1h.
- Color never sole carrier of meaning: every % change renders ▲/▼ (or −).
- `prefers-reduced-motion`: ticker frozen, Framer/NumberFlow/chart animations disabled.
- Dark = default theme; both themes AA contrast.
- Ticker is `aria-hidden="true"`; its animation wrapper must never remount on data refresh.
- Remove deps: axios, react-slick, slick-carousel, react-loading, react-responsive, fontawesome packages.
- Every data region: explicit loading (skeleton shaped like content) / empty / error (+retry) states.
- Commit after each task with a conventional message.

---

### Task 1: TypeScript toolchain + project skeleton

**Files:**
- Create: `tsconfig.json`, `tsconfig.node.json`, `src/vite-env.d.ts`, `netlify.toml`, `vitest.config.ts`
- Modify: `package.json` (deps + scripts), `vite.config.js` → `vite.config.ts`, `index.html` (script src)
- Rename: `src/main.jsx` → `src/main.tsx`; delete `src/pages/Home.jsx` (orphan)
- Delete later tasks replace remaining `.jsx` files; for now they stay untouched but unimported.

**Interfaces:**
- Produces: `npm run typecheck` (tsc --noEmit), `npm run test` (vitest run), `npm run build` all green; `src/main.tsx` rendering a placeholder `<App />` from a new minimal `src/App.tsx`.

- [ ] **Step 1:** `npm uninstall axios react-slick slick-carousel react-loading react-responsive @fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome react-icons`
- [ ] **Step 2:** `npm install @tanstack/react-query @tanstack/react-virtual framer-motion @number-flow/react lightweight-charts @fontsource-variable/inter` and `npm install -D typescript vitest @types/node`
- [ ] **Step 3:** Write `tsconfig.json` (strict, bundler moduleResolution, react-jsx, include src + netlify + vite.config.ts) and `tsconfig.node.json`.
- [ ] **Step 4:** Rename entry files; minimal `App.tsx` returns `<div>QuantumVista</div>`; update `index.html` to `/src/main.tsx`. Keep react-loading-skeleton + react-router-dom.
- [ ] **Step 5:** `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

(API routing uses Functions 2.0 `config.path`, so no `/api` redirect needed.)
- [ ] **Step 6:** Scripts: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, lint script switched to typecheck (eslint config is JS-era; typecheck is the gate).
- [ ] **Step 7:** Run `npm run typecheck && npm run build` — expect green. Commit `chore: migrate toolchain to TypeScript`.

### Task 2: API proxy + shape probe

**Files:**
- Create: `netlify/functions/coinstats.mts`, `scripts/probe-api.mjs`
- Modify: `vite.config.ts` (dev proxy middleware), `.env` (rename var), `.gitignore` (ensure .env ignored)
- Delete: `netlify/functions/api.js` (stub)

**Interfaces:**
- Produces: HTTP GET `/api/coins?limit=100&currency=USD`, `/api/coins/:id`, `/api/coins/:id/charts?period=1w`, `/api/markets`, `/api/news?limit=12` — same JSON as CoinStats, key injected server-side, per-endpoint TTL cache, `Netlify-CDN-Cache-Control` with `stale-while-revalidate`, structured `{ error: string }` on failure, 429 passthrough.

- [ ] **Step 1:** `scripts/probe-api.mjs` — node script hitting each upstream endpoint with the `.env` key, printing JSON shapes (top-level keys, first array item). Run it; record actual field names (esp. sparkline availability in `/coins`, `/markets` shape, chart tuple shape, news `imgUrl` casing) into `src/api/types.ts` groundwork notes.
- [ ] **Step 2:** Netlify function (Functions 2.0 style):

```ts
// netlify/functions/coinstats.mts
import type { Config } from "@netlify/functions";

const UPSTREAM = "https://openapiv1.coinstats.app";
const ALLOW: { pattern: RegExp; ttl: number }[] = [
  { pattern: /^coins$/, ttl: 30 },
  { pattern: /^coins\/[\w-]+$/, ttl: 60 },
  { pattern: /^coins\/[\w-]+\/charts$/, ttl: 300 },
  { pattern: /^markets$/, ttl: 300 },
  { pattern: /^news$/, ttl: 600 },
];
const cache = new Map<string, { expires: number; body: string; status: number }>();

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\//, "");
  const rule = ALLOW.find((r) => r.pattern.test(path));
  if (!rule) return Response.json({ error: "Not found" }, { status: 404 });
  const key = `${path}?${url.searchParams}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now())
    return new Response(hit.body, { status: hit.status, headers: jsonHeaders(rule.ttl) });
  const upstream = await fetch(`${UPSTREAM}/${path}?${url.searchParams}`, {
    headers: { accept: "application/json", "X-API-KEY": process.env.COINSTATS_API_KEY ?? "" },
  });
  const body = await upstream.text();
  if (upstream.ok) cache.set(key, { expires: Date.now() + rule.ttl * 1000, body, status: 200 });
  return new Response(body, { status: upstream.status, headers: jsonHeaders(rule.ttl) });
};

const jsonHeaders = (ttl: number) => ({
  "content-type": "application/json",
  "netlify-cdn-cache-control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}`,
});

export const config: Config = { path: "/api/*" };
```

(Install `@netlify/functions` as devDep for the `Config` type.)
- [ ] **Step 3:** Vite dev middleware in `vite.config.ts`: plugin `configureServer` handling `/api/*` with the same allowlist + key from `loadEnv(mode, cwd, "")` reading `COINSTATS_API_KEY`, simple in-memory TTL cache. Rename `.env` var `VITE_API_KEY` → `COINSTATS_API_KEY`.
- [ ] **Step 4:** Start `npm run dev`; `curl localhost:5173/api/coins?limit=3` and `/api/news?limit=2` — expect real JSON, no key in response/bundle. Commit `feat: secure CoinStats proxy with caching`.

### Task 3: Types, client, query hooks, formatters (TDD)

**Files:**
- Create: `src/api/types.ts`, `src/api/client.ts`, `src/api/queries.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/useDebouncedValue.ts`

**Interfaces:**
- Produces:
  - Types: `Coin` (id, icon, name, symbol, rank, price, priceChange1h, priceChange1d, priceChange7d, marketCap, volume, availableSupply, totalSupply, websiteUrl?...), `NewsItem`, `GlobalMarkets`, `ChartPoint = [number, number, ...]` — corrected to probe results.
  - `apiGet<T>(path: string, params?: Record<string,string>): Promise<T>` — fetch wrapper; throws `ApiError { status }`.
  - Hooks: `useCoins(): UseQueryResult<Coin[]>` (60s refetchInterval, staleTime 30s, keepPreviousData); `useMarkets()`; `useNews()`; `useCoin(id)`; `useCoinChart(id, period)`; `useSparklines(chunkIndex)` → `Record<coinId, number[]>` derived from per-coin chart calls batched per rank-chunk of 10, staleTime 1h — exact mechanism finalized after probe (if `/coins` already carries sparkline data, use it and delete this hook).
  - `formatCurrency(n, {compact}) `, `formatNumber`, `formatPercent(n)` → `{ text, direction: "up"|"down"|"flat" }`, `relativeTime(ts): string` ("2h ago"), `formatPrice(n)` (≥1 → 2dp, <1 → 4 significant).
  - `queryClient` default: retry 3 w/ exponential backoff, no retry on 4xx except 429.
- [ ] **Step 1:** Write `format.test.ts` with concrete expectations (e.g. `formatCurrency(1.23e12)` → `"$1.23T"`, `formatPrice(0.00004231)` → `"$0.00004231"`, `relativeTime(now-7200e3)` → `"2h ago"`, `formatPercent(-3.2).direction` → `"down"`). Run: expect FAIL.
- [ ] **Step 2:** Implement `format.ts` with `Intl.NumberFormat`; run tests → PASS.
- [ ] **Step 3:** Implement types/client/queries per probe results; typecheck green. Commit `feat: typed data layer with TanStack Query`.

### Task 4: Design foundation — tokens, theme, shell

**Files:**
- Create: `src/styles/index.css` (replaces `src/App.css` usage), `src/theme/ThemeProvider.tsx`, `src/theme/theme-script.ts` (inlined in index.html), `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ui/states.tsx` (ErrorState/EmptyState), `src/App.tsx` (router + providers + layout)
- Modify: `tailwind.config.js` (tokens), `index.html` (no-flash script, fonts), delete `src/App.css`, old `Header.jsx`, `Footer.jsx`

**Interfaces:**
- Produces: CSS custom properties per theme (`--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--accent`, `--up`, `--down`) consumed via Tailwind color aliases (e.g. `bg-surface`, `text-muted`); `useTheme(): { theme: "dark"|"light", toggle(): void }`; skeleton base/highlight wired to vars via `SkeletonTheme`.
- Dark default, localStorage `qv-theme`, `prefers-color-scheme` respected, inline script in `<head>` sets class before paint.
- Focus-visible ring utility applied globally (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`).
- [ ] Build, verify shell renders in both themes with toggle; typecheck; commit `feat: theme system and app shell`.

### Task 5: Ticker

**Files:**
- Create: `src/components/Ticker.tsx`, marquee keyframes in `src/styles/index.css`

**Interfaces:**
- Consumes `useCoins()` (top ~20 by rank).
- Produces `<Ticker />`: `aria-hidden="true"` strip under header; duplicated list; CSS `@keyframes marquee { to { transform: translateX(-50%) } }` on an inner flex track; `:hover` and reduced-motion → `animation-play-state: paused`; memoized item row so refetch only swaps text; loading → skeleton strip; error → hidden (non-essential region).
- [ ] Verify: scroll continuous across a manual refetch (React Query devtools or 60s wait); no jump. Commit `feat: seamless CSS marquee ticker`.

### Task 6: Global stats bar

**Files:**
- Create: `src/components/StatsBar.tsx`, `src/components/LastUpdated.tsx`

**Interfaces:**
- Consumes `useMarkets()` (fallback: derive from `useCoins()` if markets probe failed), `dataUpdatedAt` from query.
- Produces stat tiles: Market Cap, 24h Volume, BTC Dominance — `<NumberFlow>` values, compact currency, 24h change chip with ▲/▼; `LastUpdated` shows "Updated 12s ago" + pulsing dot (`motion-safe` only), ticking via 1s interval.
- [ ] Skeleton tiles; commit `feat: global stats bar`.

### Task 7: Market table

**Files:**
- Create: `src/components/market/MarketTable.tsx`, `CoinRow.tsx`, `SortHeader.tsx`, `Sparkline.tsx`, `CoinCard.tsx` (mobile), `TableSkeleton.tsx`, `src/lib/useSort.ts`
- Delete: `src/components/CoinTable.jsx`, `Coin.jsx`

**Interfaces:**
- Consumes `useCoins()`, `useSparklines(chunk)`, `useDebouncedValue(search, 250)`, router `Link`/`navigate`, `queryClient.prefetchQuery` for coin detail on row hover/focus.
- Produces `<MarketTable search={string} />`: real `<table>` with `<caption class="sr-only">`, scoped `<th scope="col">`; sort buttons inside `<th>` with `aria-sort`; columns rank/coin/price/1h/24h/7d/mcap/volume/spark; NumberFlow prices; ▲/▼ change cells; virtualized `<tbody>` rows via @tanstack/react-virtual (only when >30 rows); rows are keyboard-focusable links to `/coin/:id`; `<md` breakpoint renders card list instead (same data, real list semantics); memoized sort/filter; skeleton rows on load; empty state ("No coins match"); error state with retry.
- `Sparkline`: 7d points → inline `<svg>` polyline, stroke = up/down color, `aria-hidden` (trend duplicated by 7d % cell), no animation.
- [ ] Verify sorting each column both directions, search, keyboard nav, virtual scroll. Commit `feat: market table`.

### Task 8: News

**Files:**
- Create: `src/components/news/NewsSection.tsx`, `NewsCard.tsx`, `NewsSkeleton.tsx`
- Delete: `src/components/CryptoNews.jsx`, old `NewsCard.jsx`, `CryptoCarousel.jsx`

**Interfaces:**
- Consumes `useNews()`, `relativeTime`.
- Produces responsive card grid (1/2/3 cols): thumbnail `<img loading="lazy" width height>` with fallback panel on error, source badge, relative timestamp, title (line-clamped), whole-card link with focus ring; loading/empty/error states.
- [ ] Commit `feat: news section`.

### Task 9: Coin detail route

**Files:**
- Create: `src/pages/CoinDetail.tsx` (lazy via `React.lazy`), `src/components/chart/PriceChart.tsx` (dynamic `import("lightweight-charts")`), `src/components/chart/RangeTabs.tsx`, `src/pages/Dashboard.tsx` (extract from App)
- Modify: `src/App.tsx` (routes: `/`, `/coin/:id`, fallback)

**Interfaces:**
- Consumes `useCoin(id)`, `useCoinChart(id, period)`.
- Produces detail page: back link, icon+name+symbol, NumberFlow price, 24h chip, range tabs (radiogroup semantics, keyboard operable), lightweight-charts area series themed from CSS vars (re-created on theme change), stat grid (mcap, volume, rank, supplies), loading skeleton mirroring layout, error + retry, document.title set per coin.
- [ ] Verify chart bundle is a separate chunk (`npm run build` output). Commit `feat: coin detail with lightweight-charts`.

### Task 10: Meta, icons, a11y sweep

**Files:**
- Create: `public/favicon.svg`, `public/og.png` (rendered via Playwright from a scratch HTML), `public/apple-touch-icon.png`
- Modify: `index.html` (title, description, OG/Twitter tags, favicon links, `theme-color` both schemes)

**Interfaces:**
- Produces: complete head metadata; heading-order audit (one `h1` per page); landmark audit (`header`, `main`, `footer`, `nav`); all controls labeled; skip-to-content link.
- [ ] Commit `feat: metadata, icons, a11y polish`.

### Task 11: Verification loop

- [ ] `npm run build && npm run preview` (serves dist + needs API: run functions dev or preview through `netlify dev`; fallback: reuse vite dev middleware in preview via small node static server — decide in-task).
- [ ] Playwright: screenshots desktop (1440×900) + mobile (390×844) × dark + light × sections (header/ticker/stats, table, news, detail). Critique real-product feel; iterate on findings (spacing, hierarchy, density, contrast). Repeat until satisfied.
- [ ] axe (via playwright + `@axe-core/playwright` or CDN inject) on `/` and `/coin/bitcoin` in both themes; fix all violations; re-run to zero (or documented false positives).
- [ ] Lighthouse (`npx lighthouse` against preview, desktop + mobile) — record LCP/CLS; fix regressions (target near-zero CLS).
- [ ] Commit fixes `polish: verification pass`.

### Task 12: Deliverables

- [ ] Before screenshots: `git stash`-free approach — capture "before" from a temporary checkout of pre-overhaul commit served locally, or reuse earlier capture taken before Task 4 (capture BEFORE starting Task 4 — note: do it during Task 1 while old app still runs).
- [ ] Final summary with before/after image pairs (SendUserFile), key-rotation + Netlify env instructions, budget math, remaining suggestions.

**Note:** Capture "before" screenshots during Task 1 (old app still functional with its client-side key) — dark only (no light mode exists before).

## Self-Review

- Spec coverage: proxy+cache (T2), data layer/SWR (T3), theme (T4), ticker fix (T5), stats bar (T6), table+sparklines+virtualization+prefetch (T7), news (T8), detail+charts lazy (T9), meta/OG/a11y (T10), screenshots/axe/Lighthouse/iteration (T11), before/after (T12). Key rotation flagged (T2/T12). ✔
- Sparkline mechanism intentionally contingent on Step 2 probe (documented, not a placeholder). ✔
- Type names consistent across tasks (`Coin`, `NewsItem`, `GlobalMarkets`, hook names). ✔
