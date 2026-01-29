"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Target,
  Activity,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface AttributionFactor {
  name: string;
  contribution: number;
  returnPercent: number;
  weight: number;
  description: string;
}

interface StrategyAttribution {
  strategy: string;
  totalReturn: number;
  allocation: number;
  contribution: number;
  trades: number;
}

interface PeriodData {
  period: string;
  totalReturn: number;
  factors: AttributionFactor[];
  strategies: StrategyAttribution[];
}

// Mock data generator - uses translation keys instead of hardcoded text
function generateAttributionData(period: string, t: (key: string) => string): PeriodData {
  const factors: AttributionFactor[] = [
    { name: t("marketBeta"), contribution: 12.5, returnPercent: 15.2, weight: 0.65, description: t("marketBetaDesc") },
    { name: t("momentum"), contribution: 8.2, returnPercent: 22.5, weight: 0.25, description: t("momentumDesc") },
    { name: t("value"), contribution: -2.1, returnPercent: -8.5, weight: 0.15, description: t("valueDesc") },
    { name: t("volatility"), contribution: 3.8, returnPercent: 18.2, weight: 0.12, description: t("volatilityDesc") },
    { name: t("carry"), contribution: 1.5, returnPercent: 6.8, weight: 0.08, description: t("carryDesc") },
    { name: t("residual"), contribution: 2.3, returnPercent: 0, weight: 0, description: t("residualDesc") },
  ];

  const strategies: StrategyAttribution[] = [
    { strategy: "BTC Momentum", totalReturn: 18.5, allocation: 30, contribution: 5.55, trades: 45 },
    { strategy: "ETH Mean Reversion", totalReturn: 12.2, allocation: 25, contribution: 3.05, trades: 82 },
    { strategy: "Multi-Asset Breakout", totalReturn: 28.5, allocation: 20, contribution: 5.70, trades: 28 },
    { strategy: "Grid Trading", totalReturn: 8.5, allocation: 15, contribution: 1.28, trades: 156 },
    { strategy: "Funding Arbitrage", totalReturn: 15.2, allocation: 10, contribution: 1.52, trades: 365 },
  ];

  // Add some randomness based on period
  const periodMultiplier = period === "1M" ? 0.3 : period === "3M" ? 0.6 : period === "YTD" ? 0.85 : 1;

  return {
    period,
    totalReturn: factors.reduce((sum, f) => sum + f.contribution, 0) * periodMultiplier,
    factors: factors.map((f) => ({
      ...f,
      contribution: f.contribution * periodMultiplier * (0.8 + Math.random() * 0.4),
      returnPercent: f.returnPercent * periodMultiplier * (0.8 + Math.random() * 0.4),
    })),
    strategies: strategies.map((s) => ({
      ...s,
      totalReturn: s.totalReturn * periodMultiplier * (0.8 + Math.random() * 0.4),
      contribution: s.contribution * periodMultiplier * (0.8 + Math.random() * 0.4),
      trades: Math.floor(s.trades * periodMultiplier),
    })),
  };
}

const PERIODS = ["1M", "3M", "6M", "YTD", "1Y", "ALL"];

export default function AttributionPage() {
  const t = useTranslations("attributionPage");
  const [period, setPeriod] = useState("YTD");
  const data = useMemo(() => generateAttributionData(period, t), [period, t]);

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Calculate factor bar widths
  const maxContribution = Math.max(...data.factors.map((f) => Math.abs(f.contribution)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant={period === p ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                data.totalReturn >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <DollarSign className={cn(
                  "h-5 w-5",
                  data.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalReturn")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  data.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPercent(data.totalReturn)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("activeFactors")}</p>
                <p className="text-xl font-bold">{data.factors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("strategies")}</p>
                <p className="text-xl font-bold">{data.strategies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Activity className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalTrades")}</p>
                <p className="text-xl font-bold">
                  {data.strategies.reduce((sum, s) => sum + s.trades, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Factor Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("factorAttribution")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.factors.map((factor) => (
              <div key={factor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{factor.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(factor.weight * 100).toFixed(0)}% {t("weight")}
                    </Badge>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    factor.contribution >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {formatPercent(factor.contribution)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full absolute",
                        factor.contribution >= 0 ? "bg-green-500 left-1/2" : "bg-red-500 right-1/2"
                      )}
                      style={{
                        width: `${(Math.abs(factor.contribution) / maxContribution) * 50}%`,
                      }}
                    />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strategy Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t("strategyAttribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.strategies.map((strategy) => (
                <div key={strategy.strategy} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{strategy.strategy}</span>
                    <Badge>{strategy.allocation}% {t("alloc")}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">{t("return")}</p>
                      <p className={cn(
                        "font-semibold",
                        strategy.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatPercent(strategy.totalReturn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t("contribution")}</p>
                      <p className={cn(
                        "font-semibold",
                        strategy.contribution >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatPercent(strategy.contribution)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t("trades")}</p>
                      <p className="font-semibold">{strategy.trades}</p>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        strategy.totalReturn >= 0 ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(100, Math.abs(strategy.totalReturn) * 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interpretation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t("howToReadThis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">{t("factorAttributionTitle")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("factorAttributionDesc")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("strategyAttributionTitle")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("strategyAttributionDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
