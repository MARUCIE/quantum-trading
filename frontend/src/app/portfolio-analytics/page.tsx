"use client";

/**
 * Portfolio Analytics Page (T100)
 *
 * Comprehensive portfolio analysis with returns, risk metrics, and insights.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Target,
  Shield,
  Percent,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface PortfolioAsset {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  allocation: number;
  pnl: number;
  pnlPercent: number;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

// Mock data
const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  { symbol: "BTC", name: "Bitcoin", quantity: 2.5, avgCost: 42000, currentPrice: 67500, value: 168750, allocation: 45.2, pnl: 63750, pnlPercent: 60.71 },
  { symbol: "ETH", name: "Ethereum", quantity: 25, avgCost: 2800, currentPrice: 3450, value: 86250, allocation: 23.1, pnl: 16250, pnlPercent: 23.21 },
  { symbol: "SOL", name: "Solana", quantity: 200, avgCost: 120, currentPrice: 185, value: 37000, allocation: 9.9, pnl: 13000, pnlPercent: 54.17 },
  { symbol: "AVAX", name: "Avalanche", quantity: 350, avgCost: 35, currentPrice: 42, value: 14700, allocation: 3.9, pnl: 2450, pnlPercent: 20.0 },
  { symbol: "USDT", name: "Tether", quantity: 50000, avgCost: 1, currentPrice: 1, value: 50000, allocation: 13.4, pnl: 0, pnlPercent: 0 },
  { symbol: "LINK", name: "Chainlink", quantity: 500, avgCost: 15, currentPrice: 18.5, value: 9250, allocation: 2.5, pnl: 1750, pnlPercent: 23.33 },
  { symbol: "DOT", name: "Polkadot", quantity: 400, avgCost: 8, currentPrice: 9.2, value: 3680, allocation: 1.0, pnl: 480, pnlPercent: 15.0 },
  { symbol: "UNI", name: "Uniswap", quantity: 250, avgCost: 12, currentPrice: 14.8, value: 3700, allocation: 1.0, pnl: 700, pnlPercent: 23.33 },
];

const TIME_PERIODS = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export default function PortfolioAnalyticsPage() {
  const t = useTranslations("portfolioAnalyticsPage");
  const [period, setPeriod] = useState("1M");

  const performanceMetrics: PerformanceMetric[] = [
    { label: t("totalReturn"), value: "98,380", change: 36.2, icon: TrendingUp },
    { label: t("sharpeRatio"), value: "1.85", change: 0.15, icon: Target },
    { label: t("maxDrawdown"), value: "-12.4%", change: -2.1, icon: Shield },
    { label: t("winRate"), value: "68.5%", change: 3.2, icon: Percent },
  ];

  const totalValue = useMemo(
    () => PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.value, 0),
    []
  );

  const totalPnl = useMemo(
    () => PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.pnl, 0),
    []
  );

  const totalCost = useMemo(
    () => PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.avgCost * a.quantity, 0),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalValue")}</p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalPnl")}</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalPnl >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {totalPnl >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("roi")}</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalPnl >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {totalPnl >= 0 ? "+" : ""}{((totalPnl / totalCost) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Percent className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("assets")}</p>
                <p className="text-2xl font-bold">{PORTFOLIO_ASSETS.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {TIME_PERIODS.map((p) => (
          <Button
            key={p}
            variant={period === p ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Metrics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              {t("performanceMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="font-semibold">{metric.value}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    metric.change >= 0
                      ? "text-green-500 border-green-500/50"
                      : "text-red-500 border-red-500/50"
                  )}
                >
                  {metric.change >= 0 ? "+" : ""}{metric.change}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t("holdings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">{t("asset")}</th>
                    <th className="text-right py-3 px-2">{t("quantity")}</th>
                    <th className="text-right py-3 px-2">{t("avgCost")}</th>
                    <th className="text-right py-3 px-2">{t("current")}</th>
                    <th className="text-right py-3 px-2">{t("value")}</th>
                    <th className="text-right py-3 px-2">{t("allocation")}</th>
                    <th className="text-right py-3 px-2">{t("pnl")}</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTFOLIO_ASSETS.map((asset) => (
                    <tr key={asset.symbol} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-mono">{asset.quantity}</td>
                      <td className="text-right py-3 px-2 font-mono">${asset.avgCost.toLocaleString()}</td>
                      <td className="text-right py-3 px-2 font-mono">${asset.currentPrice.toLocaleString()}</td>
                      <td className="text-right py-3 px-2 font-mono">${asset.value.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${asset.allocation}%` }}
                            />
                          </div>
                          <span className="text-xs w-10">{asset.allocation}%</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className={cn(
                          "font-mono",
                          asset.pnl >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          <p>{asset.pnl >= 0 ? "+" : ""}${asset.pnl.toLocaleString()}</p>
                          <p className="text-xs">({asset.pnlPercent >= 0 ? "+" : ""}{asset.pnlPercent.toFixed(2)}%)</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t("assetAllocation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {PORTFOLIO_ASSETS.filter((a) => a.allocation > 1).map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center gap-2 p-2 rounded-lg border"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  }}
                />
                <span className="font-medium">{asset.symbol}</span>
                <Badge variant="secondary">{asset.allocation}%</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 h-8 rounded-full overflow-hidden flex">
            {PORTFOLIO_ASSETS.filter((a) => a.allocation > 1).map((asset, i) => (
              <div
                key={asset.symbol}
                className="h-full transition-all hover:opacity-80"
                style={{
                  width: `${asset.allocation}%`,
                  backgroundColor: `hsl(${(i * 47) % 360}, 70%, 50%)`,
                }}
                title={`${asset.symbol}: ${asset.allocation}%`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
