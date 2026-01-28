"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Shield,
  AlertTriangle,
  RefreshCw,
  Zap,
  BarChart3,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Strategy {
  id: string;
  name: string;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  correlation: number;
  locked: boolean;
  allocation: number;
  minAllocation: number;
  maxAllocation: number;
}

interface OptimizationResult {
  totalReturn: number;
  portfolioVolatility: number;
  portfolioSharpe: number;
  maxDrawdown: number;
  diversificationRatio: number;
}

// Optimization methods moved inside component to use translations

const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: "1",
    name: "BTC Momentum Alpha",
    expectedReturn: 45,
    volatility: 28,
    sharpeRatio: 1.6,
    maxDrawdown: 18,
    correlation: 1.0,
    locked: false,
    allocation: 30,
    minAllocation: 0,
    maxAllocation: 50,
  },
  {
    id: "2",
    name: "ETH Mean Reversion",
    expectedReturn: 38,
    volatility: 32,
    sharpeRatio: 1.2,
    maxDrawdown: 22,
    correlation: 0.72,
    locked: false,
    allocation: 25,
    minAllocation: 0,
    maxAllocation: 40,
  },
  {
    id: "3",
    name: "Cross-Asset Arbitrage",
    expectedReturn: 18,
    volatility: 8,
    sharpeRatio: 2.2,
    maxDrawdown: 5,
    correlation: 0.15,
    locked: false,
    allocation: 25,
    minAllocation: 10,
    maxAllocation: 40,
  },
  {
    id: "4",
    name: "Volatility Harvesting",
    expectedReturn: 25,
    volatility: 15,
    sharpeRatio: 1.7,
    maxDrawdown: 12,
    correlation: -0.2,
    locked: false,
    allocation: 20,
    minAllocation: 0,
    maxAllocation: 30,
  },
];

export default function AllocationPage() {
  const t = useTranslations("allocationPage");
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [totalCapital, setTotalCapital] = useState("1000000");
  const [riskBudget, setRiskBudget] = useState("20");
  const [optimizationMethod, setOptimizationMethod] = useState("risk_parity");
  const [optimizing, setOptimizing] = useState(false);

  const OPTIMIZATION_METHODS = [
    { value: "equal", label: t("equalWeight") },
    { value: "risk_parity", label: t("riskParity") },
    { value: "max_sharpe", label: t("maxSharpe") },
    { value: "min_variance", label: t("minVariance") },
    { value: "max_diversification", label: t("maxDiversification") },
  ];

  // Calculate total allocation
  const totalAllocation = useMemo(() => {
    return strategies.reduce((sum, s) => sum + s.allocation, 0);
  }, [strategies]);

  // Calculate portfolio metrics
  const portfolioMetrics: OptimizationResult = useMemo(() => {
    const weights = strategies.map((s) => s.allocation / 100);
    const returns = strategies.map((s) => s.expectedReturn);
    const vols = strategies.map((s) => s.volatility);

    // Weighted return
    const totalReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);

    // Simple portfolio volatility (ignoring correlations for simplicity)
    const portfolioVariance = weights.reduce(
      (sum, w, i) => sum + w * w * vols[i] * vols[i],
      0
    );
    const portfolioVolatility = Math.sqrt(portfolioVariance);

    // Portfolio Sharpe
    const portfolioSharpe = portfolioVolatility > 0 ? totalReturn / portfolioVolatility : 0;

    // Weighted max drawdown
    const maxDrawdown = weights.reduce(
      (sum, w, i) => sum + w * strategies[i].maxDrawdown,
      0
    );

    // Diversification ratio
    const weightedVolSum = weights.reduce((sum, w, i) => sum + w * vols[i], 0);
    const diversificationRatio =
      portfolioVolatility > 0 ? weightedVolSum / portfolioVolatility : 1;

    return {
      totalReturn,
      portfolioVolatility,
      portfolioSharpe,
      maxDrawdown,
      diversificationRatio,
    };
  }, [strategies]);

  // Update strategy allocation
  const updateAllocation = (id: string, allocation: number) => {
    setStrategies((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, allocation: Math.max(s.minAllocation, Math.min(s.maxAllocation, allocation)) }
          : s
      )
    );
  };

  // Toggle lock
  const toggleLock = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  // Run optimization
  const runOptimization = useCallback(async () => {
    setOptimizing(true);

    // Simulate optimization delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lockedTotal = strategies
      .filter((s) => s.locked)
      .reduce((sum, s) => sum + s.allocation, 0);
    const unlockedStrategies = strategies.filter((s) => !s.locked);
    const remainingBudget = 100 - lockedTotal;

    let newAllocations: number[];

    switch (optimizationMethod) {
      case "equal":
        newAllocations = unlockedStrategies.map(
          () => remainingBudget / unlockedStrategies.length
        );
        break;

      case "risk_parity":
        // Inverse volatility weighting
        const invVols = unlockedStrategies.map((s) => 1 / s.volatility);
        const invVolSum = invVols.reduce((a, b) => a + b, 0);
        newAllocations = invVols.map((iv) => (iv / invVolSum) * remainingBudget);
        break;

      case "max_sharpe":
        // Weight by Sharpe ratio
        const sharpes = unlockedStrategies.map((s) => Math.max(s.sharpeRatio, 0.1));
        const sharpeSum = sharpes.reduce((a, b) => a + b, 0);
        newAllocations = sharpes.map((sh) => (sh / sharpeSum) * remainingBudget);
        break;

      case "min_variance":
        // Inverse variance weighting
        const invVars = unlockedStrategies.map((s) => 1 / (s.volatility * s.volatility));
        const invVarSum = invVars.reduce((a, b) => a + b, 0);
        newAllocations = invVars.map((iv) => (iv / invVarSum) * remainingBudget);
        break;

      case "max_diversification":
        // Weight by inverse correlation
        const invCorrs = unlockedStrategies.map((s) => 1 / Math.max(Math.abs(s.correlation), 0.1));
        const invCorrSum = invCorrs.reduce((a, b) => a + b, 0);
        newAllocations = invCorrs.map((ic) => (ic / invCorrSum) * remainingBudget);
        break;

      default:
        newAllocations = unlockedStrategies.map(
          () => remainingBudget / unlockedStrategies.length
        );
    }

    // Apply allocations with constraints
    setStrategies((prev) => {
      let unlockedIndex = 0;
      return prev.map((s) => {
        if (s.locked) return s;
        const newAlloc = Math.max(
          s.minAllocation,
          Math.min(s.maxAllocation, newAllocations[unlockedIndex++])
        );
        return { ...s, allocation: Math.round(newAlloc * 10) / 10 };
      });
    });

    setOptimizing(false);
  }, [strategies, optimizationMethod]);

  // Normalize allocations to 100%
  const normalizeAllocations = () => {
    const total = strategies.reduce((sum, s) => sum + s.allocation, 0);
    if (total === 0) return;

    setStrategies((prev) =>
      prev.map((s) => ({
        ...s,
        allocation: Math.round((s.allocation / total) * 1000) / 10,
      }))
    );
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const capital = parseFloat(totalCapital) || 0;

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={normalizeAllocations}>
            {t("normalizeTo100")}
          </Button>
          <Button onClick={runOptimization} disabled={optimizing}>
            {optimizing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t("optimizing")}
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                {t("optimize")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="capital">{t("totalCapital")}</Label>
          <Input
            id="capital"
            type="number"
            value={totalCapital}
            onChange={(e) => setTotalCapital(e.target.value)}
            min={1000}
            step={10000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="riskBudget">{t("riskBudget")} (%)</Label>
          <Input
            id="riskBudget"
            type="number"
            value={riskBudget}
            onChange={(e) => setRiskBudget(e.target.value)}
            min={5}
            max={100}
            step={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="method">{t("optimizationMethod")}</Label>
          <Select
            id="method"
            value={optimizationMethod}
            onChange={(e) => setOptimizationMethod(e.target.value)}
          >
            {OPTIMIZATION_METHODS.map((m) => (
              <SelectOption key={m.value} value={m.value}>
                {m.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("expectedReturn")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatPercent(portfolioMetrics.totalReturn)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(capital * portfolioMetrics.totalReturn / 100)} {t("annually")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("portfolioVolatility")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(portfolioMetrics.portfolioVolatility)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("annualizedStdDev")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("sharpeRatio")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                portfolioMetrics.portfolioSharpe >= 1.5
                  ? "text-green-500"
                  : portfolioMetrics.portfolioSharpe >= 1
                  ? "text-yellow-500"
                  : "text-red-500"
              )}
            >
              {portfolioMetrics.portfolioSharpe.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("riskAdjustedReturn")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("maxDrawdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{formatPercent(portfolioMetrics.maxDrawdown)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(capital * portfolioMetrics.maxDrawdown / 100)} {t("atRisk")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("diversification")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                portfolioMetrics.diversificationRatio >= 1.5
                  ? "text-green-500"
                  : "text-yellow-500"
              )}
            >
              {portfolioMetrics.diversificationRatio.toFixed(2)}x
            </div>
            <p className="text-xs text-muted-foreground">
              {t("diversificationRatio")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Status */}
      {totalAllocation !== 100 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="font-medium text-yellow-500">
                {t("allocationTotal")}: {formatPercent(totalAllocation)}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {totalAllocation < 100
                  ? `${formatPercent(100 - totalAllocation)} ${t("unallocated")}`
                  : `${formatPercent(totalAllocation - 100)} ${t("overAllocated")}`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t("strategyAllocations")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{t("strategy")}</TableHead>
                  <TableHead className="text-right">{t("return")}</TableHead>
                  <TableHead className="text-right">{t("volatility")}</TableHead>
                  <TableHead className="text-right">{t("sharpe")}</TableHead>
                  <TableHead className="text-right">{t("maxDd")}</TableHead>
                  <TableHead className="text-right">{t("correlation")}</TableHead>
                  <TableHead className="w-32">{t("allocation")}</TableHead>
                  <TableHead className="text-right">{t("capital")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strategies.map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleLock(strategy.id)}
                      >
                        <Lock
                          className={cn(
                            "h-4 w-4",
                            strategy.locked ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("range")}: {strategy.minAllocation}% - {strategy.maxAllocation}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-500">
                      +{formatPercent(strategy.expectedReturn)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPercent(strategy.volatility)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {strategy.sharpeRatio.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-500">
                      -{formatPercent(strategy.maxDrawdown)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {strategy.correlation.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={strategy.allocation}
                          onChange={(e) =>
                            updateAllocation(strategy.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 h-8 text-right"
                          disabled={strategy.locked}
                          min={strategy.minAllocation}
                          max={strategy.maxAllocation}
                          step={1}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(capital * strategy.allocation / 100)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("allocationVisualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{strategy.name}</span>
                  <span className="font-mono">
                    {formatPercent(strategy.allocation)} ({formatCurrency(capital * strategy.allocation / 100)})
                  </span>
                </div>
                <div className="h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      strategy.locked ? "bg-primary/50" : "bg-primary"
                    )}
                    style={{ width: `${strategy.allocation}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total bar */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">{t("totalAllocation")}</span>
              <span
                className={cn(
                  "font-mono font-medium",
                  totalAllocation === 100
                    ? "text-green-500"
                    : totalAllocation < 100
                    ? "text-yellow-500"
                    : "text-red-500"
                )}
              >
                {formatPercent(totalAllocation)}
              </span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  totalAllocation === 100
                    ? "bg-green-500"
                    : totalAllocation < 100
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${Math.min(totalAllocation, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Notice */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-500">{t("riskManagementNotice")}</h4>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>- {t("riskNotice1")}</li>
              <li>- {t("riskNotice2")}</li>
              <li>- {t("riskNotice3")}</li>
              <li>- {t("riskNotice4")}</li>
              <li>- {t("riskNotice5")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
