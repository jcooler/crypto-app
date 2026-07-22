import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import StatsBar from "../components/StatsBar.tsx";
import Ticker from "../components/Ticker.tsx";
import MarketTable from "../components/market/MarketTable.tsx";
import NewsSection from "../components/news/NewsSection.tsx";

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <>
      <h1 className="sr-only">QuantumVista — live crypto market dashboard</h1>
      <Ticker />
      <div className="border-b hairline bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <StatsBar />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <Reveal>
          <MarketTable />
        </Reveal>
        <Reveal delay={0.12}>
          <NewsSection />
        </Reveal>
      </div>
    </>
  );
}
