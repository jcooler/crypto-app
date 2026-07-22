import { useEffect, useState } from "react";

export default function LastUpdated({ updatedAt }: { updatedAt: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!updatedAt) return null;
  const seconds = Math.max(0, Math.round((Date.now() - updatedAt) / 1000));
  const text = seconds < 5 ? "just now" : seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;

  return (
    <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
      <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-up" />
      updated {text}
    </span>
  );
}
