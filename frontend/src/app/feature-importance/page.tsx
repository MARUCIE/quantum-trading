"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  Download,
  RefreshCw,
  Layers,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Feature {
  name: string;
  importance: number;
  shapValue: number;
  category: string;
  description: string;
  correlation: number;
}

interface FeatureInteraction {
  feature1: string;
  feature2: string;
  strength: number;
  type: "positive" | "negative";
}

interface ModelSummary {
  name: string;
  totalFeatures: number;
  significantFeatures: number;
  avgShapMagnitude: number;
  topCategory: string;
}

// Mock data generator
function generateMockFeatures(): Feature[] {
  const features: Feature[] = [
    { name: "RSI_14", importance: 0.156, shapValue: 0.082, category: "Technical", description: "14-period Relative Strength Index", correlation: 0.45 },
    { name: "MACD_Signal", importance: 0.142, shapValue: 0.065, category: "Technical", description: "MACD Signal line crossover", correlation: 0.38 },
    { name: "Volume_MA_Ratio", importance: 0.128, shapValue: 0.058, category: "Volume", description: "Current volume vs 20-day MA", correlation: 0.52 },
    { name: "BTC_Dominance", importance: 0.115, shapValue: -0.042, category: "Market", description: "Bitcoin market dominance %", correlation: -0.28 },
    { name: "Funding_Rate", importance: 0.098, shapValue: 0.035, category: "Derivatives", description: "Perpetual futures funding rate", correlation: 0.31 },
    { name: "Open_Interest_Change", importance: 0.092, shapValue: 0.048, category: "Derivatives", description: "24h open interest change", correlation: 0.42 },
    { name: "Social_Sentiment", importance: 0.085, shapValue: 0.025, category: "Sentiment", description: "Aggregated social media sentiment", correlation: 0.22 },
    { name: "Fear_Greed_Index", importance: 0.078, shapValue: -0.018, category: "Sentiment", description: "Crypto Fear & Greed Index", correlation: -0.15 },
    { name: "Whale_Transactions", importance: 0.072, shapValue: 0.032, category: "On-Chain", description: "Large wallet transactions count", correlation: 0.35 },
    { name: "Exchange_Netflow", importance: 0.068, shapValue: -0.028, category: "On-Chain", description: "Net exchange inflow/outflow", correlation: -0.25 },
    { name: "ATR_Percentile", importance: 0.062, shapValue: 0.022, category: "Volatility", description: "ATR relative to historical range", correlation: 0.18 },
    { name: "Bollinger_Width", importance: 0.055, shapValue: 0.015, category: "Volatility", description: "Bollinger Band width", correlation: 0.12 },
    { name: "Price_MA_Distance", importance: 0.048, shapValue: -0.012, category: "Technical", description: "Distance from 50-day MA", correlation: -0.08 },
    { name: "Order_Book_Imbalance", importance: 0.045, shapValue: 0.018, category: "Microstructure", description: "Bid/Ask volume imbalance", correlation: 0.28 },
    { name: "Realized_Vol_30d", importance: 0.042, shapValue: 0.008, category: "Volatility", description: "30-day realized volatility", correlation: 0.05 },
  ];
  return features;
}

function generateMockInteractions(): FeatureInteraction[] {
  return [
    { feature1: "RSI_14", feature2: "MACD_Signal", strength: 0.72, type: "positive" },
    { feature1: "Volume_MA_Ratio", feature2: "Open_Interest_Change", strength: 0.65, type: "positive" },
    { feature1: "BTC_Dominance", feature2: "Fear_Greed_Index", strength: 0.58, type: "positive" },
    { feature1: "Funding_Rate", feature2: "Exchange_Netflow", strength: 0.45, type: "negative" },
    { feature1: "Whale_Transactions", feature2: "Order_Book_Imbalance", strength: 0.52, type: "positive" },
  ];
}

// Category keys for translation
const CATEGORY_KEYS = ["all", "technical", "volumeCategory", "market", "derivatives", "sentiment", "onChain", "volatility", "microstructure"];
const CATEGORY_MAP: Record<string, string> = {
  "all": "All",
  "technical": "Technical",
  "volumeCategory": "Volume",
  "market": "Market",
  "derivatives": "Derivatives",
  "sentiment": "Sentiment",
  "onChain": "On-Chain",
  "volatility": "Volatility",
  "microstructure": "Microstructure",
};

export default function FeatureImportancePage() {
  const t = useTranslations("featureImportancePage");
  const [features] = useState<Feature[]>(generateMockFeatures);
  const [interactions] = useState<FeatureInteraction[]>(generateMockInteractions);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"importance" | "shap" | "correlation">("importance");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const filteredFeatures = useMemo(() => {
    let result = selectedCategory === "All"
      ? features
      : features.filter((f) => f.category === selectedCategory);

    return result.sort((a, b) => {
      switch (sortBy) {
        case "importance": return b.importance - a.importance;
        case "shap": return Math.abs(b.shapValue) - Math.abs(a.shapValue);
        case "correlation": return Math.abs(b.correlation) - Math.abs(a.correlation);
      }
    });
  }, [features, selectedCategory, sortBy]);

  const summary: ModelSummary = useMemo(() => {
    const significantFeatures = features.filter((f) => f.importance > 0.05);
    const categories = features.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + f.importance;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];

    return {
      name: "BTC Trend Predictor",
      totalFeatures: features.length,
      significantFeatures: significantFeatures.length,
      avgShapMagnitude: features.reduce((sum, f) => sum + Math.abs(f.shapValue), 0) / features.length,
      topCategory,
    };
  }, [features]);

  const maxImportance = Math.max(...features.map((f) => f.importance));
  const maxShap = Math.max(...features.map((f) => Math.abs(f.shapValue)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Technical": "bg-blue-500/10 text-blue-500",
      "Volume": "bg-green-500/10 text-green-500",
      "Market": "bg-purple-500/10 text-purple-500",
      "Derivatives": "bg-orange-500/10 text-orange-500",
      "Sentiment": "bg-pink-500/10 text-pink-500",
      "On-Chain": "bg-cyan-500/10 text-cyan-500",
      "Volatility": "bg-yellow-500/10 text-yellow-500",
      "Microstructure": "bg-indigo-500/10 text-indigo-500",
    };
    return colors[category] || "bg-gray-500/10 text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description", { modelName: summary.name })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("recalculate")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalFeatures")}</p>
                <p className="text-xl font-bold">{summary.totalFeatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("significantFeatures")}</p>
                <p className="text-xl font-bold">{summary.significantFeatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgShap")}</p>
                <p className="text-xl font-bold">{summary.avgShapMagnitude.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("topCategory")}</p>
                <p className="text-xl font-bold">{summary.topCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Feature Rankings */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("featureRankings")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("sortBy")}</span>
                  {(["importance", "shap", "correlation"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={sortBy === s ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(s)}
                    >
                      {t(s)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORY_KEYS.map((catKey) => (
                  <Button
                    key={catKey}
                    variant={selectedCategory === CATEGORY_MAP[catKey] ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(CATEGORY_MAP[catKey])}
                  >
                    {t(catKey as keyof typeof t)}
                  </Button>
                ))}
              </div>

              {/* Feature List */}
              <div className="space-y-2">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "p-3 rounded-lg border transition-colors cursor-pointer",
                      expandedFeature === feature.name ? "bg-muted/50" : "hover:bg-muted/30"
                    )}
                    onClick={() => setExpandedFeature(
                      expandedFeature === feature.name ? null : feature.name
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                        <span className="font-medium">{feature.name}</span>
                        <Badge variant="outline" className={getCategoryColor(feature.category)}>
                          {feature.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                        {expandedFeature === feature.name ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Importance Bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedFeature === feature.name && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <p className="text-sm text-muted-foreground">{feature.description}</p>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{t("shapValue")}</p>
                            <div className="flex items-center gap-2">
                              {feature.shapValue >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span className={cn(
                                "font-semibold",
                                feature.shapValue >= 0 ? "text-green-500" : "text-red-500"
                              )}>
                                {feature.shapValue >= 0 ? "+" : ""}{feature.shapValue.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t("correlation")}</p>
                            <span className={cn(
                              "font-semibold",
                              feature.correlation >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {feature.correlation >= 0 ? "+" : ""}{feature.correlation.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t("direction")}</p>
                            <span className="font-semibold">
                              {feature.shapValue >= 0 ? t("bullish") : t("bearish")}
                            </span>
                          </div>
                        </div>

                        {/* SHAP Bar (bi-directional) */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("shapContribution")}</p>
                          <div className="flex items-center h-4 bg-muted rounded-full overflow-hidden relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
                            <div
                              className={cn(
                                "h-full absolute",
                                feature.shapValue >= 0 ? "bg-green-500 left-1/2" : "bg-red-500 right-1/2"
                              )}
                              style={{
                                width: `${(Math.abs(feature.shapValue) / maxShap) * 50}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Interactions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                {t("featureInteractions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interactions.map((interaction, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{interaction.feature1}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{interaction.feature2}</span>
                    </div>
                    <Badge variant={interaction.type === "positive" ? "default" : "destructive"}>
                      {t(interaction.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          interaction.type === "positive" ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ width: `${interaction.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">
                      {(interaction.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interpretation Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("howToReadShap")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{t("importanceTitle")}</h4>
                <p>{t("importanceDesc")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{t("shapValueTitle")}</h4>
                <p>{t("shapValueDesc")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{t("interactionsTitle")}</h4>
                <p>{t("interactionsDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
