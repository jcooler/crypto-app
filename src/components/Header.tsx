import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { isDemoData, onDemoDataChange } from "../api/client.ts";
import { useTheme } from "../theme/ThemeProvider.tsx";

const useDemoData = () =>
  useSyncExternalStore(onDemoDataChange, isDemoData, () => false);

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border hairline bg-surface-2 text-muted transition-colors hover:text-body"
    >
      {theme === "dark" ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  const demo = useDemoData();
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-app/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="font-mono text-[15px] font-semibold tracking-tight text-body"
        >
          quantumvista<span className="text-accent">_</span>
        </Link>
        <div className="flex items-center gap-3">
          {demo ? (
            <span
              className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent"
              title="No valid CoinStats API key is configured — showing generated demo data."
            >
              demo data
            </span>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
