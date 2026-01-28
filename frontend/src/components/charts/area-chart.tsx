"use client";

/**
 * Area Chart Component
 *
 * Stacked and gradient area charts for volume, cumulative metrics,
 * and time series with filled regions.
 */

import { useMemo } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface AreaDataPoint {
  timestamp: string | number;
  [key: string]: string | number;
}

export interface AreaSeries {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
  stackId?: string;
}

interface AreaChartProps {
  data: AreaDataPoint[];
  series: AreaSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number) => string;
  className?: string;
}

export function AreaChart({
  data,
  series,
  xAxisKey = "timestamp",
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gradient = true,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  className,
}: AreaChartProps) {
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
      return value.toFixed(0);
    };
  }, []);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {gradient && (
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={`gradient-${s.dataKey}`}
                  id={`gradient-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
          )}
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
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              fill={gradient ? `url(#gradient-${s.dataKey})` : s.color}
              fillOpacity={s.fillOpacity ?? 0.6}
              stackId={s.stackId}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset: Volume Chart
interface VolumeChartProps {
  data: { timestamp: number; volume: number; avgVolume?: number }[];
  height?: number;
  className?: string;
}

export function VolumeChart({
  data,
  height = 150,
  className,
}: VolumeChartProps) {
  const series: AreaSeries[] = [
    {
      dataKey: "volume",
      name: "Volume",
      color: "hsl(var(--primary))",
      fillOpacity: 0.4,
    },
  ];

  if (data.some((d) => d.avgVolume !== undefined)) {
    series.push({
      dataKey: "avgVolume",
      name: "Avg Volume",
      color: "hsl(var(--muted-foreground))",
      fillOpacity: 0,
    });
  }

  return (
    <AreaChart
      data={data}
      series={series}
      height={height}
      showLegend={false}
      gradient={true}
      formatYAxis={(v) => `${(v / 1000000).toFixed(1)}M`}
      formatTooltip={(v) => v.toLocaleString()}
      className={className}
    />
  );
}

// Preset: Stacked Asset Allocation Over Time
interface AllocationTimelineProps {
  data: { timestamp: number; [asset: string]: number }[];
  assets: { key: string; name: string; color: string }[];
  height?: number;
  className?: string;
}

export function AllocationTimeline({
  data,
  assets,
  height = 300,
  className,
}: AllocationTimelineProps) {
  const series: AreaSeries[] = assets.map((a) => ({
    dataKey: a.key,
    name: a.name,
    color: a.color,
    stackId: "allocation",
    fillOpacity: 0.8,
  }));

  return (
    <AreaChart
      data={data}
      series={series}
      height={height}
      gradient={false}
      formatYAxis={(v) => `${v}%`}
      formatTooltip={(v) => `${v.toFixed(1)}%`}
      className={className}
    />
  );
}

// Preset: Cumulative PnL
interface CumulativePnLProps {
  data: { timestamp: number; pnl: number }[];
  height?: number;
  className?: string;
}

export function CumulativePnL({
  data,
  height = 250,
  className,
}: CumulativePnLProps) {
  // Determine color based on final value
  const finalPnL = data[data.length - 1]?.pnl ?? 0;
  const color = finalPnL >= 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

  const series: AreaSeries[] = [
    { dataKey: "pnl", name: "Cumulative P&L", color, fillOpacity: 0.3 },
  ];

  return (
    <AreaChart
      data={data}
      series={series}
      height={height}
      showLegend={false}
      formatYAxis={(v) => `$${(v / 1000).toFixed(0)}K`}
      formatTooltip={(v) => `$${v.toLocaleString()}`}
      className={className}
    />
  );
}
