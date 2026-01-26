"use client";

import { useEffect, useRef, useCallback } from "react";
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

export function CandlestickChart({
  data,
  width,
  height = 400,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.7)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.3)",
          style: 2,
        },
        horzLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.3)",
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
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
  }, [height, width, handleResize, data]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} className={className} />;
}
