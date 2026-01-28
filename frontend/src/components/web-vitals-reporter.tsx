"use client";

/**
 * Web Vitals Reporter
 *
 * Monitors and reports Core Web Vitals metrics.
 * In development, logs to console with color coding.
 * In production, can send to analytics service.
 */

import { useWebVitals, type WebVitalsMetric } from "@/lib/hooks/use-web-vitals";

interface WebVitalsReporterProps {
  /** Send to analytics endpoint */
  analyticsEndpoint?: string;
  /** Include debug logging */
  debug?: boolean;
}

export function WebVitalsReporter({
  analyticsEndpoint,
  debug = process.env.NODE_ENV === "development",
}: WebVitalsReporterProps) {
  useWebVitals(
    (metric: WebVitalsMetric) => {
      // Send to analytics in production
      if (analyticsEndpoint && process.env.NODE_ENV === "production") {
        // Use sendBeacon for reliability
        const body = JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          page: window.location.pathname,
          timestamp: Date.now(),
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(analyticsEndpoint, body);
        } else {
          fetch(analyticsEndpoint, {
            method: "POST",
            body,
            keepalive: true,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    },
    { logToConsole: debug }
  );

  // This component doesn't render anything
  return null;
}
