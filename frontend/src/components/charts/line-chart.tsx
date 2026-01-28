"use client";

/**
 * Line Chart Component
 *
 * Responsive line chart for time series data like portfolio performance,
 * equity curves, and price trends.
 */

import { useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

export interface LineDataPoint {
  timestamp: string | number;
  [key: string]: string | number;
}

export interface LineSeries {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dot?: boolean;
  dashed?: boolean;
}

interface LineChartProps {
  data: LineDataPoint[];
  series: LineSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  referenceLines?: { y: number; label: string; color: string }[];
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  className?: string;
}

export function LineChart({
  data,
  series,
  xAxisKey = "timestamp",
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  referenceLines = [],
  formatXAxis,
  formatYAxis,
  formatTooltip,
  className,
}: LineChartProps) {
  const defaultFormatXAxis = useMemo(() => {
    return (value: string | number) => {
      if (typeof value === "number") {
        return new Date(value).toLocaleDateString();
      }
      return String(value);
    };
  }, []);

  const defaultFormatYAxis = useMemo(() => {
    return (value: number) => {
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(2);
    };
  }, []);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis || defaultFormatXAxis}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={formatYAxis || defaultFormatYAxis}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value) =>
                typeof value === "number"
                  ? formatTooltip
                    ? formatTooltip(value)
                    : value.toLocaleString()
                  : String(value)
              }
            />
          )}
          {showLegend && <Legend />}
          {referenceLines.map((ref, index) => (
            <ReferenceLine
              key={index}
              y={ref.y}
              label={ref.label}
              stroke={ref.color}
              strokeDasharray="5 5"
            />
          ))}
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              dot={s.dot ?? false}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset: Equity Curve
interface EquityCurveProps {
  data: { timestamp: number; equity: number; benchmark?: number }[];
  height?: number;
  showBenchmark?: boolean;
  className?: string;
}

export function EquityCurve({
  data,
  height = 300,
  showBenchmark = true,
  className,
}: EquityCurveProps) {
  const series: LineSeries[] = [
    { dataKey: "equity", name: "Portfolio", color: "hsl(var(--primary))" },
  ];

  if (showBenchmark && data.some((d) => d.benchmark !== undefined)) {
    series.push({
      dataKey: "benchmark",
      name: "Benchmark",
      color: "hsl(var(--muted-foreground))",
      dashed: true,
    });
  }

  return (
    <LineChart
      data={data}
      series={series}
      height={height}
      formatYAxis={(v) => `$${(v / 1000).toFixed(0)}K`}
      formatTooltip={(v) => `$${v.toLocaleString()}`}
      className={className}
    />
  );
}

// Preset: Performance Comparison
interface PerformanceComparisonProps {
  data: { timestamp: number; [key: string]: number }[];
  strategies: { key: string; name: string; color: string }[];
  height?: number;
  className?: string;
}

export function PerformanceComparison({
  data,
  strategies,
  height = 300,
  className,
}: PerformanceComparisonProps) {
  const series: LineSeries[] = strategies.map((s) => ({
    dataKey: s.key,
    name: s.name,
    color: s.color,
  }));

  return (
    <LineChart
      data={data}
      series={series}
      height={height}
      referenceLines={[{ y: 0, label: "Break-even", color: "hsl(var(--muted-foreground))" }]}
      formatYAxis={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
      formatTooltip={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`}
      className={className}
    />
  );
}
