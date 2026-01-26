"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: "1",
    type: "warning",
    title: "Position Concentration Warning",
    message: "BTC position at 45% of portfolio, approaching 50% limit",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Strategy Started",
    message: "ETH Mean Reversion strategy has been activated",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Order Filled",
    message: "Buy order for 0.5 BTC filled at $43,245.50",
    time: "32 min ago",
    read: true,
  },
  {
    id: "4",
    type: "warning",
    title: "Drawdown Alert",
    message: "ML Factor Model drawdown at 15.6%, exceeding threshold",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "Market Open",
    message: "US markets are now open for trading",
    time: "3 hours ago",
    read: true,
  },
];

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/50",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/50",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/50",
  },
};

export default function AlertsPage() {
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Mark All Read</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm">
          All
        </Button>
        <Button variant="ghost" size="sm">
          <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
          Warnings
        </Button>
        <Button variant="ghost" size="sm">
          <Info className="mr-1 h-3 w-3 text-blue-500" />
          Info
        </Button>
        <Button variant="ghost" size="sm">
          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
          Success
        </Button>
      </div>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const config = alertConfig[alert.type as keyof typeof alertConfig];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                    !alert.read && "bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      {!alert.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Position Limit", condition: "Position > 50% of portfolio", enabled: true },
            { name: "Daily Loss", condition: "Daily P&L < -$5,000", enabled: true },
            { name: "Drawdown", condition: "Drawdown > 10%", enabled: true },
            { name: "Price Alert", condition: "BTC > $50,000", enabled: false },
          ].map((rule) => (
            <div
              key={rule.name}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <h4 className="font-medium">{rule.name}</h4>
                <p className="text-xs text-muted-foreground">{rule.condition}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  rule.enabled
                    ? "border-green-500/50 text-green-500"
                    : "border-muted-foreground/50 text-muted-foreground"
                )}
              >
                {rule.enabled ? "Active" : "Disabled"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
