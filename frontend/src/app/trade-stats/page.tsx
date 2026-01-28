"use client";

/**
 * Trade Statistics Page (T101)
 *
 * Comprehensive trading statistics and analytics.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Percent,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface TradeStat {
  label: string;
  value: string | number;
  subValue?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
}

interface TradeRecord {
  id: string;
  pair: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  duration: string;
  date: string;
}

// Stats definitions - labels will be translated
const TRADE_STAT_DEFS = [
  { labelKey: "totalTrades", value: 1247, icon: Activity, color: "blue" },
  { labelKey: "winRate", value: "68.4%", subValueKey: "wins", subValueNum: 853, change: 2.3, icon: Target, color: "green" },
  { labelKey: "profitFactor", value: "2.14", change: 0.12, icon: TrendingUp, color: "emerald" },
  { labelKey: "avgWin", value: "$847", icon: ArrowUpRight, color: "green" },
  { labelKey: "avgLoss", value: "$396", icon: ArrowDownRight, color: "red" },
  { labelKey: "largestWin", value: "$12,450", icon: DollarSign, color: "green" },
  { labelKey: "largestLoss", value: "-$3,240", icon: DollarSign, color: "red" },
  { labelKey: "avgDuration", value: "4.2h", icon: Clock, color: "purple" },
  { labelKey: "expectancy", value: "$245", change: 18, icon: Percent, color: "blue" },
  { labelKey: "maxConsecutiveWins", value: "12", icon: TrendingUp, color: "green" },
  { labelKey: "maxConsecutiveLosses", value: "4", icon: TrendingDown, color: "red" },
  { labelKey: "recoveryFactor", value: "3.8", icon: Activity, color: "amber" },
];

const RECENT_TRADES: TradeRecord[] = [
  { id: "t1", pair: "BTC/USDT", side: "long", entryPrice: 66500, exitPrice: 67800, size: 0.5, pnl: 650, pnlPercent: 1.95, duration: "2h 15m", date: "2025-01-27 14:30" },
  { id: "t2", pair: "ETH/USDT", side: "short", entryPrice: 3480, exitPrice: 3420, size: 5, pnl: 300, pnlPercent: 1.72, duration: "45m", date: "2025-01-27 12:15" },
  { id: "t3", pair: "SOL/USDT", side: "long", entryPrice: 182, exitPrice: 186, size: 50, pnl: 200, pnlPercent: 2.20, duration: "1h 30m", date: "2025-01-27 10:00" },
  { id: "t4", pair: "BTC/USDT", side: "long", entryPrice: 67200, exitPrice: 66800, size: 0.3, pnl: -120, pnlPercent: -0.60, duration: "3h", date: "2025-01-26 22:00" },
  { id: "t5", pair: "AVAX/USDT", side: "long", entryPrice: 41, exitPrice: 43.5, size: 100, pnl: 250, pnlPercent: 6.10, duration: "5h 45m", date: "2025-01-26 16:30" },
  { id: "t6", pair: "LINK/USDT", side: "short", entryPrice: 19.2, exitPrice: 18.5, size: 200, pnl: 140, pnlPercent: 3.65, duration: "2h", date: "2025-01-26 14:00" },
  { id: "t7", pair: "DOT/USDT", side: "long", entryPrice: 9.0, exitPrice: 8.8, size: 500, pnl: -100, pnlPercent: -2.22, duration: "4h 20m", date: "2025-01-26 09:30" },
  { id: "t8", pair: "ETH/USDT", side: "long", entryPrice: 3380, exitPrice: 3450, size: 3, pnl: 210, pnlPercent: 2.07, duration: "1h 10m", date: "2025-01-25 20:00" },
];

const TIME_PERIOD_KEYS = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"];

export default function TradeStatsPage() {
  const t = useTranslations("tradeStatsPage");
  const [period, setPeriod] = useState("thisMonth");

  const totalPnl = useMemo(
    () => RECENT_TRADES.reduce((sum, t) => sum + t.pnl, 0),
    []
  );

  const winCount = useMemo(
    () => RECENT_TRADES.filter((t) => t.pnl > 0).length,
    []
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
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
            <Filter className="mr-2 h-4 w-4" />
            {t("filter")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-2">
        {TIME_PERIOD_KEYS.map((p) => (
          <Button
            key={p}
            variant={period === p ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {t(p)}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRADE_STAT_DEFS.slice(0, 4).map((stat) => (
          <Card key={stat.labelKey}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.subValueKey && (
                    <p className="text-xs text-muted-foreground">{stat.subValueNum} {t(stat.subValueKey)}</p>
                  )}
                </div>
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  `bg-${stat.color}-500/10`
                )}>
                  <stat.icon className={cn("h-6 w-6", `text-${stat.color}-500`)} />
                </div>
              </div>
              {stat.change !== undefined && (
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      stat.change >= 0
                        ? "text-green-500 border-green-500/50"
                        : "text-red-500 border-red-500/50"
                    )}
                  >
                    {stat.change >= 0 ? "+" : ""}{stat.change}% {t("vsLastPeriod")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detailed Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("detailedMetrics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TRADE_STAT_DEFS.slice(4).map((stat) => (
              <div key={stat.labelKey} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <stat.icon className={cn("h-4 w-4", `text-${stat.color}-500`)} />
                  <span className="text-sm">{t(stat.labelKey)}</span>
                </div>
                <span className="font-mono font-medium">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t("recentTrades")}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-500">
                  {winCount}/{RECENT_TRADES.length} {t("wins")}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    totalPnl >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">{t("pair")}</th>
                    <th className="text-center py-2 px-2">{t("side")}</th>
                    <th className="text-right py-2 px-2">{t("entry")}</th>
                    <th className="text-right py-2 px-2">{t("exit")}</th>
                    <th className="text-right py-2 px-2">{t("pnl")}</th>
                    <th className="text-right py-2 px-2">{t("duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRADES.map((trade) => (
                    <tr key={trade.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{trade.pair}</td>
                      <td className="py-2 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            trade.side === "long"
                              ? "text-green-500 border-green-500/50"
                              : "text-red-500 border-red-500/50"
                          )}
                        >
                          {t(trade.side)}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        ${trade.entryPrice.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        ${trade.exitPrice.toLocaleString()}
                      </td>
                      <td className={cn(
                        "py-2 px-2 text-right font-mono",
                        trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        <div>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                          <span className="text-xs ml-1">
                            ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground">
                        {trade.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("pnlDistribution")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Win/Loss Ratio */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("winLossRatio")}</p>
              <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                <div
                  className="h-full bg-green-500"
                  style={{ width: "68.4%" }}
                />
                <div
                  className="h-full bg-red-500"
                  style={{ width: "31.6%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("winsPercent")}: 68.4%</span>
                <span>{t("lossesPercent")}: 31.6%</span>
              </div>
            </div>

            {/* Profit by Day */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("profitByDay")}</p>
              <div className="flex gap-1 h-16 items-end">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const height = [65, 80, 45, 90, 75, 30, 20][i];
                  const isPositive = [true, true, false, true, true, true, false][i];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "w-full rounded-t",
                          isPositive ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
