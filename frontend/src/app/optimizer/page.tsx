"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Target,
  Zap,
  Settings2,
  BarChart3,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface ParameterRange {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  current: number;
}

interface OptimizationResult {
  id: string;
  params: Record<string, number>;
  sharpeRatio: number;
  totalReturn: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  score: number;
}

interface OptimizationConfig {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  objective: "sharpe" | "return" | "drawdown" | "winrate";
  parameters: ParameterRange[];
}

const STRATEGIES = [
  { id: "1", name: "BTC Momentum Alpha" },
  { id: "2", name: "ETH Mean Reversion" },
  { id: "3", name: "Cross-Market Arbitrage" },
];

export default function OptimizerPage() {
  const t = useTranslations("optimizerPage");

  const OBJECTIVES = [
    { value: "sharpe", label: t("maximizeSharpeRatio") },
    { value: "return", label: t("maximizeTotalReturn") },
    { value: "drawdown", label: t("minimizeMaxDrawdown") },
    { value: "winrate", label: t("maximizeWinRate") },
  ];

  const DEFAULT_PARAMETERS: ParameterRange[] = [
    { name: "lookback", label: t("lookbackPeriod"), min: 5, max: 50, step: 5, current: 20 },
    { name: "threshold", label: t("entryThreshold"), min: 0.5, max: 3.0, step: 0.25, current: 1.5 },
    { name: "stopLoss", label: t("stopLossPercent"), min: 1, max: 10, step: 0.5, current: 3 },
    { name: "takeProfit", label: t("takeProfitPercent"), min: 2, max: 20, step: 1, current: 6 },
  ];
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<OptimizationResult | null>(null);

  // Config state
  const [strategyId, setStrategyId] = useState("1");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [objective, setObjective] = useState<"sharpe" | "return" | "drawdown" | "winrate">("sharpe");
  const [parameters, setParameters] = useState<ParameterRange[]>(DEFAULT_PARAMETERS);

  // Calculate total combinations
  const totalCombinations = useMemo(() => {
    return parameters.reduce((acc, param) => {
      const steps = Math.floor((param.max - param.min) / param.step) + 1;
      return acc * steps;
    }, 1);
  }, [parameters]);

  // Update parameter range
  const updateParameter = (index: number, field: keyof ParameterRange, value: number) => {
    setParameters((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Run optimization (mock implementation)
  const runOptimization = async () => {
    setRunning(true);
    setProgress(0);
    setResults([]);

    // Simulate optimization with mock results
    const mockResults: OptimizationResult[] = [];
    const steps = 20;

    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(((i + 1) / steps) * 100);

      // Generate mock result
      const result: OptimizationResult = {
        id: `opt-${i + 1}`,
        params: {
          lookback: parameters[0].min + Math.random() * (parameters[0].max - parameters[0].min),
          threshold: parameters[1].min + Math.random() * (parameters[1].max - parameters[1].min),
          stopLoss: parameters[2].min + Math.random() * (parameters[2].max - parameters[2].min),
          takeProfit: parameters[3].min + Math.random() * (parameters[3].max - parameters[3].min),
        },
        sharpeRatio: 0.5 + Math.random() * 2.5,
        totalReturn: -10 + Math.random() * 80,
        maxDrawdown: 5 + Math.random() * 25,
        winRate: 40 + Math.random() * 30,
        trades: 50 + Math.floor(Math.random() * 150),
        score: 0,
      };

      // Calculate score based on objective
      switch (objective) {
        case "sharpe":
          result.score = result.sharpeRatio;
          break;
        case "return":
          result.score = result.totalReturn;
          break;
        case "drawdown":
          result.score = -result.maxDrawdown;
          break;
        case "winrate":
          result.score = result.winRate;
          break;
      }

      mockResults.push(result);
      setResults([...mockResults].sort((a, b) => b.score - a.score));
    }

    setRunning(false);
  };

  // Reset optimization
  const resetOptimization = () => {
    setResults([]);
    setProgress(0);
    setSelectedResult(null);
  };

  // Apply best parameters
  const applyParameters = (result: OptimizationResult) => {
    setSelectedResult(result);
    // In a real app, this would update the strategy configuration
  };

  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  const formatNumber = (value: number, decimals: number = 2) => value.toFixed(decimals);

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
          {results.length > 0 && (
            <Button variant="outline" onClick={resetOptimization}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("reset")}
            </Button>
          )}
          <Button onClick={runOptimization} disabled={running}>
            {running ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                {t("running")} {progress.toFixed(0)}%
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {t("startOptimization")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strategy Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              {t("strategyConfiguration")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strategy">{t("strategy")}</Label>
                <Select
                  id="strategy"
                  value={strategyId}
                  onChange={(e) => setStrategyId(e.target.value)}
                >
                  {STRATEGIES.map((s) => (
                    <SelectOption key={s.id} value={s.id}>
                      {s.name}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">{t("symbol")}</Label>
                <Select
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                >
                  <SelectOption value="BTC/USDT">BTC/USDT</SelectOption>
                  <SelectOption value="ETH/USDT">ETH/USDT</SelectOption>
                  <SelectOption value="SOL/USDT">SOL/USDT</SelectOption>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">{t("optimizationObjective")}</Label>
              <Select
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value as typeof objective)}
              >
                {OBJECTIVES.map((obj) => (
                  <SelectOption key={obj.value} value={obj.value}>
                    {obj.label}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Parameter Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {t("parameterRanges")}
              </div>
              <Badge variant="secondary">
                {totalCombinations.toLocaleString()} {t("combinations")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parameters.map((param, index) => (
                <div key={param.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{param.label}</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(param.min)} - {formatNumber(param.max)} (step: {formatNumber(param.step)})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={param.min}
                      onChange={(e) => updateParameter(index, "min", parseFloat(e.target.value))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={param.max}
                      onChange={(e) => updateParameter(index, "max", parseFloat(e.target.value))}
                      placeholder="Max"
                    />
                    <Input
                      type="number"
                      value={param.step}
                      onChange={(e) => updateParameter(index, "step", parseFloat(e.target.value))}
                      placeholder="Step"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {running && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("runningOptimization")}
                </span>
                <span>{progress.toFixed(0)}% {t("complete")}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Top Results Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            {results.slice(0, 4).map((result, index) => (
              <Card
                key={result.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent",
                  selectedResult?.id === result.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedResult(result)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {index === 0 && <Target className="h-4 w-4 text-yellow-500" />}
                      #{index + 1}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        index === 0 && "bg-yellow-500/10 text-yellow-500"
                      )}
                    >
                      {t("score")}: {formatNumber(result.score)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("sharpe")}</span>
                      <span className="font-medium">{formatNumber(result.sharpeRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("return")}</span>
                      <span
                        className={cn(
                          "font-medium",
                          result.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {formatPercent(result.totalReturn)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("maxDd")}</span>
                      <span className="font-medium text-red-500">
                        -{formatNumber(result.maxDrawdown)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Result Details */}
          {selectedResult && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    {t("selectedParameters")}
                  </div>
                  <Button size="sm" onClick={() => applyParameters(selectedResult)}>
                    {t("applyToStrategy")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">{t("parameters")}</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedResult.params).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-mono">{formatNumber(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t("performance")}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("sharpeRatio")}</span>
                        <span className="font-medium">{formatNumber(selectedResult.sharpeRatio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("totalReturn")}</span>
                        <span
                          className={cn(
                            "font-medium",
                            selectedResult.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {formatPercent(selectedResult.totalReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("maxDrawdown")}</span>
                        <span className="font-medium text-red-500">
                          -{formatNumber(selectedResult.maxDrawdown)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("winRate")}</span>
                        <span className="font-medium">{formatNumber(selectedResult.winRate)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("totalTrades")}</span>
                        <span className="font-medium">{selectedResult.trades}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("allResults")} ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{t("lookback")}</TableHead>
                      <TableHead>{t("threshold")}</TableHead>
                      <TableHead>{t("stopLoss")}</TableHead>
                      <TableHead>{t("takeProfit")}</TableHead>
                      <TableHead className="text-right">{t("sharpe")}</TableHead>
                      <TableHead className="text-right">{t("return")}</TableHead>
                      <TableHead className="text-right">{t("maxDd")}</TableHead>
                      <TableHead className="text-right">{t("winRate")}</TableHead>
                      <TableHead className="text-right">{t("score")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow
                        key={result.id}
                        className={cn(
                          "cursor-pointer",
                          selectedResult?.id === result.id && "bg-accent"
                        )}
                        onClick={() => setSelectedResult(result)}
                      >
                        <TableCell className="font-medium">
                          {index === 0 ? (
                            <Target className="h-4 w-4 text-yellow-500" />
                          ) : (
                            index + 1
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatNumber(result.params.lookback, 0)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatNumber(result.params.threshold)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatNumber(result.params.stopLoss)}%
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatNumber(result.params.takeProfit)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatNumber(result.sharpeRatio)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono text-xs",
                            result.totalReturn >= 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {formatPercent(result.totalReturn)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-red-500">
                          -{formatNumber(result.maxDrawdown)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatNumber(result.winRate)}%
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatNumber(result.score)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {results.length === 0 && !running && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("readyToOptimize")}</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {t("readyToOptimizeDesc")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Warning Notice */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-500">{t("overfittingWarning")}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("overfittingWarningDesc")}
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>- {t("outOfSampleTesting")}</li>
              <li>- {t("walkForwardAnalysis")}</li>
              <li>- {t("monteCarloSimulations")}</li>
              <li>- {t("paperTrading")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
