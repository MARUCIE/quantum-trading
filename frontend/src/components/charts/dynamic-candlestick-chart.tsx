"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { CandlestickData, Time } from "lightweight-charts";

// Loading skeleton for chart
function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

// Dynamic import with SSR disabled (charts need browser APIs)
export const DynamicCandlestickChart = dynamic(
  () => import("./candlestick-chart").then((mod) => mod.CandlestickChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

// Re-export props type for convenience
export interface DynamicCandlestickChartProps {
  data: CandlestickData<Time>[];
  width?: number;
  height?: number;
  className?: string;
}
