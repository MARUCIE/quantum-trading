"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RefreshCw,
  Filter,
  Bell,
  BellOff,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useAssetClass, type AssetClass } from "@/lib/assets";

// Symbols and strategies per asset class
const SYMBOLS_BY_CLASS: Record<AssetClass, string[]> = {
  crypto: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "AVAX/USDT"],
  stocks: ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "META"],
  futures: ["ES", "NQ", "CL", "GC", "ZB", "6E", "ZN"],
  options: ["SPY", "QQQ", "IWM", "AAPL", "TSLA", "NVDA", "AMD"],
};

const STRATEGIES_BY_CLASS: Record<AssetClass, string[]> = {
  crypto: ["BTC Momentum", "ETH Mean Reversion", "Multi-Asset Breakout", "Grid Trading", "Funding Arbitrage"],
  stocks: ["Earnings Momentum", "Value Rotation", "Sector Breakout", "Dividend Capture", "Gap Trading"],
  futures: ["Trend Following", "Calendar Spread", "Mean Reversion", "Momentum Breakout", "Volatility Breakout"],
  options: ["Iron Condor", "Straddle", "Covered Call", "Put Spread", "Gamma Scalping"],
};

const BASE_PRICES: Record<string, number> = {
  // Crypto
  "BTC/USDT": 43000, "ETH/USDT": 2280, "SOL/USDT": 102, "BNB/USDT": 312, "XRP/USDT": 0.6, "ADA/USDT": 0.5, "AVAX/USDT": 38,
  // Stocks
  "AAPL": 178, "NVDA": 485, "TSLA": 248, "MSFT": 379, "GOOGL": 141, "AMZN": 178, "META": 485,
  // Futures
  "ES": 4785, "NQ": 16890, "CL": 78, "GC": 2045, "ZB": 118, "6E": 1.08, "ZN": 110,
  // Options (underlying)
  "SPY": 478, "QQQ": 405, "IWM": 198, "AMD": 165,
};

// Types
interface Signal {
  id: string;
  strategy: string;
  symbol: string;
  type: "long" | "short" | "close";
  strength: number; // 0-100
  price: number;
  targetPrice: number;
  stopLoss: number;
  timestamp: string;
  timeframe: string;
  confidence: "high" | "medium" | "low";
  status: "active" | "executed" | "expired" | "cancelled";
  indicators: string[];
  notes: string;
}

// Mock data generator
function generateSignals(assetClass: AssetClass): Signal[] {
  const strategies = STRATEGIES_BY_CLASS[assetClass];
  const symbols = SYMBOLS_BY_CLASS[assetClass];
  const timeframes = ["5m", "15m", "1H", "4H", "1D"];
  const indicatorSets = [
    ["RSI Oversold", "MACD Cross"],
    ["MA Crossover", "Volume Surge"],
    ["Bollinger Breakout", "ATR Expansion"],
    ["Support Bounce", "Divergence"],
    ["Trend Alignment", "Momentum Shift"],
  ];

  const signals: Signal[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.3 ? (Math.random() > 0.5 ? "long" : "short") : "close";
    const strength = Math.floor(Math.random() * 40) + 60;
    const basePrice = BASE_PRICES[symbol] ?? 100;
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const direction = type === "long" ? 1 : type === "short" ? -1 : 0;
    const targetPrice = type !== "close" ? price * (1 + direction * (Math.random() * 0.03 + 0.01)) : price;
    const stopLoss = type !== "close" ? price * (1 - direction * (Math.random() * 0.015 + 0.005)) : price;
    const minutesAgo = Math.floor(Math.random() * 120);
    const timestamp = new Date(now.getTime() - minutesAgo * 60000).toISOString();
    const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
    const confidence = strength > 80 ? "high" : strength > 65 ? "medium" : "low";
    const statuses: Signal["status"][] = ["active", "active", "active", "executed", "expired"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const indicators = indicatorSets[Math.floor(Math.random() * indicatorSets.length)];

    signals.push({
      id: `sig-${i + 1}`,
      strategy,
      symbol,
      type,
      strength,
      price,
      targetPrice,
      stopLoss,
      timestamp,
      timeframe,
      confidence,
      status,
      indicators,
      notes: type === "close" ? "Take profit reached" : `${indicators.join(" + ")} triggered`,
    });
  }

  return signals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function SignalsPage() {
  const t = useTranslations("signalsPage");
  const tAsset = useTranslations("assetClass");
  const { assetClass } = useAssetClass();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "long" | "short" | "close">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "executed" | "expired">("all");
  const [filterConfidence, setFilterConfidence] = useState<"all" | "high" | "medium" | "low">("all");

  // Load signals for current asset class
  const loadSignals = () => {
    setLoading(true);
    setTimeout(() => {
      setSignals(generateSignals(assetClass));
      setLoading(false);
    }, 300);
  };

  // Reload signals when asset class changes
  useEffect(() => {
    loadSignals();
  }, [assetClass]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadSignals, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter signals
  const filteredSignals = useMemo(() => {
    return signals.filter((signal) => {
      const matchesSearch =
        signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.strategy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || signal.type === filterType;
      const matchesStatus = filterStatus === "all" || signal.status === filterStatus;
      const matchesConfidence = filterConfidence === "all" || signal.confidence === filterConfidence;
      return matchesSearch && matchesType && matchesStatus && matchesConfidence;
    });
  }, [signals, searchQuery, filterType, filterStatus, filterConfidence]);

  // Statistics
  const stats = useMemo(() => {
    const active = signals.filter((s) => s.status === "active");
    const longs = active.filter((s) => s.type === "long").length;
    const shorts = active.filter((s) => s.type === "short").length;
    const highConf = active.filter((s) => s.confidence === "high").length;
    const avgStrength = active.length > 0
      ? active.reduce((sum, s) => sum + s.strength, 0) / active.length
      : 0;

    return { active: active.length, longs, shorts, highConf, avgStrength };
  }, [signals]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return t("minutesAgo", { minutes: diffMins });
    if (diffMins < 1440) return t("hoursAgo", { hours: Math.floor(diffMins / 60) });
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: Signal["type"]) => {
    switch (type) {
      case "long":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "short":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "close":
        return <XCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: Signal["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">{t("active")}</Badge>;
      case "executed":
        return <Badge className="bg-blue-500">{t("executed")}</Badge>;
      case "expired":
        return <Badge variant="outline">{t("expired")}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t("cancelled")}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: Signal["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500/20 text-green-500">{t("high")}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-500">{t("medium")}</Badge>;
      case "low":
        return <Badge className="bg-red-500/20 text-red-500">{t("low")}</Badge>;
    }
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
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className={cn("mr-2 h-4 w-4", autoRefresh && "text-yellow-500")} />
            {autoRefresh ? t("live") : t("auto")}
          </Button>
          <Button variant="outline" onClick={loadSignals} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("activeSignals")}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("longSignals")}</p>
                <p className="text-xl font-bold text-green-500">{stats.longs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("shortSignals")}</p>
                <p className="text-xl font-bold text-red-500">{stats.shorts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Target className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("highConfidence")}</p>
                <p className="text-xl font-bold">{stats.highConf}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgStrength")}</p>
                <p className="text-xl font-bold">{stats.avgStrength.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onChange={(e) => setFilterType(e.target.value as typeof filterType)}>
              <SelectOption value="all">{t("allTypes")}</SelectOption>
              <SelectOption value="long">{t("long")}</SelectOption>
              <SelectOption value="short">{t("short")}</SelectOption>
              <SelectOption value="close">{t("close")}</SelectOption>
            </Select>

            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
              <SelectOption value="all">{t("allStatus")}</SelectOption>
              <SelectOption value="active">{t("active")}</SelectOption>
              <SelectOption value="executed">{t("executed")}</SelectOption>
              <SelectOption value="expired">{t("expired")}</SelectOption>
            </Select>

            <Select value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value as typeof filterConfidence)}>
              <SelectOption value="all">{t("allConfidence")}</SelectOption>
              <SelectOption value="high">{t("high")}</SelectOption>
              <SelectOption value="medium">{t("medium")}</SelectOption>
              <SelectOption value="low">{t("low")}</SelectOption>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.map((signal) => (
          <Card key={signal.id} className={cn(
            "transition-all hover:shadow-md",
            signal.status === "active" && "border-l-4 border-l-primary"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Signal info */}
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    signal.type === "long" ? "bg-green-500/10" :
                    signal.type === "short" ? "bg-red-500/10" : "bg-yellow-500/10"
                  )}>
                    {getTypeIcon(signal.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{signal.symbol}</span>
                      <Badge variant={signal.type === "long" ? "default" : signal.type === "short" ? "destructive" : "outline"}>
                        {signal.type.toUpperCase()}
                      </Badge>
                      {getStatusBadge(signal.status)}
                      {getConfidenceBadge(signal.confidence)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {signal.strategy} • {signal.timeframe}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>{t("entry")}: <span className="font-mono">${formatPrice(signal.price)}</span></span>
                      {signal.type !== "close" && (
                        <>
                          <span className="text-green-500">
                            {t("tp")}: <span className="font-mono">${formatPrice(signal.targetPrice)}</span>
                          </span>
                          <span className="text-red-500">
                            {t("sl")}: <span className="font-mono">${formatPrice(signal.stopLoss)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Strength and time */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm text-muted-foreground">{t("strength")}</span>
                    <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          signal.strength >= 80 ? "bg-green-500" :
                          signal.strength >= 65 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${signal.strength}%` }}
                      />
                    </div>
                    <span className="font-mono font-semibold w-10">{signal.strength}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(signal.timestamp)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2 justify-end">
                    {signal.indicators.map((ind) => (
                      <Badge key={ind} variant="outline" className="text-xs">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSignals.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Radio className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("noSignalsFound")}</p>
              <p className="text-sm text-muted-foreground/70">
                {t("noSignalsHint")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
