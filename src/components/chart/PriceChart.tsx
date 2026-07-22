import { useEffect, useRef } from "react";
import type { ChartPoint } from "../../api/types.ts";
import { useTheme } from "../../theme/ThemeProvider.tsx";

/** TradingView lightweight-charts area chart, themed from the CSS tokens.
 *  The library itself is only loaded when this component mounts (the whole
 *  detail route is lazy), keeping it out of the dashboard bundle. */
export default function PriceChart({
  points,
  direction,
}: {
  points: ChartPoint[];
  direction: "up" | "down" | "flat";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || points.length === 0) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import("lightweight-charts").then(({ createChart, AreaSeries, ColorType }) => {
      if (disposed || !containerRef.current) return;
      const css = getComputedStyle(document.documentElement);
      const rgb = (name: string) => `rgb(${css.getPropertyValue(name).trim().split(" ").join(",")})`;
      const rgba = (name: string, a: number) =>
        `rgba(${css.getPropertyValue(name).trim().split(" ").join(",")},${a})`;
      const lineVar = direction === "down" ? "--down" : direction === "up" ? "--up" : "--muted";

      const chart = createChart(el, {
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: rgb("--muted"),
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          attributionLogo: false,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: rgba("--border", Number(css.getPropertyValue("--border-alpha")) * 0.7) },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
        crosshair: {
          horzLine: { labelBackgroundColor: rgb("--accent") },
          vertLine: { labelBackgroundColor: rgb("--accent") },
        },
        handleScroll: false,
        handleScale: false,
      });
      const series = chart.addSeries(AreaSeries, {
        lineColor: rgb(lineVar),
        topColor: rgba(lineVar, 0.25),
        bottomColor: rgba(lineVar, 0.0),
        lineWidth: 2,
        priceLineVisible: false,
      });
      series.setData(
        points.map(([time, value]) => ({ time: time as import("lightweight-charts").UTCTimestamp, value })),
      );
      chart.timeScale().fitContent();
      cleanup = () => chart.remove();
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [points, direction, theme]);

  return <div ref={containerRef} className="h-72 w-full sm:h-96" aria-hidden="true" />;
}
