"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { AlertTriangle, Shield, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const riskMetrics = {
  var95: -4250.32,
  var99: -6780.45,
  cvar95: -5120.67,
  beta: 1.15,
  correlation: 0.82,
  sharpeRatio: 1.85,
  sortinoRatio: 2.12,
  maxDrawdown: -12.5,
  currentDrawdown: -3.2,
};

const riskLimits = [
  {
    name: "Position Size",
    current: 15,
    limit: 25,
    unit: "%",
    status: "ok",
  },
  {
    name: "Daily Loss",
    current: 2341.56,
    limit: 5000,
    unit: "$",
    status: "ok",
  },
  {
    name: "Leverage",
    current: 2.5,
    limit: 5,
    unit: "x",
    status: "ok",
  },
  {
    name: "Drawdown",
    current: 3.2,
    limit: 10,
    unit: "%",
    status: "warning",
  },
  {
    name: "Concentration",
    current: 45,
    limit: 50,
    unit: "%",
    status: "warning",
  },
  {
    name: "Open Orders",
    current: 8,
    limit: 20,
    unit: "",
    status: "ok",
  },
];

const alerts = [
  {
    id: "1",
    type: "warning",
    message: "BTC position approaching concentration limit (45%)",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "info",
    message: "Daily P&L at 47% of target",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "warning",
    message: "ETH Mean Reversion strategy drawdown at 5.4%",
    time: "1 hour ago",
  },
];

export default function RiskPage() {
  const { stats } = usePortfolioStore();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground">
            Monitor risk metrics and exposure limits
          </p>
        </div>
        <Button variant="outline">
          <Shield className="mr-2 h-4 w-4" />
          Configure Limits
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Value at Risk (95%)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(riskMetrics.var95)}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum expected daily loss
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Drawdown
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {riskMetrics.currentDrawdown}%
            </div>
            <p className="text-xs text-muted-foreground">
              Max: {riskMetrics.maxDrawdown}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sharpe Ratio
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {riskMetrics.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sortino: {riskMetrics.sortinoRatio.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Beta
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMetrics.beta}</div>
            <p className="text-xs text-muted-foreground">
              vs. BTC benchmark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Limits and Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskLimits.map((limit) => {
              const percentage = (limit.current / limit.limit) * 100;
              const isWarning = percentage >= 80;
              const isDanger = percentage >= 95;

              return (
                <div key={limit.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{limit.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {limit.current}
                      {limit.unit} / {limit.limit}
                      {limit.unit}
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
            <CardTitle>Risk Alerts</CardTitle>
            <Badge variant="outline">{alerts.length} active</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  alert.type === "warning"
                    ? "border-yellow-500/50 bg-yellow-500/5"
                    : "border-border"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-4 w-4 mt-0.5",
                    alert.type === "warning"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Dismiss
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Exposure Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Exposure Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">By Asset</h4>
              {[
                { name: "BTC", value: 45, color: "#f7931a" },
                { name: "ETH", value: 30, color: "#627eea" },
                { name: "SOL", value: 10, color: "#00ffa3" },
                { name: "Cash", value: 15, color: "#26a17b" },
              ].map((asset) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="flex-1 text-sm">{asset.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {asset.value}%
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">By Strategy</h4>
              {[
                { name: "Momentum", value: 35 },
                { name: "Mean Reversion", value: 25 },
                { name: "Arbitrage", value: 20 },
                { name: "Unallocated", value: 20 },
              ].map((strategy) => (
                <div key={strategy.name} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{strategy.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {strategy.value}%
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">By Direction</h4>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="flex-1 text-sm">Long</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="flex-1 text-sm">Short</span>
                <span className="text-sm text-muted-foreground">10%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="flex-1 text-sm">Cash</span>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
