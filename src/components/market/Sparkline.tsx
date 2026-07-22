import { memo } from "react";
import type { ChartPoint } from "../../api/types.ts";

/** 7-day inline sparkline. Purely decorative — the 7d % column carries the
 *  same trend for assistive tech, so this stays aria-hidden. */
const Sparkline = memo(function Sparkline({
  points,
  direction,
}: {
  points: ChartPoint[] | undefined;
  direction: "up" | "down" | "flat";
}) {
  if (!points || points.length < 2) {
    return <span className="block h-8 w-[100px]" aria-hidden="true" />;
  }
  const values = points.map((p) => p[1]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);
  const d = values
    .map((v, i) => `${(i * step).toFixed(2)},${(30 - ((v - min) / span) * 28 + 1).toFixed(2)}`)
    .join(" ");
  const stroke =
    direction === "up" ? "rgb(var(--up))" : direction === "down" ? "rgb(var(--down))" : "rgb(var(--muted))";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="block h-8 w-[100px]"
    >
      <polyline
        points={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export default Sparkline;
