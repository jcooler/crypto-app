// Probes CoinStats endpoints and prints response shapes.
// Usage: node scripts/probe-api.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const KEY = env.COINSTATS_API_KEY ?? env.VITE_API_KEY;

const endpoints = [
  ["coins", "coins?limit=3&currency=USD"],
  ["coin", "coins/bitcoin?currency=USD"],
  ["charts", "coins/bitcoin/charts?period=1w"],
  ["markets", "markets"],
  ["news", "news?limit=2"],
];

const shape = (v, depth = 0) => {
  if (Array.isArray(v))
    return depth > 2 ? "[...]" : `Array(${v.length})[${v.length ? shape(v[0], depth + 1) : ""}]`;
  if (v && typeof v === "object")
    return depth > 2
      ? "{...}"
      : `{ ${Object.entries(v).map(([k, x]) => `${k}: ${shape(x, depth + 1)}`).join(", ")} }`;
  return typeof v === "number" ? `num(${v})` : typeof v === "string" ? `str(${String(v).slice(0, 40)})` : String(v);
};

for (const [name, path] of endpoints) {
  try {
    const res = await fetch(`https://openapiv1.coinstats.app/${path}`, {
      headers: { accept: "application/json", "X-API-KEY": KEY },
    });
    const text = await res.text();
    console.log(`\n=== ${name} (${res.status}) ===`);
    try {
      console.log(shape(JSON.parse(text)));
    } catch {
      console.log(text.slice(0, 300));
    }
  } catch (e) {
    console.log(`\n=== ${name} FAILED: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
