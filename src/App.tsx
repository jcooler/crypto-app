import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { queryClient } from "./api/queries.ts";
import Footer from "./components/Footer.tsx";
import Header from "./components/Header.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import { ThemeProvider } from "./theme/ThemeProvider.tsx";

const CoinDetail = lazy(() => import("./pages/CoinDetail.tsx"));

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="w-full flex-1">
            <Suspense fallback={<div className="py-24" aria-busy="true" />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/coin/:id" element={<CoinDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// SkeletonTheme reads CSS custom properties set per theme in index.css,
// so a single wrapper works for both light and dark.
export default function Root() {
  return (
    <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
      <App />
    </SkeletonTheme>
  );
}
