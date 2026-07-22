import { memo } from "react";
import Skeleton from "react-loading-skeleton";
import { useCoins } from "../api/queries.ts";
import { formatPercent, formatPrice } from "../lib/format.ts";
import type { Coin } from "../api/types.ts";

const Arrow = ({ direction }: { direction: "up" | "down" | "flat" }) =>
  direction === "flat" ? (
    <span className="text-muted">−</span>
  ) : (
    <span className={direction === "up" ? "text-up" : "text-down"}>
      {direction === "up" ? "▲" : "▼"}
    </span>
  );

const TickerItem = memo(function TickerItem({ coin }: { coin: Coin }) {
  const change = formatPercent(coin.priceChange1d);
  return (
    <span className="flex h-9 items-center gap-2 border-r hairline px-5">
      <img src={coin.icon} alt="" width={16} height={16} className="rounded-full" />
      <span className="font-mono text-xs font-medium text-body">{coin.symbol}</span>
      <span className="tabular text-xs text-muted">{formatPrice(coin.price)}</span>
      <span
        className={`tabular flex items-center gap-1 text-xs ${
          change.direction === "up"
            ? "text-up"
            : change.direction === "down"
              ? "text-down"
              : "text-muted"
        }`}
      >
        <Arrow direction={change.direction} />
        {change.text}
      </span>
    </span>
  );
});

// The marquee wrapper below never remounts on refetch: the query updates only
// swap the text/props inside the memoized items, so the CSS animation's
// progress is preserved across polls.
const TickerTrack = memo(function TickerTrack({ coins }: { coins: Coin[] }) {
  const duration = `${Math.max(30, coins.length * 4)}s`;
  return (
    <div
      className="marquee-track"
      style={{ "--marquee-duration": duration } as React.CSSProperties}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
          {coins.map((coin) => (
            <TickerItem key={coin.id} coin={coin} />
          ))}
        </div>
      ))}
    </div>
  );
});

export default function Ticker() {
  const { data } = useCoins();
  const coins = data?.slice(0, 20) ?? [];

  return (
    <div aria-hidden="true" className="marquee overflow-hidden border-b hairline bg-surface">
      {coins.length === 0 ? (
        <div className="flex h-9 items-center gap-8 px-5">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} width={150} height={14} />
          ))}
        </div>
      ) : (
        <TickerTrack coins={coins} />
      )}
    </div>
  );
}
