"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DynamicCandlestickChart } from "@/components/charts/dynamic-candlestick-chart";
import { generateMockCandlestickData } from "@/lib/mock-data";
import {
  Play,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Trade {
  id: string;
  entryTime: number;
  exitTime: number;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  reason: string;
}

interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
  trades: number;
}

interface BacktestResult {
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  profitFactor: number;
  expectancy: number;
  avgTradeDuration: number;
  trades: Trade[];
  monthlyReturns: MonthlyReturn[];
}

const STRATEGIES = [
  { id: "1", name: "BTC Momentum Alpha", type: "Momentum" },
  { id: "2", name: "ETH Mean Reversion", type: "Mean Reversion" },
  { id: "3", name: "Cross-Market Arbitrage", type: "Arbitrage" },
];

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BacktestPage() {
  const t = useTranslations("backtestPage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [showTrades, setShowTrades] = useState(false);

  // Config state
  const [strategyId, setStrategyId] = useState("1");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [initialCapital, setInitialCapital] = useState("100000");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const chartData = useMemo(() => generateMockCandlestickData(365), []);

  // Run backtest
  const runBacktest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/backtest/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          symbol: symbol.replace("/", ""),
          startDate,
          endDate,
          initialCapital: parseFloat(initialCapital),
          commission: 0.1,
          slippage: 0.05,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Backtest failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export results
  const handleExport = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backtest_${strategyId}_${startDate}_${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const formatTime = (ts: number) => new Date(ts).toLocaleString();

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
        <div className="flex gap-2">
          {result && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("export")}
            </Button>
          )}
          <Button onClick={runBacktest} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {loading ? t("running") : t("runBacktest")}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("configuration")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">{t("strategy")}</Label>
              <Select
                id="strategy"
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
              >
                {STRATEGIES.map((s) => (
                  <SelectOption key={s.id} value={s.id}>
                    {s.name}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">{t("symbol")}</Label>
              <Select
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                {SYMBOLS.map((s) => (
                  <SelectOption key={s} value={s}>
                    {s}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">{t("initialCapital")}</Label>
              <Input
                id="capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                min={1000}
                step={1000}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Performance Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("totalReturn")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    result.totalReturnPercent >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {formatPercent(result.totalReturnPercent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("annualized")}: {formatPercent(result.annualizedReturn)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("sharpeRatio")}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.sharpeRatio.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("sortino")}: {result.sortinoRatio.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("maxDrawdown")}
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {result.maxDrawdownPercent.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("calmar")}: {result.calmarRatio.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("winRate")}
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.winRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {result.winningTrades}W / {result.losingTrades}L
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Equity Curve */}
          <Card>
            <CardHeader>
              <CardTitle>{t("equityCurve")}</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicCandlestickChart data={chartData} height={400} />
            </CardContent>
          </Card>

          {/* Detailed Metrics & Monthly Returns */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("performanceMetrics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: t("totalTrades"),
                    value: result.totalTrades,
                    icon: Activity,
                  },
                  {
                    label: t("profitFactor"),
                    value: result.profitFactor.toFixed(2),
                    icon: TrendingUp,
                  },
                  {
                    label: t("avgWin"),
                    value: `+${result.avgWinPercent.toFixed(2)}%`,
                    icon: TrendingUp,
                    color: "text-green-500",
                  },
                  {
                    label: t("avgLoss"),
                    value: `-${result.avgLossPercent.toFixed(2)}%`,
                    icon: TrendingDown,
                    color: "text-red-500",
                  },
                  {
                    label: t("expectancy"),
                    value: formatCurrency(result.expectancy),
                    icon: Target,
                  },
                  {
                    label: t("avgDuration"),
                    value: `${result.avgTradeDuration.toFixed(1)} ${t("hours")}`,
                    icon: Clock,
                  },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className={cn("font-medium", metric.color)}>{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("monthlyReturns")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {result.monthlyReturns.slice(0, 12).map((mr, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg p-2 text-center text-xs transition-colors",
                        mr.return >= 0
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      )}
                    >
                      <div className="font-medium">{MONTH_NAMES[mr.month]}</div>
                      <div className="font-bold">{formatPercent(mr.return)}</div>
                      <div className="text-[10px] opacity-70">{mr.trades} {t("trades")}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trade List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("tradeHistory")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrades(!showTrades)}
              >
                {showTrades ? t("hideTrades") : t("showTrades", { count: result.trades.length })}
              </Button>
            </CardHeader>
            {showTrades && (
              <CardContent>
                <div className="rounded-md border max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("entryTime")}</TableHead>
                        <TableHead>{t("side")}</TableHead>
                        <TableHead className="text-right">{t("entry")}</TableHead>
                        <TableHead className="text-right">{t("exit")}</TableHead>
                        <TableHead className="text-right">{t("pnl")}</TableHead>
                        <TableHead>{t("reason")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.trades.slice(0, 50).map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="text-xs">
                            {formatTime(trade.entryTime)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                trade.side === "long"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                              )}
                            >
                              {trade.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${trade.entryPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${trade.exitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-mono text-xs",
                              trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {formatPercent(trade.pnlPercent)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {trade.reason.replace("_", " ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {result.trades.length > 50 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {t("showingTrades", { total: result.trades.length })}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("noResults")}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t("noResultsDesc")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
