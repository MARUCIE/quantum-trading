"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Grid3X3,
  RefreshCw,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface CorrelationData {
  assets: string[];
  matrix: number[][];
  period: string;
  updatedAt: string;
}

// Mock assets
const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC"];

// Generate mock correlation matrix
function generateCorrelationMatrix(assets: string[]): number[][] {
  const n = assets.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i];
      } else {
        // Generate realistic crypto correlations (generally positive)
        const base = 0.3 + Math.random() * 0.5;
        const noise = (Math.random() - 0.5) * 0.3;
        matrix[i][j] = Math.max(-1, Math.min(1, base + noise));
      }
    }
  }

  return matrix;
}

export default function CorrelationPage() {
  const t = useTranslations("correlationPage");

  const PERIODS = [
    { value: "7d", label: t("days7") },
    { value: "30d", label: t("days30") },
    { value: "90d", label: t("days90") },
    { value: "180d", label: t("days180") },
    { value: "1y", label: t("year1") },
  ];
  const [selectedAssets, setSelectedAssets] = useState<string[]>(ASSETS.slice(0, 6));
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [showValues, setShowValues] = useState(true);

  // Generate correlation data
  const correlationData: CorrelationData = useMemo(() => {
    return {
      assets: selectedAssets,
      matrix: generateCorrelationMatrix(selectedAssets),
      period,
      updatedAt: new Date().toISOString(),
    };
  }, [selectedAssets, period]);

  // Calculate statistics
  const stats = useMemo(() => {
    const { matrix } = correlationData;
    const n = matrix.length;
    let sum = 0;
    let count = 0;
    let maxCorr = -1;
    let minCorr = 1;
    let maxPair: [string, string] = ["", ""];
    let minPair: [string, string] = ["", ""];

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const corr = matrix[i][j];
        sum += corr;
        count++;
        if (corr > maxCorr) {
          maxCorr = corr;
          maxPair = [selectedAssets[i], selectedAssets[j]];
        }
        if (corr < minCorr) {
          minCorr = corr;
          minPair = [selectedAssets[i], selectedAssets[j]];
        }
      }
    }

    return {
      avgCorrelation: sum / count,
      maxCorrelation: maxCorr,
      minCorrelation: minCorr,
      maxPair,
      minPair,
      totalPairs: count,
    };
  }, [correlationData, selectedAssets]);

  // Get color for correlation value
  const getCorrelationColor = (value: number) => {
    if (value >= 0.7) return "bg-red-500";
    if (value >= 0.4) return "bg-orange-500";
    if (value >= 0.1) return "bg-yellow-500";
    if (value >= -0.1) return "bg-gray-400";
    if (value >= -0.4) return "bg-blue-400";
    return "bg-blue-600";
  };

  const getCorrelationTextColor = (value: number) => {
    if (Math.abs(value) >= 0.4) return "text-white";
    return "text-foreground";
  };

  const getCorrelationOpacity = (value: number) => {
    return Math.abs(value) * 0.8 + 0.2;
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const toggleAsset = (asset: string) => {
    if (selectedAssets.includes(asset)) {
      if (selectedAssets.length > 2) {
        setSelectedAssets(selectedAssets.filter((a) => a !== asset));
      }
    } else {
      setSelectedAssets([...selectedAssets, asset]);
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
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            {t("refresh")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("assets")}</p>
                <p className="text-xl font-bold">{selectedAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgCorrelation")}</p>
                <p className="text-xl font-bold">{stats.avgCorrelation.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("highest")}</p>
                <p className="text-xl font-bold">{stats.maxCorrelation.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.maxPair[0]}/{stats.maxPair[1]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("lowest")}</p>
                <p className="text-xl font-bold">{stats.minCorrelation.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.minPair[0]}/{stats.minPair[1]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-32"
              >
                {PERIODS.map((p) => (
                  <SelectOption key={p.value} value={p.value}>
                    {p.label}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <div className="flex-1" />

            <Button
              variant={showValues ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowValues(!showValues)}
            >
              {t("showValues")}
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">{t("selectAssets")}</p>
            <div className="flex flex-wrap gap-2">
              {ASSETS.map((asset) => (
                <Button
                  key={asset}
                  variant={selectedAssets.includes(asset) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleAsset(asset)}
                >
                  {asset}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            {t("correlationHeatmap")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground" />
                  {selectedAssets.map((asset) => (
                    <th
                      key={asset}
                      className="p-2 text-center font-medium text-sm min-w-[60px]"
                    >
                      {asset}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedAssets.map((rowAsset, i) => (
                  <tr key={rowAsset}>
                    <td className="p-2 font-medium text-sm">{rowAsset}</td>
                    {selectedAssets.map((colAsset, j) => {
                      const value = correlationData.matrix[i][j];
                      return (
                        <td key={colAsset} className="p-1">
                          <div
                            className={cn(
                              "flex items-center justify-center rounded-md p-3 transition-all hover:scale-105",
                              getCorrelationColor(value),
                              getCorrelationTextColor(value)
                            )}
                            style={{ opacity: getCorrelationOpacity(value) }}
                            title={`${rowAsset}/${colAsset}: ${value.toFixed(3)}`}
                          >
                            {showValues && (
                              <span className="text-xs font-mono font-semibold">
                                {value.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">-1.0</span>
            <div className="flex h-4 w-48 overflow-hidden rounded">
              <div className="flex-1 bg-blue-600" />
              <div className="flex-1 bg-blue-400" />
              <div className="flex-1 bg-gray-400" />
              <div className="flex-1 bg-yellow-500" />
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-red-500" />
            </div>
            <span className="text-xs text-muted-foreground">+1.0</span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("legendNegative")} ← {t("legendUncorrelated")} → {t("legendPositive")}
          </p>
        </CardContent>
      </Card>

      {/* Interpretation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t("interpretationGuide")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-red-500 mt-0.5" />
              <div>
                <p className="font-medium">{t("strongPositive")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("strongPositiveDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">{t("moderatePositive")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("moderatePositiveDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">{t("weakPositive")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("weakPositiveDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{t("uncorrelated")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("uncorrelatedDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-blue-400 mt-0.5" />
              <div>
                <p className="font-medium">{t("weakNegative")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("weakNegativeDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">{t("strongNegative")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("strongNegativeDesc")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
