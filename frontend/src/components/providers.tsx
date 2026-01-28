"use client";

/**
 * App Providers
 *
 * Wraps the application with necessary context providers.
 * Includes performance monitoring in development.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "./ui/tooltip";
import { ToastProvider } from "./ui/toast";
import { WebVitalsReporter } from "./web-vitals-reporter";
import { AssetClassProvider } from "@/lib/assets";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global defaults for all queries
            staleTime: 5000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AssetClassProvider>
              {children}
              {/* Performance monitoring - logs Web Vitals in dev, can send to analytics in prod */}
              <WebVitalsReporter
                debug={process.env.NODE_ENV === "development"}
                // analyticsEndpoint="/api/analytics/vitals" // Uncomment when analytics is set up
              />
            </AssetClassProvider>
          </ToastProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
