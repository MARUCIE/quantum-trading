"use client";

/**
 * Web Vitals Hook
 *
 * Monitors Core Web Vitals in development and reports to analytics in production.
 * Helps identify performance issues early.
 */

import { useEffect, useCallback } from "react";

export interface WebVitalsMetric {
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

// Thresholds based on Google's Web Vitals guidelines
// Note: FID deprecated in 2024, replaced by INP
const thresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(
  name: WebVitalsMetric["name"],
  value: number
): WebVitalsMetric["rating"] {
  const threshold = thresholds[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

export type WebVitalsReportCallback = (metric: WebVitalsMetric) => void;

/**
 * Hook to monitor Web Vitals
 *
 * @param onReport - Callback called with each metric
 * @param options - Configuration options
 */
export function useWebVitals(
  onReport?: WebVitalsReportCallback,
  options: {
    /** Log to console in development */
    logToConsole?: boolean;
    /** Only report metrics below "good" threshold */
    onlyReportPoor?: boolean;
  } = {}
) {
  const { logToConsole = process.env.NODE_ENV === "development", onlyReportPoor = false } =
    options;

  const reportMetric = useCallback(
    (metric: Omit<WebVitalsMetric, "rating">) => {
      const rating = getRating(metric.name, metric.value);
      const fullMetric: WebVitalsMetric = { ...metric, rating };

      // Skip good metrics if onlyReportPoor is true
      if (onlyReportPoor && rating === "good") return;

      // Log to console in development
      if (logToConsole) {
        const color =
          rating === "good"
            ? "color: green"
            : rating === "needs-improvement"
            ? "color: orange"
            : "color: red";
        console.log(
          `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
          color
        );
      }

      // Call external reporter
      onReport?.(fullMetric);
    },
    [onReport, logToConsole, onlyReportPoor]
  );

  useEffect(() => {
    // Dynamically import web-vitals to avoid bundle size impact
    // Note: FID is deprecated in web-vitals v4, replaced by INP
    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(reportMetric);
      onFCP(reportMetric);
      onINP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
    });
  }, [reportMetric]);
}

/**
 * Simple performance measurement utility
 */
export function measurePerformance(label: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === "development") {
        console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    },
  };
}

/**
 * Debounced callback for performance-sensitive operations
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}
