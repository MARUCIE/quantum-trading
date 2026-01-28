"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { useMemo } from "react";
import { useKlines, usePortfolioStats, useRecentTrades, useStrategies } from "@/lib/api/hooks";
import { useAssetClass, getPositionsByClass, type AssetClass } from "@/lib/assets";
import {
  Wallet,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useTranslations } from "next-intl";

// Default chart symbols per asset class
const DEFAULT_SYMBOLS: Record<AssetClass, string> = {
  crypto: 'BTC/USDT',
  stocks: 'AAPL',
  futures: 'ES',
  options: 'SPY',
};

export default function OverviewPage() {
  const t = useTranslations("dashboard");
  const tAsset = useTranslations("assetClass");
  const { assetClass } = useAssetClass();

  const { data: stats } = usePortfolioStats();
  const { data: strategies } = useStrategies();

  // Get positions based on selected asset class
  const positions = useMemo(() => {
    const assetPositions = getPositionsByClass(assetClass);
    // Convert MultiAssetPosition to Position format for table
    return assetPositions.map(p => ({
      symbol: p.symbol,
      side: p.side,
      quantity: p.quantity,
      entryPrice: p.entryPrice,
      currentPrice: p.currentPrice,
      markPrice: p.currentPrice, // Use current price as mark price
      unrealizedPnl: p.unrealizedPnl,
      unrealizedPnlPct: p.unrealizedPnlPct,
      leverage: p.leverage ?? 1,
      marginUsed: p.marginUsed ?? (p.entryPrice * p.quantity / (p.leverage ?? 1)),
    }));
  }, [assetClass]);

  // Get chart symbol based on asset class
  const chartSymbol = DEFAULT_SYMBOLS[assetClass];
  const chartApiSymbol = assetClass === 'crypto' ? 'BTCUSDT' : chartSymbol;

  const { data: klines } = useKlines(chartApiSymbol, "1d", 200);
  const { data: marketTrades } = useRecentTrades(chartApiSymbol, 10);

  const chartData = useMemo(() => {
    if (!klines) return [];
    return klines.map((bar) => ({
      time: Math.floor(bar.timestamp / 1000),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));
  }, [klines]);

  const allocation = useMemo(() => {
    if (positions.length === 0) return [];
    const total = positions.reduce(
      (sum, p) => sum + p.currentPrice * p.quantity,
      0
    );
    if (total <= 0) return [];
    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];
    return positions.map((position, index) => ({
      name: position.symbol,
      value: ((position.currentPrice * position.quantity) / total) * 100,
      color: colors[index % colors.length],
    }));
  }, [positions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const strategyList = strategies ?? [];
  const activeStrategies = strategyList.filter((s) => s.status === "active");
  const totalStrategyPnl = strategyList.reduce((sum, s) => sum + s.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={LayoutDashboard}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatsCard
          title={t("totalPortfolioValue")}
          value={formatCurrency(stats?.totalValue ?? 0)}
          change={stats?.totalPnlPercent ?? 0}
          changeLabel={t("allTime")}
          icon={Wallet}
          trend={(stats?.totalPnl ?? 0) >= 0 ? "up" : "down"}
        />
        <StatsCard
          title={t("todaysPnl")}
          value={formatCurrency(stats?.dayPnl ?? 0)}
          change={stats?.dayPnlPercent ?? 0}
          changeLabel={t("vsYesterday")}
          icon={(stats?.dayPnl ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight}
          trend={(stats?.dayPnl ?? 0) >= 0 ? "up" : "down"}
        />
        <StatsCard
          title={t("activeStrategies")}
          value={activeStrategies.length}
          icon={Activity}
          trend="neutral"
        />
        <StatsCard
          title={t("strategyPnl")}
          value={formatCurrency(totalStrategyPnl)}
          change={(totalStrategyPnl / 100000) * 100}
          changeLabel={t("realized")}
          icon={TrendingUp}
          trend={totalStrategyPnl >= 0 ? "up" : "down"}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{chartSymbol}</CardTitle>
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
            {chartData.length > 0 ? (
              <CandlestickChart data={chartData as any} height={350} />
            ) : (
              <EmptyState
                size="sm"
                title={t("noMarketData")}
                description={t("marketDataDesc")}
              />
            )}
          </CardContent>
        </Card>

        {/* Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>{t("assetAllocation")}</CardTitle>
          </CardHeader>
          <CardContent>
            {allocation.length > 0 ? (
              <div className="space-y-4">
                {allocation.map((asset) => (
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
                        {asset.value.toFixed(2)}%
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
            ) : (
              <EmptyState
                size="sm"
                title={t("noAllocationData")}
                description={t("allocationDataDesc")}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Positions and Trades */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Positions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("openPositions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {positions.length > 0 ? (
              <PositionsTable positions={positions} />
            ) : (
              <EmptyState
                size="sm"
                title={t("noOpenPositions")}
                description={t("positionsDesc")}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentTrades")}</CardTitle>
          </CardHeader>
          <CardContent>
            {marketTrades && marketTrades.length > 0 ? (
              <RecentTrades trades={marketTrades} />
            ) : (
              <EmptyState
                size="sm"
                title={t("noRecentTrades")}
                description={t("tradesDesc")}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("strategyPerformance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {strategyList.map((strategy) => (
              <div
                key={strategy.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{strategy.name}</h4>
                  <StatusIndicator
                    status={
                      strategy.status === "active"
                        ? "online"
                        : strategy.status === "paused"
                          ? "warning"
                          : "offline"
                    }
                    variant="dot"
                    pulse={strategy.status === "active"}
                    size="sm"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {strategy.type}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        strategy.pnl >= 0 ? "text-profit" : "text-loss"
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
                    <p className="text-xs text-muted-foreground">{t("sharpe")}</p>
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
