"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { generateMockCandlestickData, generateMockEquityCurve } from "@/lib/mock-data";
import { useMemo } from "react";
import { Play, Download, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const backtestResults = {
  totalReturn: 24.5,
  sharpeRatio: 1.85,
  maxDrawdown: -12.3,
  winRate: 58.2,
  profitFactor: 1.65,
  totalTrades: 342,
  avgTradeDuration: "4.2 hours",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
};

export default function BacktestPage() {
  const chartData = useMemo(() => generateMockCandlestickData(365), []);
  const equityCurve = useMemo(() => generateMockEquityCurve(365), []);

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backtest Results</h1>
          <p className="text-muted-foreground">
            Analyze historical strategy performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run Backtest
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                backtestResults.totalReturn >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatPercent(backtestResults.totalReturn)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backtestResults.sharpeRatio.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {backtestResults.maxDrawdown.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backtestResults.winRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <CandlestickChart data={chartData} height={400} />
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total Trades", value: backtestResults.totalTrades },
              { label: "Profit Factor", value: backtestResults.profitFactor.toFixed(2) },
              { label: "Avg Trade Duration", value: backtestResults.avgTradeDuration },
              { label: "Backtest Period", value: `${backtestResults.startDate} - ${backtestResults.endDate}` },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (month, i) => {
                  const value = (Math.random() - 0.4) * 10;
                  return (
                    <div
                      key={month}
                      className={cn(
                        "rounded-lg p-2 text-center text-xs",
                        value >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}
                    >
                      <div className="font-medium">{month}</div>
                      <div>{value >= 0 ? "+" : ""}{value.toFixed(1)}%</div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
