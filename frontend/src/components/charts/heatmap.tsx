"use client";

/**
 * Heatmap Component
 *
 * Matrix heatmaps for correlation analysis, calendar views,
 * and multi-dimensional data visualization.
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

interface HeatmapProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  minValue?: number;
  maxValue?: number;
  colorScale?: "green-red" | "blue-red" | "purple" | "mono";
  cellSize?: number;
  showLabels?: boolean;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  onCellClick?: (cell: HeatmapCell) => void;
  className?: string;
}

// Color interpolation function
function interpolateColor(
  value: number,
  min: number,
  max: number,
  scale: "green-red" | "blue-red" | "purple" | "mono"
): string {
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));

  switch (scale) {
    case "green-red":
      // Green (positive) to Red (negative)
      if (clamped >= 0.5) {
        const intensity = (clamped - 0.5) * 2;
        return `hsl(142, ${70 + intensity * 30}%, ${50 - intensity * 15}%)`;
      } else {
        const intensity = (0.5 - clamped) * 2;
        return `hsl(0, ${70 + intensity * 30}%, ${50 - intensity * 15}%)`;
      }

    case "blue-red":
      // Blue (low) to Red (high)
      const hue = 240 - clamped * 240;
      return `hsl(${hue}, 70%, ${45 + clamped * 10}%)`;

    case "purple":
      // Light to dark purple
      return `hsl(280, ${50 + clamped * 40}%, ${85 - clamped * 45}%)`;

    case "mono":
    default:
      // Light to dark gray
      const lightness = 95 - clamped * 60;
      return `hsl(var(--primary) / ${0.1 + clamped * 0.9})`;
  }
}

export function Heatmap({
  data,
  rows,
  cols,
  minValue,
  maxValue,
  colorScale = "green-red",
  cellSize = 40,
  showLabels = true,
  showValues = true,
  formatValue,
  onCellClick,
  className,
}: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Calculate min/max if not provided
  const { min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    return {
      min: minValue ?? Math.min(...values),
      max: maxValue ?? Math.max(...values),
    };
  }, [data, minValue, maxValue]);

  // Create lookup map for cell values
  const cellMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(`${d.row}-${d.col}`, d.value);
    });
    return map;
  }, [data]);

  const defaultFormatValue = (value: number) => {
    if (Math.abs(value) < 0.01) return "0";
    return value.toFixed(2);
  };

  return (
    <TooltipProvider>
      <div className={cn("overflow-auto", className)}>
        <div className="inline-block">
          {/* Column headers */}
          {showLabels && (
            <div className="flex" style={{ marginLeft: cellSize + 8 }}>
              {cols.map((col) => (
                <div
                  key={col}
                  className="text-xs text-muted-foreground font-medium truncate text-center"
                  style={{ width: cellSize, height: 24 }}
                  title={col}
                >
                  {col.length > 5 ? col.slice(0, 4) + ".." : col}
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          {rows.map((row) => (
            <div key={row} className="flex items-center">
              {/* Row header */}
              {showLabels && (
                <div
                  className="text-xs text-muted-foreground font-medium truncate pr-2 text-right"
                  style={{ width: cellSize + 8 }}
                  title={row}
                >
                  {row.length > 6 ? row.slice(0, 5) + ".." : row}
                </div>
              )}

              {/* Cells */}
              {cols.map((col) => {
                const value = cellMap.get(`${row}-${col}`);
                const cell = { row, col, value: value ?? 0 };
                const bgColor =
                  value !== undefined
                    ? interpolateColor(value, min, max, colorScale)
                    : "transparent";
                const isHovered =
                  hoveredCell?.row === row && hoveredCell?.col === col;

                return (
                  <Tooltip key={`${row}-${col}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center justify-center border border-background transition-all cursor-pointer",
                          isHovered && "ring-2 ring-primary ring-offset-1"
                        )}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: bgColor,
                        }}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onCellClick?.(cell)}
                      >
                        {showValues && value !== undefined && cellSize >= 32 && (
                          <span
                            className={cn(
                              "text-xs font-medium",
                              // Dynamic text color based on background
                              (value - min) / (max - min) > 0.5
                                ? "text-white"
                                : "text-foreground"
                            )}
                          >
                            {formatValue
                              ? formatValue(value)
                              : defaultFormatValue(value)}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-medium">
                          {row} / {col}
                        </div>
                        <div className="text-muted-foreground">
                          Value:{" "}
                          {value !== undefined
                            ? formatValue
                              ? formatValue(value)
                              : defaultFormatValue(value)
                            : "N/A"}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Color legend */}
          <div className="flex items-center gap-2 mt-4" style={{ marginLeft: showLabels ? cellSize + 8 : 0 }}>
            <span className="text-xs text-muted-foreground">
              {formatValue ? formatValue(min) : defaultFormatValue(min)}
            </span>
            <div
              className="h-3 flex-1 rounded"
              style={{
                background: `linear-gradient(to right, ${interpolateColor(
                  min,
                  min,
                  max,
                  colorScale
                )}, ${interpolateColor(
                  (min + max) / 2,
                  min,
                  max,
                  colorScale
                )}, ${interpolateColor(max, min, max, colorScale)})`,
                maxWidth: cols.length * cellSize,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {formatValue ? formatValue(max) : defaultFormatValue(max)}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Preset: Correlation Matrix
interface CorrelationMatrixProps {
  assets: string[];
  correlations: number[][]; // 2D array matching assets x assets
  className?: string;
}

export function CorrelationMatrix({
  assets,
  correlations,
  className,
}: CorrelationMatrixProps) {
  // Convert 2D array to HeatmapCell format
  const data: HeatmapCell[] = [];
  assets.forEach((row, i) => {
    assets.forEach((col, j) => {
      data.push({
        row,
        col,
        value: correlations[i]?.[j] ?? 0,
      });
    });
  });

  return (
    <Heatmap
      data={data}
      rows={assets}
      cols={assets}
      minValue={-1}
      maxValue={1}
      colorScale="green-red"
      cellSize={50}
      formatValue={(v) => v.toFixed(2)}
      className={className}
    />
  );
}

// Preset: Calendar Heatmap (for PnL by day)
interface CalendarHeatmapProps {
  data: { date: string; value: number }[]; // date in YYYY-MM-DD format
  year: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function CalendarHeatmap({
  data,
  year,
  formatValue,
  className,
}: CalendarHeatmapProps) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Create a map from date string to value
  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.value));
    return map;
  }, [data]);

  // Generate cells for each week of the year (simplified: Mon-Fri only)
  const cells: HeatmapCell[] = useMemo(() => {
    const result: HeatmapCell[] = [];
    const startDate = new Date(year, 0, 1);

    // Find first Monday
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() + 1);
    }

    let weekNum = 1;
    const current = new Date(startDate);

    while (current.getFullYear() === year) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Mon-Fri
        const dateStr = current.toISOString().split("T")[0];
        const value = valueMap.get(dateStr) ?? 0;
        result.push({
          row: days[dayOfWeek - 1],
          col: `W${weekNum}`,
          value,
        });
      }

      if (dayOfWeek === 5) {
        weekNum++;
      }

      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [year, valueMap, days]);

  const weeks = Array.from(
    { length: 53 },
    (_, i) => `W${i + 1}`
  ).filter((w) => cells.some((c) => c.col === w));

  return (
    <div className={cn("", className)}>
      <div className="text-sm font-medium mb-2">{year} Trading Calendar</div>
      <Heatmap
        data={cells}
        rows={days}
        cols={weeks}
        colorScale="green-red"
        cellSize={16}
        showLabels={true}
        showValues={false}
        formatValue={formatValue || ((v) => `$${v.toLocaleString()}`)}
      />
    </div>
  );
}
