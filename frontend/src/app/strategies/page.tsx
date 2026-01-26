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
import { useStrategyStore, StrategyStatus } from "@/lib/stores/strategy-store";
import { Plus, Play, Pause, Square, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  StrategyStatus,
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: "Active",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  paused: {
    label: "Paused",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  stopped: {
    label: "Stopped",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  error: { label: "Error", color: "text-red-500", bgColor: "bg-red-500/10" },
};

export default function StrategiesPage() {
  const { strategies } = useStrategyStore();

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
          <h1 className="text-2xl font-bold tracking-tight">Strategies</h1>
          <p className="text-muted-foreground">
            Manage and monitor your trading strategies
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {strategies.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                strategies.reduce((sum, s) => sum + s.pnl, 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              )}
            >
              {formatCurrency(strategies.reduce((sum, s) => sum + s.pnl, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {strategies.reduce((sum, s) => sum + s.tradesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Symbols</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Sharpe</TableHead>
                <TableHead className="text-right">Max DD</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => {
                const status = statusConfig[strategy.status];
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
                        className={cn(status.color, status.bgColor)}
                      >
                        {status.label}
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
