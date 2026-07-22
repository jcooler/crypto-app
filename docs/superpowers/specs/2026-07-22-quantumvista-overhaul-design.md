# QuantumVista Overhaul — Design Spec

Date: 2026-07-22
Status: Approved by Jon (run-to-completion)

## Goal

Modernize the existing React SPA crypto dashboard into a sleek, accessible,
fintech-grade product. Visual + UX + data-presentation overhaul. Keep the
existing Vite + React + Tailwind + Netlify setup. No auth, no own backend;
CoinStats API only, proxied through a Netlify Function.

## Decisions (interviewed)

- Strip marketing chrome (hero, email capture, Log In / Create Account) — pure dashboard.
- Keep the **QuantumVista** brand; refine the wordmark typography.
- Accent: **electric indigo/violet** (single restrained accent).
- Coin detail: **dedicated route `/coin/:id`** (lazy-loaded).

## Stack

- **TypeScript strict** throughout; migrate all `.jsx` → `.tsx`. All CoinStats
  responses fully typed in `src/api/types.ts`.
- **TanStack Query** for all data: dedupe, cache, background refetch,
  stale-while-revalidate, retry with exponential backoff on 429/5xx.
- **react-loading-skeleton** for all loading states (theme-aware via CSS vars).
- **Framer Motion** for layout/section transitions; **@number-flow/react** for
  animated price/number changes.
- **lightweight-charts** (TradingView) for the detail chart, lazy-loaded.
- **@tanstack/react-virtual** for the market table.
- Remove: react-slick, slick-carousel, react-loading, axios, react-responsive,
  fontawesome (unused/replaced).

## API layer

- Netlify Function `netlify/functions/coinstats.ts` at `/api/*`:
  - Injects `COINSTATS_API_KEY` (server-side env var, **not** `VITE_`-prefixed).
  - Allowlists endpoints: `coins`, `coins/:id`, `coins/:id/charts`, `news`.
  - In-memory response cache per endpoint+query with per-endpoint TTLs
    (coins 30s, charts 5m, news 10m) + `Cache-Control` / `stale-while-revalidate`
    response headers so Netlify's CDN absorbs repeat traffic.
  - Returns structured JSON errors; passes 429 through so the client backs off.
- `netlify.toml`: function config, `/api/*` redirect, SPA fallback redirect.
- **The current key is compromised** (shipped in deployed bundles). Jon must
  rotate it in the CoinStats dashboard and set `COINSTATS_API_KEY` in Netlify
  env vars. Local dev uses `netlify dev` (or Vite proxy fallback) with `.env`.

### Budget math (free tier: 20k credits/mo, 2 req/s)

One `coins` call (with sparkline data) feeds ticker + stats bar + table.
Polling at 60s while a tab is open, plus function cache + CDN caching, keeps a
typical month well under 20k credits. News refetches at 10m. Chart data is
fetched per detail visit, cached 5m.

## Data layer (`src/api/`)

- `useCoins()` — top 100 coins, single source for ticker + table + stats bar,
  `refetchInterval` 60s, `staleTime` 30s, `placeholderData: keepPreviousData`.
- `useGlobalStats()` — derived from the same coins payload where possible
  (market cap / volume sums, BTC dominance) to avoid extra credits.
- `useCoinDetail(id)`, `useCoinChart(id, range)` — detail route only.
- `useNews()` — news list, `staleTime` 10m.

## Pages & components

### `/` Dashboard
1. **Header** (sticky): wordmark, search input, theme toggle. Landmark `<header>`/`<nav>`.
2. **Ticker**: CSS transform marquee, list duplicated for gapless loop,
   pause on hover, `aria-hidden="true"`, frozen (static list) under
   `prefers-reduced-motion`. Animation lives on a wrapper that never remounts;
   data updates only change text content. Fed from `useCoins()` (no extra call).
3. **Global stats bar**: total market cap, 24h volume, BTC dominance,
   "last updated Xs ago" with subtle live pulse. NumberFlow on values.
4. **Market table**: rank, coin (icon+name+symbol), price, 1h %, 24h %, 7d %,
   market cap, volume, 7-day inline SVG sparkline. Real `<table>` semantics,
   scoped `<th>`, sortable headers (buttons with `aria-sort`), debounced search,
   virtualized rows, row hover prefetches coin detail, whole row clickable +
   keyboard focusable link. Degrades to card list < `md`.
5. **News**: card grid — thumbnail (lazy, fixed dimensions), source, relative
   time ("2h ago"), title, external link. Explicit loading/empty/error states.
6. **Footer**: minimal.

### `/coin/:id` (lazy route)
- Header row: icon, name/symbol, NumberFlow price, 24h change chip.
- lightweight-charts area chart with range tabs (24h / 7d / 1m / 3m / 1y / all).
- Stat grid: market cap, volume, rank, supply, ATH-ish fields available from API.
- Back link; loading skeleton shaped like the layout; error state with retry.

## Design language

- Dark default: near-black base `~#0a0a0c`, layered elevated surfaces,
  hairline separators (`1px`, low-alpha white). Light mode: warm-white
  layered surfaces, same structure, AA verified.
- One accent (indigo `#6366f1` family) for brand + interactive only.
- Market movement: green/red **plus** ▲/▼ glyphs — never color alone.
- `font-variant-numeric: tabular-nums` on all figures; Inter (self-hosted or
  system fallback stack) for UI.
- Numbers: `Intl.NumberFormat` with compact notation ($1.2T, $890B),
  consistent precision rules (price ≥1 → 2dp; <1 → significant digits).
- Theme: `class="dark"` on `<html>`, localStorage persistence,
  `prefers-color-scheme` default, inline no-flash script, toggle in header.

## Accessibility (WCAG 2.2 AA)

- AA contrast verified in both palettes (checked programmatically).
- Full keyboard nav; visible high-contrast focus rings on all interactive
  elements. Correct landmarks and heading order. Labeled inputs.
- Ticker `aria-hidden`; same data lives in the accessible table.
- `prefers-reduced-motion` disables/freezes: ticker, Framer transitions,
  NumberFlow (respects it natively), chart animations.
- axe pass in both themes with violations fixed.

## Performance

- Code-split: detail route + lightweight-charts lazy.
- Virtualized table; debounced search; memoized sort/filter.
- Lazy news images with explicit width/height (zero CLS).
- Prefetch coin detail query on row hover/focus.
- Production build + Lighthouse check; target fast LCP, near-zero CLS.

## Polish

- Row hover states, micro-interactions, live-pulse "last updated".
- Favicon (proper multi-size), meta/OG tags, OG image.
- Fully responsive, mobile-first.

## Verification

- Playwright screenshots: desktop + mobile × light + dark × each section.
- Self-critique loop for real-product feel; iterate.
- axe automated pass in both themes; fix violations.
- Deliver before/after screenshots.

## Error handling

- Query-level: retry ×3 exponential backoff (skip retry on 4xx except 429).
- Region-level: every data region renders explicit loading (skeleton) /
  empty / error (message + retry button) states; stale data stays visible
  during background refetch failures with a subtle "data may be stale" note.
