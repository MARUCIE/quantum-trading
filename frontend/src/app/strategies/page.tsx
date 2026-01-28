"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStrategies } from "@/lib/api/hooks";
import { Plus, Play, Pause, Square, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type StrategyStatus = "active" | "paused" | "stopped" | "error";

const statusStyles: Record<
  StrategyStatus,
  { color: string; bgColor: string }
> = {
  active: { color: "text-green-500", bgColor: "bg-green-500/10" },
  paused: { color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  stopped: { color: "text-red-500", bgColor: "bg-red-500/10" },
  error: { color: "text-red-500", bgColor: "bg-red-500/10" },
};

export default function StrategiesPage() {
  const t = useTranslations("strategiesPage");
  const { data: strategies } = useStrategies();
  const strategyList = strategies ?? [];

  // Status labels with translations
  const getStatusLabel = (status: StrategyStatus) => {
    const labels: Record<StrategyStatus, string> = {
      active: t("statusActive"),
      paused: t("statusPaused"),
      stopped: t("statusStopped"),
      error: t("statusError"),
    };
    return labels[status];
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

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
          <Plus className="mr-2 h-4 w-4" />
          {t("newStrategy")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalStrategies")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategyList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("active")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {strategyList.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalPnl")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                strategyList.reduce((sum, s) => sum + s.pnl, 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              )}
            >
              {formatCurrency(strategyList.reduce((sum, s) => sum + s.pnl, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalTrades")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {strategyList.reduce((sum, s) => sum + s.tradesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategies Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allStrategies")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("symbols")}</TableHead>
                <TableHead className="text-right">{t("pnl")}</TableHead>
                <TableHead className="text-right">{t("sharpe")}</TableHead>
                <TableHead className="text-right">{t("maxDd")}</TableHead>
                <TableHead className="text-right">{t("winRate")}</TableHead>
                <TableHead className="text-right">{t("trades")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategyList.map((strategy) => {
                const styles = statusStyles[strategy.status];
                return (
                  <TableRow key={strategy.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {strategy.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{strategy.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(styles.color, styles.bgColor)}
                      >
                        {getStatusLabel(strategy.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {strategy.symbols.map((symbol) => (
                          <Badge
                            key={symbol}
                            variant="secondary"
                            className="text-xs"
                          >
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono",
                          strategy.pnl >= 0 ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {formatCurrency(strategy.pnl)}
                        <span className="ml-1 text-xs">
                          ({formatPercent(strategy.pnlPercent)})
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {strategy.sharpeRatio.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-500">
                      {strategy.maxDrawdown.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {strategy.winRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {strategy.tradesCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {strategy.status === "active" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Square className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
