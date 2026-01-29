"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { DynamicCandlestickChart } from "@/components/charts/dynamic-candlestick-chart";
import { generateMockCandlestickData } from "@/lib/mock-data";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RefreshCw,
  Maximize2,
  Minimize2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface TimeframeData {
  id: string;
  label: string;
  shortLabel: string;
  minutes: number;
  trend: "bullish" | "bearish" | "neutral";
  change: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TrendSignal {
  timeframe: string;
  trend: "bullish" | "bearish" | "neutral";
  strength: number;
  rsi: number;
  macd: "bullish" | "bearish" | "neutral";
}

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"];

const LAYOUT_OPTIONS = [
  { value: "2x3", label: "2x3 Grid", cols: 3, rows: 2 },
  { value: "3x2", label: "3x2 Grid", cols: 2, rows: 3 },
  { value: "1x6", label: "1x6 Vertical", cols: 1, rows: 6 },
  { value: "focus", label: "Focus Mode", cols: 1, rows: 1 },
];

export default function MTFPage() {
  const t = useTranslations("mtfPage");

  const TIMEFRAMES: TimeframeData[] = [
    { id: "1m", label: t("minute1"), shortLabel: "1m", minutes: 1, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
    { id: "5m", label: t("minutes5"), shortLabel: "5m", minutes: 5, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
    { id: "15m", label: t("minutes15"), shortLabel: "15m", minutes: 15, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
    { id: "1h", label: t("hour1"), shortLabel: "1H", minutes: 60, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
    { id: "4h", label: t("hours4"), shortLabel: "4H", minutes: 240, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
    { id: "1d", label: t("day1"), shortLabel: "1D", minutes: 1440, trend: "neutral", change: 0, high: 0, low: 0, close: 0, volume: 0 },
  ];
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [layout, setLayout] = useState("2x3");
  const [focusedTimeframe, setFocusedTimeframe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate mock data for each timeframe
  const timeframeData = useMemo(() => {
    return TIMEFRAMES.map((tf) => {
      const candles = 100;
      const basePrice = 43000 + Math.random() * 2000;
      const change = (Math.random() - 0.5) * 4;
      const trend: TimeframeData["trend"] = change > 0.5 ? "bullish" : change < -0.5 ? "bearish" : "neutral";

      return {
        ...tf,
        trend,
        change,
        high: basePrice * (1 + Math.abs(change) / 100 + 0.01),
        low: basePrice * (1 - Math.abs(change) / 100 - 0.01),
        close: basePrice * (1 + change / 100),
        volume: 1000000 + Math.random() * 5000000,
      };
    });
  }, [symbol]);

  // Generate chart data for each timeframe
  const chartDataMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof generateMockCandlestickData>> = {};
    TIMEFRAMES.forEach((tf) => {
      map[tf.id] = generateMockCandlestickData(100);
    });
    return map;
  }, [symbol]);

  // Calculate trend signals
  const trendSignals: TrendSignal[] = useMemo(() => {
    return timeframeData.map((tf) => ({
      timeframe: tf.shortLabel,
      trend: tf.trend,
      strength: Math.abs(tf.change) * 20,
      rsi: 30 + Math.random() * 40,
      macd: tf.change > 0 ? "bullish" : tf.change < 0 ? "bearish" : "neutral",
    }));
  }, [timeframeData]);

  // Calculate overall bias
  const overallBias = useMemo(() => {
    const bullishCount = trendSignals.filter((s) => s.trend === "bullish").length;
    const bearishCount = trendSignals.filter((s) => s.trend === "bearish").length;

    if (bullishCount > bearishCount + 1) return "bullish";
    if (bearishCount > bullishCount + 1) return "bearish";
    return "neutral";
  }, [trendSignals]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Get grid layout
  const getGridClass = () => {
    if (focusedTimeframe) return "grid-cols-1";
    switch (layout) {
      case "2x3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "3x2":
        return "grid-cols-1 md:grid-cols-2";
      case "1x6":
        return "grid-cols-1";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const formatNumber = (value: number, decimals: number = 2) =>
    value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "bullish":
        return "text-green-500";
      case "bearish":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const getTrendBg = (trend: string) => {
    switch (trend) {
      case "bullish":
        return "bg-green-500/10";
      case "bearish":
        return "bg-red-500/10";
      default:
        return "bg-yellow-500/10";
    }
  };

  // Filter timeframes for display
  const displayedTimeframes = focusedTimeframe
    ? timeframeData.filter((tf) => tf.id === focusedTimeframe)
    : timeframeData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {SYMBOLS.map((s) => (
              <SelectOption key={s} value={s}>
                {s}
              </SelectOption>
            ))}
          </Select>
          <Select value={layout} onChange={(e) => setLayout(e.target.value)}>
            {LAYOUT_OPTIONS.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Overall Bias */}
        <Card className={cn("border-l-4", getTrendBg(overallBias))}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("overallBias")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendIcon trend={overallBias} />
              <span className={cn("text-2xl font-bold capitalize", getTrendColor(overallBias))}>
                {t(overallBias)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {trendSignals.filter((s) => s.trend === "bullish").length} {t("bullish")},{" "}
              {trendSignals.filter((s) => s.trend === "bearish").length} {t("bearish")}
            </p>
          </CardContent>
        </Card>

        {/* Timeframe Trend Grid */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trendByTimeframe")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendSignals.map((signal) => (
                <Badge
                  key={signal.timeframe}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 px-3 py-1",
                    getTrendBg(signal.trend),
                    getTrendColor(signal.trend)
                  )}
                >
                  <span className="font-medium">{signal.timeframe}</span>
                  <TrendIcon trend={signal.trend} />
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {t("bullish")}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {t("bearish")}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                {t("neutral")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focused Timeframe Exit Button */}
      {focusedTimeframe && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setFocusedTimeframe(null)}>
            <Minimize2 className="mr-2 h-4 w-4" />
            {t("exitFocusMode")}
          </Button>
        </div>
      )}

      {/* Charts Grid */}
      <div className={cn("grid gap-4", getGridClass())}>
        {displayedTimeframes.map((tf) => (
          <Card key={tf.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {tf.label}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-2",
                      getTrendBg(tf.trend),
                      getTrendColor(tf.trend)
                    )}
                  >
                    {tf.change >= 0 ? "+" : ""}{tf.change.toFixed(2)}%
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setFocusedTimeframe(focusedTimeframe === tf.id ? null : tf.id)
                    }
                  >
                    {focusedTimeframe === tf.id ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Price Stats */}
              <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-muted/30 text-xs">
                <div>
                  <span className="text-muted-foreground">{t("high")}</span>
                  <div className="font-mono text-green-500">${formatNumber(tf.high)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("low")}</span>
                  <div className="font-mono text-red-500">${formatNumber(tf.low)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("close")}</span>
                  <div className="font-mono">${formatNumber(tf.close)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("volume")}</span>
                  <div className="font-mono">{formatVolume(tf.volume)}</div>
                </div>
              </div>

              {/* Chart */}
              <div className={cn(focusedTimeframe ? "h-[500px]" : "h-[200px]")}>
                <DynamicCandlestickChart
                  data={chartDataMap[tf.id]}
                  height={focusedTimeframe ? 500 : 200}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signal Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("signalAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendSignals.map((signal) => (
              <div
                key={signal.timeframe}
                className={cn(
                  "p-4 rounded-lg border",
                  getTrendBg(signal.trend)
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{signal.timeframe}</span>
                  <TrendIcon trend={signal.trend} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("trendStrength")}</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          signal.trend === "bullish"
                            ? "bg-green-500"
                            : signal.trend === "bearish"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        )}
                        style={{ width: `${Math.min(signal.strength, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("rsi")}</span>
                    <span
                      className={cn(
                        "font-mono",
                        signal.rsi > 70
                          ? "text-red-500"
                          : signal.rsi < 30
                          ? "text-green-500"
                          : ""
                      )}
                    >
                      {signal.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("macd")}</span>
                    <div className="flex items-center gap-1">
                      {signal.macd === "bullish" ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : signal.macd === "bearish" ? (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="capitalize">{t(signal.macd)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Hint */}
      <Card className={cn("border-l-4", getTrendBg(overallBias))}>
        <CardContent className="flex items-start gap-3 pt-6">
          <TrendIcon trend={overallBias} />
          <div>
            <h4 className={cn("font-medium", getTrendColor(overallBias))}>
              {overallBias === "bullish"
                ? t("bullishConfluence")
                : overallBias === "bearish"
                ? t("bearishConfluence")
                : t("mixedSignals")}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {overallBias === "bullish"
                ? t("bullishHint")
                : overallBias === "bearish"
                ? t("bearishHint")
                : t("neutralHint")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
