"use client";

/**
 * Bar Chart Component
 *
 * Vertical and horizontal bar charts for comparisons,
 * distributions, and categorical data.
 */

import { useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

export interface BarDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface BarSeries {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  series: BarSeries[];
  layout?: "vertical" | "horizontal";
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  barSize?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  series,
  layout = "horizontal",
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  barSize,
  formatValue,
  className,
}: BarChartProps) {
  const defaultFormatValue = useMemo(() => {
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

  const isVertical = layout === "vertical";

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tickFormatter={formatValue || defaultFormatValue}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatValue || defaultFormatValue}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
            </>
          )}
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
                  ? formatValue
                    ? formatValue(value)
                    : value.toLocaleString()
                  : String(value)
              }
            />
          )}
          {showLegend && <Legend />}
          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              stackId={s.stackId}
              barSize={barSize}
              radius={[4, 4, 0, 0]}
            >
              {showLabels && (
                <LabelList
                  dataKey={s.dataKey}
                  position={isVertical ? "right" : "top"}
                  formatter={(value) =>
                    typeof value === "number"
                      ? formatValue
                        ? formatValue(value)
                        : defaultFormatValue(value)
                      : String(value)
                  }
                  className="text-xs fill-foreground"
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset: PnL by Strategy
interface StrategyPnLProps {
  data: { name: string; pnl: number }[];
  height?: number;
  className?: string;
}

export function StrategyPnLChart({
  data,
  height = 300,
  className,
}: StrategyPnLProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            opacity={0.3}
          />
          <XAxis
            type="number"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value) => [
              typeof value === "number" ? `$${value.toLocaleString()}` : String(value),
              "P&L",
            ]}
          />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset: Win/Loss Distribution
interface WinLossDistributionProps {
  data: { range: string; wins: number; losses: number }[];
  height?: number;
  className?: string;
}

export function WinLossDistribution({
  data,
  height = 250,
  className,
}: WinLossDistributionProps) {
  const series: BarSeries[] = [
    { dataKey: "wins", name: "Wins", color: "hsl(142, 76%, 36%)" },
    { dataKey: "losses", name: "Losses", color: "hsl(0, 84%, 60%)" },
  ];

  return (
    <BarChart
      data={data.map((d) => ({ name: d.range, ...d }))}
      series={series}
      height={height}
      formatValue={(v) => v.toString()}
      className={className}
    />
  );
}

// Preset: Monthly Returns
interface MonthlyReturnsProps {
  data: { month: string; return: number }[];
  height?: number;
  className?: string;
}

export function MonthlyReturnsChart({
  data,
  height = 250,
  className,
}: MonthlyReturnsProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data.map((d) => ({ name: d.month, return: d.return }))}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            opacity={0.3}
          />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis
            tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value) => [
              typeof value === "number"
                ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
                : String(value),
              "Return",
            ]}
          />
          <Bar dataKey="return" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.return >= 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"
                }
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
