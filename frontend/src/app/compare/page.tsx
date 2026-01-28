"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  DollarSign,
  Calendar,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface StrategyMetrics {
  id: string;
  name: string;
  description: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgTradeReturn: number;
  avgWin: number;
  avgLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  calmarRatio: number;
  volatility: number;
  beta: number;
  alpha: number;
}

// Mock strategies
const STRATEGIES: StrategyMetrics[] = [
  {
    id: "momentum-btc",
    name: "BTC Momentum",
    description: "Trend-following strategy on BTC using MA crossovers",
    totalReturn: 45.2,
    annualizedReturn: 38.5,
    sharpeRatio: 1.85,
    sortinoRatio: 2.45,
    maxDrawdown: -18.5,
    winRate: 52,
    profitFactor: 1.65,
    totalTrades: 156,
    avgTradeReturn: 0.29,
    avgWin: 2.8,
    avgLoss: -1.7,
    maxConsecutiveWins: 8,
    maxConsecutiveLosses: 5,
    calmarRatio: 2.08,
    volatility: 24.5,
    beta: 0.85,
    alpha: 12.3,
  },
  {
    id: "mean-reversion-eth",
    name: "ETH Mean Reversion",
    description: "RSI-based mean reversion on ETH",
    totalReturn: 32.8,
    annualizedReturn: 28.2,
    sharpeRatio: 1.42,
    sortinoRatio: 1.95,
    maxDrawdown: -22.3,
    winRate: 58,
    profitFactor: 1.45,
    totalTrades: 245,
    avgTradeReturn: 0.13,
    avgWin: 1.9,
    avgLoss: -1.3,
    maxConsecutiveWins: 12,
    maxConsecutiveLosses: 6,
    calmarRatio: 1.26,
    volatility: 28.2,
    beta: 1.12,
    alpha: 5.8,
  },
  {
    id: "breakout-multi",
    name: "Multi-Asset Breakout",
    description: "Volatility breakout across BTC, ETH, SOL",
    totalReturn: 58.6,
    annualizedReturn: 48.2,
    sharpeRatio: 2.15,
    sortinoRatio: 3.12,
    maxDrawdown: -15.2,
    winRate: 48,
    profitFactor: 1.92,
    totalTrades: 98,
    avgTradeReturn: 0.60,
    avgWin: 4.2,
    avgLoss: -2.2,
    maxConsecutiveWins: 6,
    maxConsecutiveLosses: 4,
    calmarRatio: 3.17,
    volatility: 22.1,
    beta: 0.78,
    alpha: 18.5,
  },
  {
    id: "grid-trading",
    name: "Grid Trading BNB",
    description: "Range-bound grid strategy on BNB/USDT",
    totalReturn: 18.5,
    annualizedReturn: 16.2,
    sharpeRatio: 0.95,
    sortinoRatio: 1.25,
    maxDrawdown: -12.8,
    winRate: 72,
    profitFactor: 1.28,
    totalTrades: 520,
    avgTradeReturn: 0.04,
    avgWin: 0.8,
    avgLoss: -0.6,
    maxConsecutiveWins: 18,
    maxConsecutiveLosses: 3,
    calmarRatio: 1.27,
    volatility: 15.5,
    beta: 0.45,
    alpha: 3.2,
  },
  {
    id: "arbitrage-funding",
    name: "Funding Rate Arbitrage",
    description: "Perpetual funding rate capture strategy",
    totalReturn: 12.4,
    annualizedReturn: 11.2,
    sharpeRatio: 2.85,
    sortinoRatio: 4.15,
    maxDrawdown: -3.5,
    winRate: 88,
    profitFactor: 2.45,
    totalTrades: 365,
    avgTradeReturn: 0.03,
    avgWin: 0.4,
    avgLoss: -0.15,
    maxConsecutiveWins: 25,
    maxConsecutiveLosses: 2,
    calmarRatio: 3.20,
    volatility: 5.2,
    beta: 0.12,
    alpha: 8.5,
  },
];

export default function ComparePage() {
  const t = useTranslations("comparePage");

  // Metric definitions - moved inside component to use translations
  const METRICS = [
    { key: "totalReturn", label: t("totalReturn"), format: "percent", higherBetter: true },
    { key: "annualizedReturn", label: t("annReturn"), format: "percent", higherBetter: true },
    { key: "sharpeRatio", label: t("sharpeRatio"), format: "decimal", higherBetter: true },
    { key: "sortinoRatio", label: t("sortinoRatio"), format: "decimal", higherBetter: true },
    { key: "maxDrawdown", label: t("maxDrawdown"), format: "percent", higherBetter: false },
    { key: "winRate", label: t("winRate"), format: "percent", higherBetter: true },
    { key: "profitFactor", label: t("profitFactor"), format: "decimal", higherBetter: true },
    { key: "totalTrades", label: t("totalTrades"), format: "number", higherBetter: null },
    { key: "avgTradeReturn", label: t("avgTrade"), format: "percent", higherBetter: true },
    { key: "avgWin", label: t("avgWin"), format: "percent", higherBetter: true },
    { key: "avgLoss", label: t("avgLoss"), format: "percent", higherBetter: false },
    { key: "calmarRatio", label: t("calmarRatio"), format: "decimal", higherBetter: true },
    { key: "volatility", label: t("volatility"), format: "percent", higherBetter: false },
    { key: "beta", label: t("beta"), format: "decimal", higherBetter: null },
    { key: "alpha", label: t("alpha"), format: "percent", higherBetter: true },
  ];
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    "momentum-btc",
    "breakout-multi",
  ]);
  const [highlightBest, setHighlightBest] = useState(true);

  // Get selected strategy data
  const comparisonData = useMemo(() => {
    return selectedStrategies
      .map((id) => STRATEGIES.find((s) => s.id === id))
      .filter((s): s is StrategyMetrics => s !== undefined);
  }, [selectedStrategies]);

  // Find best/worst for each metric
  const rankings = useMemo(() => {
    const result: Record<string, { best: string; worst: string }> = {};

    METRICS.forEach((metric) => {
      if (metric.higherBetter === null) return;

      let bestId = "";
      let worstId = "";
      let bestValue = metric.higherBetter ? -Infinity : Infinity;
      let worstValue = metric.higherBetter ? Infinity : -Infinity;

      comparisonData.forEach((strategy) => {
        const value = strategy[metric.key as keyof StrategyMetrics] as number;
        if (metric.higherBetter) {
          if (value > bestValue) {
            bestValue = value;
            bestId = strategy.id;
          }
          if (value < worstValue) {
            worstValue = value;
            worstId = strategy.id;
          }
        } else {
          if (value < bestValue) {
            bestValue = value;
            bestId = strategy.id;
          }
          if (value > worstValue) {
            worstValue = value;
            worstId = strategy.id;
          }
        }
      });

      result[metric.key] = { best: bestId, worst: worstId };
    });

    return result;
  }, [comparisonData]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "percent":
        return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
      case "decimal":
        return value.toFixed(2);
      case "number":
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const toggleStrategy = (id: string) => {
    if (selectedStrategies.includes(id)) {
      if (selectedStrategies.length > 1) {
        setSelectedStrategies(selectedStrategies.filter((s) => s !== id));
      }
    } else {
      if (selectedStrategies.length < 4) {
        setSelectedStrategies([...selectedStrategies, id]);
      }
    }
  };

  // Calculate overall score
  const getOverallScore = (strategy: StrategyMetrics) => {
    let score = 0;
    METRICS.forEach((metric) => {
      if (metric.higherBetter === null) return;
      if (rankings[metric.key]?.best === strategy.id) score += 1;
    });
    return score;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button
          variant={highlightBest ? "secondary" : "outline"}
          onClick={() => setHighlightBest(!highlightBest)}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {t("highlightBest")}
        </Button>
      </div>

      {/* Strategy Selector */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">{t("selectStrategies")}</p>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((strategy) => (
              <Button
                key={strategy.id}
                variant={selectedStrategies.includes(strategy.id) ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleStrategy(strategy.id)}
                className="gap-2"
              >
                {selectedStrategies.includes(strategy.id) && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                {strategy.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {comparisonData.map((strategy) => {
          const score = getOverallScore(strategy);
          const maxScore = METRICS.filter((m) => m.higherBetter !== null).length;

          return (
            <Card key={strategy.id} className="overflow-hidden">
              <div className={cn(
                "h-1",
                score >= maxScore * 0.7 ? "bg-green-500" :
                score >= maxScore * 0.4 ? "bg-yellow-500" : "bg-red-500"
              )} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{strategy.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {strategy.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {score}/{maxScore}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">{t("return")}</p>
                    <p className={cn(
                      "font-semibold",
                      strategy.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatValue(strategy.totalReturn, "percent")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("sharpe")}</p>
                    <p className="font-semibold">{strategy.sharpeRatio.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("winRate")}</p>
                    <p className="font-semibold">{strategy.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("maxDd")}</p>
                    <p className="font-semibold text-red-500">
                      {strategy.maxDrawdown.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            {t("detailedMetrics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">{t("metric")}</th>
                  {comparisonData.map((strategy) => (
                    <th key={strategy.id} className="p-3 text-center font-medium min-w-[140px]">
                      {strategy.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric) => (
                  <tr key={metric.key} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{metric.label}</td>
                    {comparisonData.map((strategy) => {
                      const value = strategy[metric.key as keyof StrategyMetrics] as number;
                      const isBest = rankings[metric.key]?.best === strategy.id;
                      const isWorst = rankings[metric.key]?.worst === strategy.id;

                      return (
                        <td key={strategy.id} className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={cn(
                              "font-mono",
                              highlightBest && isBest && "text-green-500 font-semibold",
                              highlightBest && isWorst && metric.higherBetter !== null && "text-red-500"
                            )}>
                              {formatValue(value, metric.format)}
                            </span>
                            {highlightBest && isBest && metric.higherBetter !== null && (
                              <ArrowUp className="h-3 w-3 text-green-500" />
                            )}
                            {highlightBest && isWorst && metric.higherBetter !== null && (
                              <ArrowDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Return Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t("returnMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{strategy.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold",
                      strategy.annualizedReturn >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatValue(strategy.annualizedReturn, "percent")}
                    </span>
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          strategy.annualizedReturn >= 0 ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, Math.abs(strategy.annualizedReturn))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              {t("riskMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{strategy.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-500">
                      {strategy.maxDrawdown.toFixed(1)}%
                    </span>
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(100, Math.abs(strategy.maxDrawdown) * 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk-Adjusted */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              {t("riskAdjusted")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{strategy.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {strategy.sharpeRatio.toFixed(2)}
                    </span>
                    <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          strategy.sharpeRatio >= 2 ? "bg-green-500" :
                          strategy.sharpeRatio >= 1 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, strategy.sharpeRatio * 33)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
