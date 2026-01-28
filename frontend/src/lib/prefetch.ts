/**
 * Prefetch Utilities
 *
 * Route-based prefetching for better perceived performance.
 * Prefetches data and code before navigation.
 */

import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

/**
 * Prefetch data for a route
 * Call this on hover/focus of navigation links
 */
export function prefetchRouteData(
  queryClient: QueryClient,
  route: string
): void {
  // Map routes to their data requirements
  const prefetchMap: Record<string, () => void> = {
    "/": () => {
      // Dashboard data
      queryClient.prefetchQuery({
        queryKey: ["portfolio", "stats"],
        queryFn: () => apiClient.get("/api/portfolio/stats"),
        staleTime: 30000,
      });
      queryClient.prefetchQuery({
        queryKey: ["portfolio", "positions"],
        queryFn: () => apiClient.get("/api/portfolio/positions"),
        staleTime: 10000,
      });
    },
    "/strategies": () => {
      queryClient.prefetchQuery({
        queryKey: ["strategies"],
        queryFn: () => apiClient.get("/api/strategies"),
        staleTime: 60000,
      });
    },
    "/trading": () => {
      queryClient.prefetchQuery({
        queryKey: ["market", "ticker", "BTCUSDT"],
        queryFn: () => apiClient.get("/api/market/ticker?symbol=BTCUSDT"),
        staleTime: 5000,
      });
    },
    "/risk": () => {
      queryClient.prefetchQuery({
        queryKey: ["risk", "metrics"],
        queryFn: () => apiClient.get("/api/risk/metrics"),
        staleTime: 30000,
      });
      queryClient.prefetchQuery({
        queryKey: ["risk", "limits"],
        queryFn: () => apiClient.get("/api/risk/limits"),
        staleTime: 30000,
      });
    },
    "/backtest": () => {
      queryClient.prefetchQuery({
        queryKey: ["backtest", "strategies"],
        queryFn: () => apiClient.get("/api/backtest/strategies"),
        staleTime: 60000,
      });
    },
  };

  const prefetchFn = prefetchMap[route];
  if (prefetchFn) {
    prefetchFn();
  }
}

/**
 * Create an Intersection Observer for prefetching
 * Prefetches route data when link becomes visible
 */
export function createPrefetchObserver(
  queryClient: QueryClient
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const href = entry.target.getAttribute("href");
          if (href) {
            prefetchRouteData(queryClient, href);
          }
        }
      });
    },
    {
      rootMargin: "200px", // Start prefetching before link is visible
    }
  );
}

/**
 * Preload critical resources
 * Call on app initialization
 */
export function preloadCriticalResources(): void {
  // No-op: fonts are handled by next/font and do not require manual preloading
}

/**
 * Prefetch critical API endpoints on idle
 */
export function prefetchOnIdle(queryClient: QueryClient): void {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      // Prefetch common data during idle time
      prefetchRouteData(queryClient, "/");
    });
  }
}
