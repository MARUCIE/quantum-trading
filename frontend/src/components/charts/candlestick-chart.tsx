"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  CandlestickSeries,
} from "lightweight-charts";

interface CandlestickChartProps {
  data: CandlestickData<Time>[];
  width?: number;
  height?: number;
  className?: string;
}

// Theme-aware chart colors
const getChartColors = (isDark: boolean) => ({
  textColor: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
  gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
  crosshairColor: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
  borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
});

export function CandlestickChart({
  data,
  width,
  height = 400,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { resolvedTheme } = useTheme();

  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    }
  }, []);

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = resolvedTheme === "dark";
    const colors = getChartColors(isDark);

    chartRef.current.applyOptions({
      layout: {
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        vertLine: { color: colors.crosshairColor },
        horzLine: { color: colors.crosshairColor },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
      },
      timeScale: {
        borderColor: colors.borderColor,
      },
    });
  }, [resolvedTheme]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = resolvedTheme === "dark";
    const colors = getChartColors(isDark);

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: colors.crosshairColor,
          style: 2,
        },
        horzLine: {
          width: 1,
          color: colors.crosshairColor,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      width: width || chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // Add candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    seriesRef.current = candlestickSeries;
    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    // Handle resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height, width, handleResize, data, resolvedTheme]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} className={className} />;
}
