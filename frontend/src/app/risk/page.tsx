"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAccount,
  usePortfolioStats,
  usePositions,
  useRiskEvents,
  useRiskLimits,
  useRiskMetrics,
} from "@/lib/api/hooks";
import { AlertTriangle, Shield, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function RiskPage() {
  const t = useTranslations("riskPage");
  const { data: stats } = usePortfolioStats();
  const { data: account } = useAccount();
  const { data: positions } = usePositions();
  const { data: metrics } = useRiskMetrics();
  const { data: events } = useRiskEvents(20);
  const { data: limits } = useRiskLimits();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const totalEquity = stats?.totalValue ?? 0;
  const positionsValue =
    positions?.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0) ?? 0;
  const largestPosition =
    positions?.reduce(
      (max, p) => Math.max(max, p.currentPrice * p.quantity),
      0
    ) ?? 0;

  const riskLimits = [
    {
      name: t("positionExposure"),
      current: totalEquity > 0 ? (largestPosition / totalEquity) * 100 : 0,
      limit: limits?.trade?.maxPositionPct
        ? limits.trade.maxPositionPct * 100
        : 0,
      unit: "%",
    },
    {
      name: t("dailyLoss"),
      current: Math.abs(Math.min(0, stats?.dayPnl ?? 0)),
      limit: limits?.account?.dailyLossLimitPct
        ? limits.account.dailyLossLimitPct * totalEquity
        : 0,
      unit: "$",
    },
    {
      name: t("leverage"),
      current:
        account?.margin && account.margin > 0
          ? account.totalEquity / account.margin
          : 0,
      limit: limits?.account?.maxLeverage ?? 0,
      unit: "x",
    },
    {
      name: t("drawdown"),
      current: metrics?.currentDrawdown ?? 0,
      limit: limits?.account?.maxDrawdownPct
        ? limits.account.maxDrawdownPct * 100
        : 0,
      unit: "%",
    },
  ];

  const assetExposure = useMemo(() => {
    if (!positions || totalEquity <= 0) return [];
    const exposures = positions.map((p) => ({
      name: p.symbol,
      value: (p.currentPrice * p.quantity) / totalEquity * 100,
    }));
    const cashPct = Math.max(0, 100 - exposures.reduce((sum, e) => sum + e.value, 0));
    return [...exposures, { name: "Cash", value: cashPct }];
  }, [positions, totalEquity]);

  const directionExposure = useMemo(() => {
    if (!positions || totalEquity <= 0) {
      return { long: 0, short: 0, cash: 100 };
    }
    const longValue = positions
      .filter((p) => p.side === "long")
      .reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
    const shortValue = positions
      .filter((p) => p.side === "short")
      .reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
    const cashValue = Math.max(0, totalEquity - longValue - shortValue);
    return {
      long: (longValue / totalEquity) * 100,
      short: (shortValue / totalEquity) * 100,
      cash: (cashValue / totalEquity) * 100,
    };
  }, [positions, totalEquity]);

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
        <Button variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          {t("configureLimits")}
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("valueAtRisk")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(metrics?.dailyVaR ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("maxExpectedLoss")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("currentDrawdown")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {(metrics?.currentDrawdown ?? 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("max")}: {(metrics?.maxDrawdown ?? 0).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("sharpeRatio")}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {(metrics?.sharpeRatio ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sortino: 0.00
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("marginLevel")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.marginLevel ?? 0).toFixed(2)}x
            </div>
            <p className="text-xs text-muted-foreground">
              {t("equityMargin")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Limits and Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Limits */}
        <Card>
          <CardHeader>
            <CardTitle>{t("riskLimits")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskLimits.map((limit) => {
              const percentage = limit.limit > 0 ? (limit.current / limit.limit) * 100 : 0;
              const isWarning = percentage >= 80;
              const isDanger = percentage >= 95;

              return (
                <div key={limit.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{limit.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {limit.unit === "$"
                        ? formatCurrency(limit.current)
                        : `${limit.current.toFixed(2)}${limit.unit}`}
                      {" / "}
                      {limit.unit === "$"
                        ? formatCurrency(limit.limit)
                        : `${limit.limit.toFixed(2)}${limit.unit}`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isDanger
                          ? "bg-red-500"
                          : isWarning
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("riskAlerts")}</CardTitle>
            <Badge variant="outline">{events?.length ?? 0} {t("active")}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {events && events.length > 0 ? (
              events.map((event) => (
                <div
                  key={`${event.timestamp}-${event.message}`}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    event.level === "warning"
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : event.level === "critical"
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-border"
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4 mt-0.5",
                      event.level === "warning"
                        ? "text-yellow-500"
                        : event.level === "critical"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("dismiss")}
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                size="sm"
                title={t("noRiskEvents")}
                description={t("riskAlertsDesc")}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exposure Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t("exposureBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("byAsset")}</h4>
              {assetExposure.length > 0 ? (
                assetExposure.map((asset) => (
                  <div key={asset.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                    <span className="flex-1 text-sm">{asset.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {asset.value.toFixed(2)}%
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  size="sm"
                  title={t("noExposureData")}
                  description={t("openPositionsToSee")}
                />
              )}
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("byStrategy")}</h4>
              <EmptyState
                size="sm"
                title={t("noStrategyExposure")}
                description={t("strategyExposureDesc")}
              />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("byDirection")}</h4>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="flex-1 text-sm">{t("long")}</span>
                <span className="text-sm text-muted-foreground">
                  {directionExposure.long.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="flex-1 text-sm">{t("short")}</span>
                <span className="text-sm text-muted-foreground">
                  {directionExposure.short.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="flex-1 text-sm">{t("cash")}</span>
                <span className="text-sm text-muted-foreground">
                  {directionExposure.cash.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
