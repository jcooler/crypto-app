export default function Footer() {
  return (
    <footer className="mt-16 border-t hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <p className="font-mono text-xs text-muted">
          quantumvista<span className="text-accent">_</span> · market data by{" "}
          <a
            href="https://coinstats.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-muted/40 underline-offset-2 hover:text-body"
          >
            CoinStats
          </a>
        </p>
        <p className="text-xs text-muted">
          Prices refresh automatically. Not investment advice.
        </p>
      </div>
    </footer>
  );
}
