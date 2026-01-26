"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useStrategyStore } from "@/lib/stores/strategy-store";
import {
  generateMockCandlestickData,
  mockRecentTrades,
  mockAllocation,
} from "@/lib/mock-data";
import {
  Wallet,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemo } from "react";

export default function OverviewPage() {
  const { stats, positions } = usePortfolioStore();
  const { strategies } = useStrategyStore();

  const chartData = useMemo(() => generateMockCandlestickData(90), []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const activeStrategies = strategies.filter((s) => s.status === "active");
  const totalStrategyPnl = strategies.reduce((sum, s) => sum + s.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your portfolio and trading activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Portfolio Value"
          value={formatCurrency(stats.totalValue)}
          change={stats.totalPnlPercent}
          changeLabel="all time"
          icon={Wallet}
          trend={stats.totalPnl >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Today's P&L"
          value={formatCurrency(stats.dayPnl)}
          change={stats.dayPnlPercent}
          changeLabel="vs yesterday"
          icon={stats.dayPnl >= 0 ? ArrowUpRight : ArrowDownRight}
          trend={stats.dayPnl >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Active Strategies"
          value={activeStrategies.length}
          icon={Activity}
          trend="neutral"
        />
        <StatsCard
          title="Strategy P&L"
          value={formatCurrency(totalStrategyPnl)}
          change={(totalStrategyPnl / 100000) * 100}
          changeLabel="realized"
          icon={TrendingUp}
          trend={totalStrategyPnl >= 0 ? "up" : "down"}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>BTC/USDT</CardTitle>
            <Tabs defaultValue="1D" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="1H" className="text-xs">
                  1H
                </TabsTrigger>
                <TabsTrigger value="4H" className="text-xs">
                  4H
                </TabsTrigger>
                <TabsTrigger value="1D" className="text-xs">
                  1D
                </TabsTrigger>
                <TabsTrigger value="1W" className="text-xs">
                  1W
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <CandlestickChart data={chartData} height={350} />
          </CardContent>
        </Card>

        {/* Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAllocation.map((asset) => (
                <div key={asset.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="text-sm font-medium">{asset.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {asset.value}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${asset.value}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions and Trades */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Positions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionsTable positions={positions} />
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTrades trades={mockRecentTrades} />
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{strategy.name}</h4>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      strategy.status === "active"
                        ? "bg-green-500"
                        : strategy.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {strategy.type}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        strategy.pnl >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(strategy.pnl)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {strategy.pnlPercent >= 0 ? "+" : ""}
                      {strategy.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {strategy.sharpeRatio.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Sharpe</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
