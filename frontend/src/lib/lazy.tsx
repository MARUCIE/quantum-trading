"use client";

/**
 * Lazy Loading Utilities
 *
 * Dynamic imports with loading states for heavy components.
 * Reduces initial bundle size and improves LCP.
 */

import dynamic from "next/dynamic";

// Loading fallback component
export function LoadingFallback({
  height = "400px",
  message = "Loading...",
}: {
  height?: string;
  message?: string;
}) {
  return (
    <div
      className="flex items-center justify-center bg-muted/50 rounded-lg animate-pulse"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

// Error fallback component
export function ErrorFallback({
  height = "400px",
  error,
  retry,
}: {
  height?: string;
  error?: Error;
  retry?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-center p-4">
        <span className="text-sm text-destructive">Failed to load component</span>
        {error && (
          <span className="text-xs text-muted-foreground">{error.message}</span>
        )}
        {retry && (
          <button
            onClick={retry}
            className="text-sm text-primary underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Lazy-loaded Positions Table
 * Data-heavy component with complex rendering
 */
export const LazyPositionsTable = dynamic(
  () => import("@/components/dashboard/positions-table").then((mod) => mod.PositionsTable),
  {
    loading: () => <LoadingFallback height="300px" message="Loading positions..." />,
    ssr: true,
  }
);

/**
 * Lazy-loaded Recent Trades
 */
export const LazyRecentTrades = dynamic(
  () => import("@/components/dashboard/recent-trades").then((mod) => mod.RecentTrades),
  {
    loading: () => <LoadingFallback height="300px" message="Loading trades..." />,
    ssr: true,
  }
);

/**
 * Lazy-loaded Stats Card
 */
export const LazyStatsCard = dynamic(
  () => import("@/components/dashboard/stats-card").then((mod) => mod.StatsCard),
  {
    loading: () => <LoadingFallback height="100px" message="Loading stats..." />,
    ssr: true,
  }
);
