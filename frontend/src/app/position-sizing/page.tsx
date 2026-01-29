"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Calculator,
  DollarSign,
  Percent,
  Target,
  AlertTriangle,
  TrendingUp,
  Info,
  Scale,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface PositionResult {
  method: string;
  positionSize: number;
  units: number;
  riskAmount: number;
  riskPercent: number;
  rewardAmount: number;
  rewardRatio: number;
  leverage: number;
}

export default function PositionSizingPage() {
  const t = useTranslations("positionSizingPage");

  // Position sizing methods - moved inside component for i18n
  const METHODS = [
    { value: "fixed-fractional", label: t("fixedFractional"), description: t("fixedFractionalDesc") },
    { value: "kelly", label: t("kellyCriterion"), description: t("kellyCriterionDesc") },
    { value: "half-kelly", label: t("halfKelly"), description: t("halfKellyDesc") },
    { value: "fixed-ratio", label: t("fixedRatio"), description: t("fixedRatioDesc") },
    { value: "percent-volatility", label: t("percentVolatility"), description: t("percentVolatilityDesc") },
  ];
  // Input states
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(43000);
  const [stopLoss, setStopLoss] = useState<number>(42500);
  const [takeProfit, setTakeProfit] = useState<number>(44500);
  const [winRate, setWinRate] = useState<number>(55);
  const [avgWin, setAvgWin] = useState<number>(3);
  const [avgLoss, setAvgLoss] = useState<number>(2);
  const [volatility, setVolatility] = useState<number>(2.5);
  const [method, setMethod] = useState<string>("fixed-fractional");

  // Calculate position sizing
  const calculations = useMemo(() => {
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const stopDistancePercent = (stopDistance / entryPrice) * 100;
    const profitDistance = Math.abs(takeProfit - entryPrice);
    const profitDistancePercent = (profitDistance / entryPrice) * 100;

    const riskAmount = accountBalance * (riskPercent / 100);
    const rewardRatio = profitDistance / stopDistance;

    // Calculate position sizes for each method
    const results: PositionResult[] = [];

    // 1. Fixed Fractional
    const fixedFractionalUnits = riskAmount / stopDistance;
    const fixedFractionalSize = fixedFractionalUnits * entryPrice;
    results.push({
      method: "Fixed Fractional",
      positionSize: fixedFractionalSize,
      units: fixedFractionalUnits,
      riskAmount,
      riskPercent,
      rewardAmount: fixedFractionalUnits * profitDistance,
      rewardRatio,
      leverage: fixedFractionalSize / accountBalance,
    });

    // 2. Kelly Criterion
    const winProb = winRate / 100;
    const lossProb = 1 - winProb;
    const payoffRatio = avgWin / avgLoss;
    const kellyPercent = winProb - (lossProb / payoffRatio);
    const kellyRiskAmount = accountBalance * Math.max(0, kellyPercent);
    const kellyUnits = kellyRiskAmount / stopDistance;
    const kellySize = kellyUnits * entryPrice;
    results.push({
      method: "Kelly Criterion",
      positionSize: kellySize,
      units: kellyUnits,
      riskAmount: kellyRiskAmount,
      riskPercent: kellyPercent * 100,
      rewardAmount: kellyUnits * profitDistance,
      rewardRatio,
      leverage: kellySize / accountBalance,
    });

    // 3. Half Kelly
    const halfKellyPercent = kellyPercent / 2;
    const halfKellyRiskAmount = accountBalance * Math.max(0, halfKellyPercent);
    const halfKellyUnits = halfKellyRiskAmount / stopDistance;
    const halfKellySize = halfKellyUnits * entryPrice;
    results.push({
      method: "Half Kelly",
      positionSize: halfKellySize,
      units: halfKellyUnits,
      riskAmount: halfKellyRiskAmount,
      riskPercent: halfKellyPercent * 100,
      rewardAmount: halfKellyUnits * profitDistance,
      rewardRatio,
      leverage: halfKellySize / accountBalance,
    });

    // 4. Fixed Ratio (simplified)
    const delta = accountBalance * 0.1; // 10% profit delta
    const fixedRatioMultiplier = 1 + Math.floor(accountBalance / delta) * 0.1;
    const fixedRatioRiskAmount = riskAmount * fixedRatioMultiplier;
    const fixedRatioUnits = fixedRatioRiskAmount / stopDistance;
    const fixedRatioSize = fixedRatioUnits * entryPrice;
    results.push({
      method: "Fixed Ratio",
      positionSize: fixedRatioSize,
      units: fixedRatioUnits,
      riskAmount: fixedRatioRiskAmount,
      riskPercent: (fixedRatioRiskAmount / accountBalance) * 100,
      rewardAmount: fixedRatioUnits * profitDistance,
      rewardRatio,
      leverage: fixedRatioSize / accountBalance,
    });

    // 5. Percent Volatility
    const volAdjustedRisk = riskPercent / (volatility / 2); // Normalize to 2% volatility
    const volRiskAmount = accountBalance * (volAdjustedRisk / 100);
    const volUnits = volRiskAmount / stopDistance;
    const volSize = volUnits * entryPrice;
    results.push({
      method: "Percent Volatility",
      positionSize: volSize,
      units: volUnits,
      riskAmount: volRiskAmount,
      riskPercent: volAdjustedRisk,
      rewardAmount: volUnits * profitDistance,
      rewardRatio,
      leverage: volSize / accountBalance,
    });

    return {
      results,
      stopDistancePercent,
      profitDistancePercent,
      rewardRatio,
      selected: results.find((r) => r.method.toLowerCase().replace(/\s+/g, "-") === method) || results[0],
    };
  }, [accountBalance, riskPercent, entryPrice, stopLoss, takeProfit, winRate, avgWin, avgLoss, volatility, method]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatUnits = (value: number, decimals: number = 6) => {
    if (value < 0.001) return value.toExponential(2);
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t("parameters")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Balance */}
            <div>
              <label className="text-sm font-medium">{t("accountBalance")}</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Risk Percent */}
            <div>
              <label className="text-sm font-medium">{t("riskPerTrade")}</label>
              <div className="relative mt-1">
                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.5"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Entry Price */}
            <div>
              <label className="text-sm font-medium">{t("entryPrice")}</label>
              <Input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="text-sm font-medium">{t("stopLoss")}</label>
              <div className="relative mt-1">
                <AlertTriangle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Take Profit */}
            <div>
              <label className="text-sm font-medium">{t("takeProfit")}</label>
              <div className="relative mt-1">
                <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                <Input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* Kelly Criterion Inputs */}
            <p className="text-sm font-medium text-muted-foreground">{t("kellyParameters")}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">{t("winRate")}</label>
                <Input
                  type="number"
                  value={winRate}
                  onChange={(e) => setWinRate(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">{t("volatility")}</label>
                <Input
                  type="number"
                  step="0.1"
                  value={volatility}
                  onChange={(e) => setVolatility(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">{t("avgWin")}</label>
                <Input
                  type="number"
                  step="0.5"
                  value={avgWin}
                  onChange={(e) => setAvgWin(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">{t("avgLoss")}</label>
                <Input
                  type="number"
                  step="0.5"
                  value={avgLoss}
                  onChange={(e) => setAvgLoss(Number(e.target.value))}
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* Method Selection */}
            <div>
              <label className="text-sm font-medium">{t("sizingMethod")}</label>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1"
              >
                {METHODS.map((m) => (
                  <SelectOption key={m.value} value={m.value}>
                    {m.label}
                  </SelectOption>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                {METHODS.find((m) => m.value === method)?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Method Result */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {calculations.selected.method}
                </span>
                <Badge variant="default">{t("selected")}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t("positionSize")}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calculations.selected.positionSize)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t("units")}</p>
                  <p className="text-2xl font-bold">
                    {formatUnits(calculations.selected.units, 4)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t("riskAmount")}</p>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(calculations.selected.riskAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {calculations.selected.riskPercent.toFixed(2)}% {t("ofAccount")}
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">{t("potentialReward")}</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(calculations.selected.rewardAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {calculations.selected.rewardRatio.toFixed(2)}R
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t("stopDistance")}:</span>
                  <Badge variant="outline" className="text-red-500">
                    {calculations.stopDistancePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t("profitDistance")}:</span>
                  <Badge variant="outline" className="text-green-500">
                    {calculations.profitDistancePercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t("leverage")}:</span>
                  <Badge variant="outline">
                    {calculations.selected.leverage.toFixed(2)}x
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Methods Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("methodComparison")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-medium">{t("method")}</th>
                      <th className="p-3 text-right font-medium">{t("position")}</th>
                      <th className="p-3 text-right font-medium">{t("units")}</th>
                      <th className="p-3 text-right font-medium">{t("risk")}</th>
                      <th className="p-3 text-right font-medium">{t("riskPercent")}</th>
                      <th className="p-3 text-right font-medium">{t("reward")}</th>
                      <th className="p-3 text-right font-medium">{t("leverage")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.results.map((result) => (
                      <tr
                        key={result.method}
                        className={cn(
                          "border-b hover:bg-muted/50",
                          result.method.toLowerCase().replace(/\s+/g, "-") === method && "bg-primary/5"
                        )}
                      >
                        <td className="p-3 font-medium">{result.method}</td>
                        <td className="p-3 text-right font-mono">
                          {formatCurrency(result.positionSize)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatUnits(result.units, 4)}
                        </td>
                        <td className="p-3 text-right font-mono text-red-500">
                          {formatCurrency(result.riskAmount)}
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={result.riskPercent > 5 ? "destructive" : "outline"}>
                            {result.riskPercent.toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono text-green-500">
                          {formatCurrency(result.rewardAmount)}
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={result.leverage > 5 ? "destructive" : "outline"}>
                            {result.leverage.toFixed(2)}x
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Method Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("methodGuide")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("fixedFractional")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("fixedFractionalDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("kellyCriterion")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("kellyCriterionDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Scale className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("halfKelly")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("halfKellyDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("percentVolatility")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("percentVolatilityDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
