"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Scan,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Filter,
  Zap,
  Activity,
  Volume2,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  StarOff,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useAssetClass, type AssetClass } from "@/lib/assets";

// Symbols and prices per asset class
const SYMBOLS_BY_CLASS: Record<AssetClass, string[]> = {
  crypto: [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT",
    "ADA/USDT", "AVAX/USDT", "DOT/USDT", "MATIC/USDT", "LINK/USDT",
    "ATOM/USDT", "UNI/USDT", "LTC/USDT", "NEAR/USDT", "FTM/USDT",
  ],
  stocks: [
    "AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "META",
    "AMD", "NFLX", "CRM", "ORCL", "INTC", "QCOM", "AVGO", "ADBE",
  ],
  futures: [
    "ES", "NQ", "CL", "GC", "SI", "ZB", "ZN", "6E", "6J", "ZC",
    "ZS", "ZW", "NG", "HG", "PL",
  ],
  options: [
    "SPY", "QQQ", "IWM", "AAPL", "TSLA", "NVDA", "AMD", "AMZN",
    "GOOGL", "META", "MSFT", "VIX", "GLD", "SLV", "XLF",
  ],
};

const BASE_PRICES: Record<string, number> = {
  // Crypto
  "BTC/USDT": 43250, "ETH/USDT": 2285, "SOL/USDT": 102, "BNB/USDT": 312,
  "XRP/USDT": 0.615, "ADA/USDT": 0.52, "AVAX/USDT": 38.5, "DOT/USDT": 7.8,
  "MATIC/USDT": 0.85, "LINK/USDT": 15.2, "ATOM/USDT": 10.5, "UNI/USDT": 6.2,
  "LTC/USDT": 72, "NEAR/USDT": 3.5, "FTM/USDT": 0.42,
  // Stocks
  "AAPL": 178, "NVDA": 485, "TSLA": 248, "MSFT": 379, "GOOGL": 141,
  "AMZN": 178, "META": 485, "AMD": 165, "NFLX": 485, "CRM": 275,
  "ORCL": 118, "INTC": 42, "QCOM": 168, "AVGO": 1245, "ADBE": 578,
  // Futures
  "ES": 4785, "NQ": 16890, "CL": 78, "GC": 2045, "SI": 24.5,
  "ZB": 118, "ZN": 110, "6E": 1.08, "6J": 0.0067, "ZC": 458,
  "ZS": 1245, "ZW": 612, "NG": 2.85, "HG": 3.92, "PL": 925,
  // Options (underlying)
  "SPY": 478, "QQQ": 405, "IWM": 198, "VIX": 14.5, "GLD": 185,
  "SLV": 22.5, "XLF": 38.5,
};

// Types
interface ScanResult {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  volumeChange: number;
  rsi: number;
  macdSignal: "bullish" | "bearish" | "neutral";
  trend: "uptrend" | "downtrend" | "sideways";
  volatility: number;
  signals: string[];
  score: number;
  starred: boolean;
}

// Scan preset IDs
const SCAN_PRESET_IDS = ["momentum", "oversold", "overbought", "volume-spike", "trend-reversal", "range-breakout"];

// Generate mock scan results
function generateScanResults(preset: string, assetClass: AssetClass): ScanResult[] {
  const symbols = SYMBOLS_BY_CLASS[assetClass];

  const results: ScanResult[] = symbols.map((symbol, i) => {
    const basePrice = BASE_PRICES[symbol] ?? 10;
    let change24h: number;
    let rsi: number;
    let macdSignal: ScanResult["macdSignal"];
    let trend: ScanResult["trend"];
    let signals: string[] = [];

    // Adjust based on preset
    switch (preset) {
      case "momentum":
        change24h = Math.random() * 8 + 3;
        rsi = Math.random() * 20 + 55;
        macdSignal = "bullish";
        trend = "uptrend";
        signals = ["MA Crossover", "Volume Surge", "Higher Highs"];
        break;
      case "oversold":
        change24h = -(Math.random() * 5 + 2);
        rsi = Math.random() * 15 + 15;
        macdSignal = Math.random() > 0.5 ? "bullish" : "neutral";
        trend = "downtrend";
        signals = ["RSI Oversold", "Support Test", "Divergence"];
        break;
      case "overbought":
        change24h = Math.random() * 5 + 2;
        rsi = Math.random() * 15 + 75;
        macdSignal = Math.random() > 0.5 ? "bearish" : "neutral";
        trend = "uptrend";
        signals = ["RSI Overbought", "Resistance", "Bearish Divergence"];
        break;
      case "volume-spike":
        change24h = (Math.random() - 0.3) * 10;
        rsi = Math.random() * 40 + 30;
        macdSignal = change24h > 0 ? "bullish" : "bearish";
        trend = change24h > 2 ? "uptrend" : change24h < -2 ? "downtrend" : "sideways";
        signals = ["Volume 3x Average", "Unusual Activity", "Whale Alert"];
        break;
      case "trend-reversal":
        change24h = (Math.random() - 0.5) * 8;
        rsi = Math.random() * 30 + 35;
        macdSignal = "neutral";
        trend = "sideways";
        signals = ["MACD Cross", "Trend Line Break", "Pattern Complete"];
        break;
      default:
        change24h = (Math.random() - 0.5) * 6;
        rsi = Math.random() * 50 + 25;
        macdSignal = change24h > 0 ? "bullish" : change24h < 0 ? "bearish" : "neutral";
        trend = change24h > 2 ? "uptrend" : change24h < -2 ? "downtrend" : "sideways";
        signals = ["Consolidation Break", "ATR Expansion"];
    }

    const volumeChange = (Math.random() - 0.3) * 200;
    const volatility = Math.random() * 5 + 1;
    const score = Math.floor(Math.random() * 30 + 70);

    return {
      id: `scan-${i + 1}`,
      symbol,
      price: basePrice * (1 + change24h / 100),
      change24h,
      volume24h: Math.random() * 100000000 + 10000000,
      volumeChange,
      rsi,
      macdSignal,
      trend,
      volatility,
      signals,
      score,
      starred: Math.random() > 0.8,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export default function ScannerPage() {
  const t = useTranslations("scannerPage");
  const tAsset = useTranslations("assetClass");
  const { assetClass } = useAssetClass();
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("momentum");
  const [sortBy, setSortBy] = useState<"score" | "change" | "volume" | "rsi">("score");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Scan presets with translations
  const SCAN_PRESETS = useMemo(() => [
    { id: "momentum", name: t("presetMomentum"), description: t("presetMomentumDesc") },
    { id: "oversold", name: t("presetOversold"), description: t("presetOversoldDesc") },
    { id: "overbought", name: t("presetOverbought"), description: t("presetOverboughtDesc") },
    { id: "volume-spike", name: t("presetVolumeSpike"), description: t("presetVolumeSpikeDesc") },
    { id: "trend-reversal", name: t("presetTrendReversal"), description: t("presetTrendReversalDesc") },
    { id: "range-breakout", name: t("presetRangeBreakout"), description: t("presetRangeBreakoutDesc") },
  ], [t]);

  // Run scan
  const runScan = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(generateScanResults(selectedPreset, assetClass));
      setLoading(false);
    }, 500);
  };

  // Re-run scan when asset class or preset changes
  useEffect(() => {
    runScan();
  }, [selectedPreset, assetClass]);

  // Sort and filter results
  const displayResults = useMemo(() => {
    let filtered = showStarredOnly ? results.filter((r) => r.starred) : results;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "change":
          return Math.abs(b.change24h) - Math.abs(a.change24h);
        case "volume":
          return b.volumeChange - a.volumeChange;
        case "rsi":
          return selectedPreset === "oversold" ? a.rsi - b.rsi : b.rsi - a.rsi;
        default:
          return b.score - a.score;
      }
    });
  }, [results, sortBy, showStarredOnly, selectedPreset]);

  const toggleStar = (id: string) => {
    setResults(results.map((r) =>
      r.id === id ? { ...r, starred: !r.starred } : r
    ));
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${(volume / 1e3).toFixed(2)}K`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <Badge variant="secondary" className="text-xs">
              {tAsset(assetClass)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={runScan} disabled={loading}>
          <Scan className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          {loading ? t("scanning") : t("runScan")}
        </Button>
      </div>

      {/* Scan Presets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCAN_PRESETS.map((preset) => (
          <Card
            key={preset.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedPreset === preset.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedPreset(preset.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </div>
                {selectedPreset === preset.id && (
                  <Badge className="bg-primary">{t("active")}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("sortBy")}</span>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
                <SelectOption value="score">{t("score")}</SelectOption>
                <SelectOption value="change">{t("changePercent")}</SelectOption>
                <SelectOption value="volume">{t("volume")}</SelectOption>
                <SelectOption value="rsi">{t("rsi")}</SelectOption>
              </Select>
            </div>

            <Button
              variant={showStarredOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
            >
              <Star className={cn("mr-2 h-4 w-4", showStarredOnly && "fill-yellow-500 text-yellow-500")} />
              {t("starredOnly")}
            </Button>

            <div className="flex-1" />

            <Badge variant="outline" className="text-muted-foreground">
              {displayResults.length} {t("results")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium w-10"></th>
                  <th className="p-3 text-left font-medium">{t("symbol")}</th>
                  <th className="p-3 text-right font-medium">{t("price")}</th>
                  <th className="p-3 text-right font-medium">{t("change24h")}</th>
                  <th className="p-3 text-right font-medium">{t("volume")}</th>
                  <th className="p-3 text-center font-medium">{t("rsi")}</th>
                  <th className="p-3 text-center font-medium">{t("macd")}</th>
                  <th className="p-3 text-center font-medium">{t("trend")}</th>
                  <th className="p-3 text-left font-medium">{t("signals")}</th>
                  <th className="p-3 text-center font-medium">{t("score")}</th>
                  <th className="p-3 text-center font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {displayResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleStar(result.id)}
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          result.starred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                        )} />
                      </Button>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">{result.symbol}</span>
                    </td>
                    <td className="p-3 text-right font-mono">
                      ${formatPrice(result.price)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={cn(
                        "flex items-center justify-end gap-1 font-semibold",
                        result.change24h >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {result.change24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {result.change24h >= 0 ? "+" : ""}{result.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div>
                        <span className="font-mono">{formatVolume(result.volume24h)}</span>
                        <span className={cn(
                          "text-xs ml-1",
                          result.volumeChange >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {result.volumeChange >= 0 ? "+" : ""}{result.volumeChange.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={
                        result.rsi < 30 ? "destructive" :
                        result.rsi > 70 ? "default" : "outline"
                      }>
                        {result.rsi.toFixed(0)}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={cn(
                        result.macdSignal === "bullish" ? "bg-green-500" :
                        result.macdSignal === "bearish" ? "bg-red-500" : "bg-gray-500"
                      )}>
                        {t(result.macdSignal)}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {result.trend === "uptrend" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : result.trend === "downtrend" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-xs">{t(result.trend)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {result.signals.slice(0, 2).map((signal) => (
                          <Badge key={signal} variant="outline" className="text-xs">
                            {signal}
                          </Badge>
                        ))}
                        {result.signals.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.signals.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full",
                              result.score >= 85 ? "bg-green-500" :
                              result.score >= 75 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm w-8">{result.score}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
