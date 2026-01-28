"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  Layers,
  Settings,
  Download,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface WalkForwardWindow {
  id: number;
  trainStart: string;
  trainEnd: string;
  testStart: string;
  testEnd: string;
  trainSamples: number;
  testSamples: number;
  status: "pending" | "training" | "testing" | "complete" | "failed";
  metrics?: {
    trainAccuracy: number;
    testAccuracy: number;
    sharpe: number;
    returns: number;
    maxDD: number;
    trades: number;
  };
}

interface BacktestConfig {
  model: string;
  totalWindows: number;
  trainRatio: number;
  testRatio: number;
  stepSize: string;
  startDate: string;
  endDate: string;
}

// Generate mock windows
function generateMockWindows(count: number): WalkForwardWindow[] {
  const windows: WalkForwardWindow[] = [];
  const startYear = 2023;

  for (let i = 0; i < count; i++) {
    const trainMonths = 6;
    const testMonths = 2;
    const trainStart = new Date(startYear, i * 2, 1);
    const trainEnd = new Date(startYear, i * 2 + trainMonths, 0);
    const testStart = new Date(startYear, i * 2 + trainMonths, 1);
    const testEnd = new Date(startYear, i * 2 + trainMonths + testMonths, 0);

    const isComplete = i < count - 2;
    const isCurrent = i === count - 2;

    windows.push({
      id: i + 1,
      trainStart: trainStart.toISOString().split("T")[0],
      trainEnd: trainEnd.toISOString().split("T")[0],
      testStart: testStart.toISOString().split("T")[0],
      testEnd: testEnd.toISOString().split("T")[0],
      trainSamples: 15000 + Math.floor(Math.random() * 5000),
      testSamples: 5000 + Math.floor(Math.random() * 2000),
      status: isComplete ? "complete" : isCurrent ? "testing" : "pending",
      metrics: isComplete || isCurrent
        ? {
            trainAccuracy: 72 + Math.random() * 10,
            testAccuracy: 58 + Math.random() * 15,
            sharpe: 1.2 + Math.random() * 1.2,
            returns: 5 + Math.random() * 20,
            maxDD: -(5 + Math.random() * 15),
            trades: 50 + Math.floor(Math.random() * 100),
          }
        : undefined,
    });
  }

  return windows;
}

export default function ModelBacktestPage() {
  const t = useTranslations("modelBacktestPage");

  const MODELS = [
    "BTC Trend Predictor",
    "ETH Volatility Forecast",
    "Multi-Asset RL Agent",
    "Sentiment Analyzer",
  ];
  const [windows, setWindows] = useState<WalkForwardWindow[]>(() => generateMockWindows(8));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<WalkForwardWindow | null>(null);
  const [config, setConfig] = useState<BacktestConfig>({
    model: "BTC Trend Predictor",
    totalWindows: 8,
    trainRatio: 75,
    testRatio: 25,
    stepSize: "2M",
    startDate: "2023-01-01",
    endDate: "2024-12-31",
  });

  const aggregateMetrics = useMemo(() => {
    const completeWindows = windows.filter((w) => w.status === "complete" && w.metrics);
    if (completeWindows.length === 0) return null;

    const metrics = completeWindows.map((w) => w.metrics!);
    return {
      avgTrainAccuracy: metrics.reduce((sum, m) => sum + m.trainAccuracy, 0) / metrics.length,
      avgTestAccuracy: metrics.reduce((sum, m) => sum + m.testAccuracy, 0) / metrics.length,
      avgSharpe: metrics.reduce((sum, m) => sum + m.sharpe, 0) / metrics.length,
      totalReturns: metrics.reduce((sum, m) => sum + m.returns, 0),
      worstDD: Math.min(...metrics.map((m) => m.maxDD)),
      totalTrades: metrics.reduce((sum, m) => sum + m.trades, 0),
      consistencyScore: (metrics.filter((m) => m.testAccuracy > 55).length / metrics.length) * 100,
      overfitRatio: metrics.reduce((sum, m) => sum + (m.trainAccuracy - m.testAccuracy), 0) / metrics.length,
    };
  }, [windows]);

  const getStatusIcon = (status: WalkForwardWindow["status"]) => {
    switch (status) {
      case "complete": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "training": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "testing": return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: WalkForwardWindow["status"]) => {
    switch (status) {
      case "complete": return "bg-green-500/10 text-green-500";
      case "training": return "bg-blue-500/10 text-blue-500";
      case "testing": return "bg-yellow-500/10 text-yellow-500";
      case "failed": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button variant="outline" onClick={() => setIsRunning(false)}>
              <Pause className="mr-2 h-4 w-4" />
              {t("pause")}
            </Button>
          ) : (
            <Button onClick={() => setIsRunning(true)}>
              <Play className="mr-2 h-4 w-4" />
              {t("runBacktest")}
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("backtestConfiguration")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("model")}</label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("windows")}</label>
              <Input
                type="number"
                value={config.totalWindows}
                onChange={(e) => setConfig((prev) => ({ ...prev, totalWindows: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("trainPercent")}</label>
              <Input
                type="number"
                value={config.trainRatio}
                onChange={(e) => setConfig((prev) => ({ ...prev, trainRatio: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("stepSize")}</label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={config.stepSize}
                onChange={(e) => setConfig((prev) => ({ ...prev, stepSize: e.target.value }))}
              >
                <option value="1M">{t("month1")}</option>
                <option value="2M">{t("months2")}</option>
                <option value="3M">{t("months3")}</option>
                <option value="6M">{t("months6")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("start")}</label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("end")}</label>
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Results */}
      {aggregateMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  aggregateMetrics.avgTestAccuracy >= 60 ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <Target className={cn(
                    "h-5 w-5",
                    aggregateMetrics.avgTestAccuracy >= 60 ? "text-green-500" : "text-yellow-500"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("avgTestAccuracy")}</p>
                  <p className={cn(
                    "text-xl font-bold",
                    aggregateMetrics.avgTestAccuracy >= 60 ? "text-green-500" : "text-yellow-500"
                  )}>
                    {aggregateMetrics.avgTestAccuracy.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  aggregateMetrics.avgSharpe >= 1.5 ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <TrendingUp className={cn(
                    "h-5 w-5",
                    aggregateMetrics.avgSharpe >= 1.5 ? "text-green-500" : "text-yellow-500"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("avgSharpe")}</p>
                  <p className={cn(
                    "text-xl font-bold",
                    aggregateMetrics.avgSharpe >= 1.5 ? "text-green-500" : "text-yellow-500"
                  )}>
                    {aggregateMetrics.avgSharpe.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  aggregateMetrics.consistencyScore >= 70 ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  <CheckCircle className={cn(
                    "h-5 w-5",
                    aggregateMetrics.consistencyScore >= 70 ? "text-green-500" : "text-yellow-500"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("consistency")}</p>
                  <p className={cn(
                    "text-xl font-bold",
                    aggregateMetrics.consistencyScore >= 70 ? "text-green-500" : "text-yellow-500"
                  )}>
                    {aggregateMetrics.consistencyScore.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  aggregateMetrics.overfitRatio <= 10 ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  <AlertTriangle className={cn(
                    "h-5 w-5",
                    aggregateMetrics.overfitRatio <= 10 ? "text-green-500" : "text-red-500"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("overfitGap")}</p>
                  <p className={cn(
                    "text-xl font-bold",
                    aggregateMetrics.overfitRatio <= 10 ? "text-green-500" : "text-red-500"
                  )}>
                    {aggregateMetrics.overfitRatio.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Walk-Forward Windows */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t("walkForwardWindows")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Timeline visualization */}
              <div className="mb-6 p-4 bg-muted/30 rounded-lg overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                  {windows.map((window, index) => (
                    <div key={window.id} className="flex items-center">
                      <div
                        className={cn(
                          "flex flex-col items-center cursor-pointer transition-transform hover:scale-105",
                          selectedWindow?.id === window.id && "scale-105"
                        )}
                        onClick={() => setSelectedWindow(window)}
                      >
                        {/* Train period */}
                        <div
                          className={cn(
                            "h-6 rounded-l",
                            window.status === "complete" ? "bg-blue-500" : "bg-blue-500/30"
                          )}
                          style={{ width: "48px" }}
                        />
                        {/* Test period */}
                        <div
                          className={cn(
                            "h-6 rounded-r mt-1",
                            window.status === "complete"
                              ? "bg-green-500"
                              : window.status === "testing"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-green-500/30"
                          )}
                          style={{ width: "16px" }}
                        />
                        <span className="text-xs mt-1 text-muted-foreground">W{window.id}</span>
                      </div>
                      {index < windows.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>{t("training")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>{t("testingOOS")}</span>
                  </div>
                </div>
              </div>

              {/* Windows List */}
              <div className="space-y-2">
                {windows.map((window) => (
                  <div
                    key={window.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedWindow?.id === window.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedWindow(window)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(window.status)}
                        <span className="font-medium">{t("window")} {window.id}</span>
                        <Badge variant="outline" className={getStatusColor(window.status)}>
                          {t(window.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{window.trainStart} - {window.testEnd}</span>
                        {window.metrics && (
                          <span className={cn(
                            "font-medium",
                            window.metrics.testAccuracy >= 55 ? "text-green-500" : "text-red-500"
                          )}>
                            {window.metrics.testAccuracy.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Window Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {selectedWindow ? t("windowDetails", { id: selectedWindow.id }) : t("selectAWindow")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWindow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <p className="text-xs text-muted-foreground mb-1">{t("trainingPeriod")}</p>
                      <p className="text-sm font-medium">{selectedWindow.trainStart}</p>
                      <p className="text-sm font-medium">{selectedWindow.trainEnd}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedWindow.trainSamples.toLocaleString()} {t("samples")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <p className="text-xs text-muted-foreground mb-1">{t("testingPeriod")}</p>
                      <p className="text-sm font-medium">{selectedWindow.testStart}</p>
                      <p className="text-sm font-medium">{selectedWindow.testEnd}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedWindow.testSamples.toLocaleString()} {t("samples")}
                      </p>
                    </div>
                  </div>

                  {selectedWindow.metrics && (
                    <>
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">{t("performanceMetrics")}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("trainAccuracy")}</span>
                            <span className="font-medium">{selectedWindow.metrics.trainAccuracy.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("testAccuracy")}</span>
                            <span className={cn(
                              "font-medium",
                              selectedWindow.metrics.testAccuracy >= 55 ? "text-green-500" : "text-red-500"
                            )}>
                              {selectedWindow.metrics.testAccuracy.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("overfitGap")}</span>
                            <span className={cn(
                              "font-medium",
                              (selectedWindow.metrics.trainAccuracy - selectedWindow.metrics.testAccuracy) <= 10
                                ? "text-green-500"
                                : "text-red-500"
                            )}>
                              {(selectedWindow.metrics.trainAccuracy - selectedWindow.metrics.testAccuracy).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">{t("tradingMetrics")}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("sharpeRatio")}</span>
                            <span className={cn(
                              "font-medium",
                              selectedWindow.metrics.sharpe >= 1.5 ? "text-green-500" : "text-yellow-500"
                            )}>
                              {selectedWindow.metrics.sharpe.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("returns")}</span>
                            <span className={cn(
                              "font-medium",
                              selectedWindow.metrics.returns >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {selectedWindow.metrics.returns >= 0 ? "+" : ""}{selectedWindow.metrics.returns.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("maxDrawdown")}</span>
                            <span className="font-medium text-red-500">
                              {selectedWindow.metrics.maxDD.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{t("trades")}</span>
                            <span className="font-medium">{selectedWindow.metrics.trades}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedWindow.status === "pending" && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>{t("waitingToRun")}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("clickWindowToView")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
