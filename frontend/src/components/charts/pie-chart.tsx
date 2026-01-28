"use client";

/**
 * Pie & Donut Chart Component
 *
 * Circular charts for portfolio allocation, asset distribution,
 * and proportional data visualization.
 */

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Default color palette for pie charts
const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(217, 91%, 60%)", // blue
  "hsl(142, 76%, 36%)", // green
  "hsl(38, 92%, 50%)",  // amber
  "hsl(280, 87%, 60%)", // purple
  "hsl(0, 84%, 60%)",   // red
  "hsl(180, 70%, 45%)", // cyan
  "hsl(330, 80%, 60%)", // pink
];

interface PieChartProps {
  data: PieDataPoint[];
  type?: "pie" | "donut";
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  onSliceClick?: (data: PieDataPoint, index: number) => void;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (value: number) => string;
  formatPercent?: (percent: number) => string;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}


export function PieChart({
  data,
  type = "donut",
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  onSliceClick,
  innerRadius: customInnerRadius,
  outerRadius: customOuterRadius,
  formatValue,
  formatPercent,
  centerLabel,
  centerValue,
  className,
}: PieChartProps) {
  const innerRadius =
    customInnerRadius ?? (type === "donut" ? 60 : 0);
  const outerRadius = customOuterRadius ?? 80;

  // Assign colors to data points
  const dataWithColors = data.map((d, i) => ({
    ...d,
    color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={cn("w-full relative", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={
              showLabels
                ? ({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                : undefined
            }
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            onClick={(_, index) => {
              const item = dataWithColors[index];
              onSliceClick?.(item, index);
            }}
          >
            {dataWithColors.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value, name) => [
                typeof value === "number"
                  ? formatValue
                    ? formatValue(value)
                    : `$${value.toLocaleString()}`
                  : String(value),
                String(name),
              ]}
            />
          )}
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry) => {
                const item = dataWithColors.find((d) => d.name === value);
                const percent = item ? (item.value / total) * 100 : 0;
                return (
                  <span className="text-sm">
                    {value}{" "}
                    <span className="text-muted-foreground">
                      ({formatPercent ? formatPercent(percent) : `${percent.toFixed(1)}%`})
                    </span>
                  </span>
                );
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
      {/* Center label for donut charts */}
      {type === "donut" && (centerLabel || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && (
              <div className="text-2xl font-bold">{centerValue}</div>
            )}
            {centerLabel && (
              <div className="text-sm text-muted-foreground">{centerLabel}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Preset: Portfolio Allocation
interface PortfolioAllocationProps {
  data: { asset: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function PortfolioAllocation({
  data,
  height = 300,
  className,
}: PortfolioAllocationProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <PieChart
      data={data.map((d) => ({ name: d.asset, value: d.value, color: d.color }))}
      type="donut"
      height={height}
      centerValue={`$${(total / 1000).toFixed(0)}K`}
      centerLabel="Total Value"
      className={className}
    />
  );
}

// Preset: Strategy Allocation
interface StrategyAllocationProps {
  data: { strategy: string; allocation: number; color?: string }[];
  height?: number;
  className?: string;
}

export function StrategyAllocation({
  data,
  height = 300,
  className,
}: StrategyAllocationProps) {
  return (
    <PieChart
      data={data.map((d) => ({
        name: d.strategy,
        value: d.allocation,
        color: d.color,
      }))}
      type="donut"
      height={height}
      centerValue={`${data.length}`}
      centerLabel="Strategies"
      formatValue={(v) => `${v.toFixed(1)}%`}
      className={className}
    />
  );
}

// Preset: Win Rate Gauge (simplified donut)
interface WinRateGaugeProps {
  winRate: number; // 0-100
  height?: number;
  className?: string;
}

export function WinRateGauge({
  winRate,
  height = 200,
  className,
}: WinRateGaugeProps) {
  const data: PieDataPoint[] = [
    { name: "Wins", value: winRate, color: "hsl(142, 76%, 36%)" },
    { name: "Losses", value: 100 - winRate, color: "hsl(var(--muted))" },
  ];

  return (
    <PieChart
      data={data}
      type="donut"
      height={height}
      showLegend={false}
      innerRadius={50}
      outerRadius={70}
      centerValue={`${winRate.toFixed(1)}%`}
      centerLabel="Win Rate"
      className={className}
    />
  );
}
