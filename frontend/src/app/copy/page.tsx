"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Shield, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const signalProviders = [
  {
    id: "1",
    name: "Alpha Momentum",
    description: "Trend-following BTC strategy",
    subscribers: 245,
    pnl: 32.5,
    maxDrawdown: -8.2,
    sharpe: 2.1,
    status: "active",
  },
  {
    id: "2",
    name: "ETH Scalper",
    description: "High-frequency ETH trading",
    subscribers: 128,
    pnl: 18.3,
    maxDrawdown: -12.5,
    sharpe: 1.5,
    status: "active",
  },
  {
    id: "3",
    name: "Multi-Asset Arb",
    description: "Cross-exchange arbitrage",
    subscribers: 89,
    pnl: 12.8,
    maxDrawdown: -3.2,
    sharpe: 3.2,
    status: "paused",
  },
];

export default function CopyTradingPage() {
  const t = useTranslations("copyPage");

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

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
        <Button>
          <Copy className="mr-2 h-4 w-4" />
          {t("becomeProvider")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("activeProviders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalSubscribers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">462</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("signalsToday")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("avgProviderReturn")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+21.2%</div>
          </CardContent>
        </Card>
      </div>

      {/* Signal Providers */}
      <Card>
        <CardHeader>
          <CardTitle>{t("signalProviders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {signalProviders.map((provider) => (
              <div
                key={provider.id}
                className="rounded-lg border border-border p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      provider.status === "active"
                        ? "border-green-500/50 text-green-500"
                        : "border-yellow-500/50 text-yellow-500"
                    )}
                  >
                    {provider.status === "active" ? t("active") : t("paused")}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("pnl")}</p>
                    <p
                      className={cn(
                        "font-semibold",
                        provider.pnl >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {formatPercent(provider.pnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("maxDd")}</p>
                    <p className="font-semibold text-red-500">
                      {provider.maxDrawdown}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("sharpe")}</p>
                    <p className="font-semibold">{provider.sharpe}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("followers")}</p>
                    <p className="font-semibold">{provider.subscribers}</p>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  {t("follow")}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-center gap-4 py-4">
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h4 className="font-semibold">{t("riskManagement")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("riskManagementDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
