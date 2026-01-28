"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("alertsPage");

  // Mock data with translation keys
  const alerts = [
    {
      id: "1",
      type: "warning",
      titleKey: "positionConcentrationWarning",
      messageKey: "positionConcentrationMessage",
      time: t("minAgo", { count: 2 }),
      read: false,
    },
    {
      id: "2",
      type: "info",
      titleKey: "strategyStarted",
      messageKey: "strategyStartedMessage",
      time: t("minAgo", { count: 15 }),
      read: false,
    },
    {
      id: "3",
      type: "success",
      titleKey: "orderFilled",
      messageKey: "orderFilledMessage",
      time: t("minAgo", { count: 32 }),
      read: true,
    },
    {
      id: "4",
      type: "warning",
      titleKey: "drawdownAlert",
      messageKey: "drawdownAlertMessage",
      time: t("hourAgo", { count: 1 }),
      read: true,
    },
    {
      id: "5",
      type: "info",
      titleKey: "marketOpen",
      messageKey: "marketOpenMessage",
      time: t("hoursAgo", { count: 3 }),
      read: true,
    },
  ];

  const alertRules = [
    { nameKey: "positionLimit", conditionKey: "positionLimitCondition", enabled: true },
    { nameKey: "dailyLoss", conditionKey: "dailyLossCondition", enabled: true },
    { nameKey: "drawdown", conditionKey: "drawdownCondition", enabled: true },
    { nameKey: "priceAlert", conditionKey: "priceAlertCondition", enabled: false },
  ];

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("unreadNotifications", { count: unreadCount })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">{t("markAllRead")}</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("createAlert")}
          </Button>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm">
          {t("all")}
        </Button>
        <Button variant="ghost" size="sm">
          <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
          {t("warnings")}
        </Button>
        <Button variant="ghost" size="sm">
          <Info className="mr-1 h-3 w-3 text-blue-500" />
          {t("info")}
        </Button>
        <Button variant="ghost" size="sm">
          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
          {t("success")}
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
                      <h4 className="font-medium">{t(alert.titleKey)}</h4>
                      {!alert.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(alert.messageKey)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("dismiss")}
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
          <CardTitle>{t("alertRules")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertRules.map((rule) => (
            <div
              key={rule.nameKey}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <h4 className="font-medium">{t(rule.nameKey)}</h4>
                <p className="text-xs text-muted-foreground">{t(rule.conditionKey)}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  rule.enabled
                    ? "border-green-500/50 text-green-500"
                    : "border-muted-foreground/50 text-muted-foreground"
                )}
              >
                {rule.enabled ? t("active") : t("disabled")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
