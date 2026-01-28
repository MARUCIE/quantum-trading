"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Filter,
  Bell,
  Target,
  Percent,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercent: number;
  estimatedProfit: number;
  volume: number;
  confidence: number;
  latency: number;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
  isNew: boolean;
}

interface ArbitrageStats {
  totalOpportunities: number;
  avgSpread: number;
  potentialProfit: number;
  executedToday: number;
  profitToday: number;
}

// Mock data generator
function generateMockOpportunities(): ArbitrageOpportunity[] {
  const pairs = [
    { symbol: "BTC/USDT", basePrice: 67500 },
    { symbol: "ETH/USDT", basePrice: 3450 },
    { symbol: "SOL/USDT", basePrice: 142.5 },
    { symbol: "BNB/USDT", basePrice: 580 },
    { symbol: "XRP/USDT", basePrice: 0.52 },
    { symbol: "DOGE/USDT", basePrice: 0.085 },
  ];

  const exchanges = ["Binance", "OKX", "Bybit", "Kraken", "Coinbase"];

  const opportunities: ArbitrageOpportunity[] = [];

  pairs.forEach((pair, index) => {
    const spread = 0.0005 + Math.random() * 0.003;
    const buyIdx = Math.floor(Math.random() * exchanges.length);
    let sellIdx = Math.floor(Math.random() * exchanges.length);
    while (sellIdx === buyIdx) sellIdx = Math.floor(Math.random() * exchanges.length);

    const buyPrice = pair.basePrice * (1 - spread / 2);
    const sellPrice = pair.basePrice * (1 + spread / 2);
    const volume = 10000 + Math.random() * 50000;

    opportunities.push({
      id: `arb-${index}`,
      symbol: pair.symbol,
      buyExchange: exchanges[buyIdx],
      sellExchange: exchanges[sellIdx],
      buyPrice,
      sellPrice,
      spread: sellPrice - buyPrice,
      spreadPercent: spread * 100,
      estimatedProfit: (sellPrice - buyPrice) * (volume / buyPrice),
      volume,
      confidence: 75 + Math.random() * 20,
      latency: 50 + Math.floor(Math.random() * 100),
      riskLevel: spread > 0.002 ? "low" : spread > 0.001 ? "medium" : "high",
      timestamp: `${Math.floor(Math.random() * 30)}s ago`,
      isNew: Math.random() > 0.7,
    });
  });

  return opportunities.sort((a, b) => b.spreadPercent - a.spreadPercent);
}

export default function ArbitragePage() {
  const t = useTranslations("arbitragePage");
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>(generateMockOpportunities);
  const [isScanning, setIsScanning] = useState(true);
  const [minSpread, setMinSpread] = useState(0.05);
  const [selectedOpp, setSelectedOpp] = useState<ArbitrageOpportunity | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setOpportunities(generateMockOpportunities());
    }, 5000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => opp.spreadPercent >= minSpread);
  }, [opportunities, minSpread]);

  const stats: ArbitrageStats = useMemo(() => ({
    totalOpportunities: filteredOpportunities.length,
    avgSpread: filteredOpportunities.reduce((sum, o) => sum + o.spreadPercent, 0) / filteredOpportunities.length || 0,
    potentialProfit: filteredOpportunities.reduce((sum, o) => sum + o.estimatedProfit, 0),
    executedToday: 12,
    profitToday: 485.50,
  }), [filteredOpportunities]);

  const getRiskColor = (risk: ArbitrageOpportunity["riskLevel"]) => {
    switch (risk) {
      case "low": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const getRiskLabel = (risk: ArbitrageOpportunity["riskLevel"]) => {
    switch (risk) {
      case "low": return t("lowRisk");
      case "medium": return t("mediumRisk");
      case "high": return t("highRisk");
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
          <Badge variant={isScanning ? "default" : "outline"} className={cn(
            isScanning && "bg-green-500"
          )}>
            <Activity className={cn("mr-1 h-3 w-3", isScanning && "animate-pulse")} />
            {isScanning ? t("live") : t("paused")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScanning(!isScanning)}
          >
            {isScanning ? (
              <><Pause className="mr-2 h-4 w-4" />{t("pause")}</>
            ) : (
              <><Play className="mr-2 h-4 w-4" />{t("start")}</>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            {t("alerts")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("opportunities")}</p>
                <p className="text-xl font-bold">{stats.totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Percent className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgSpread")}</p>
                <p className="text-xl font-bold">{stats.avgSpread.toFixed(3)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("potential")}</p>
                <p className="text-xl font-bold text-green-500">${stats.potentialProfit.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("executedToday")}</p>
                <p className="text-xl font-bold">{stats.executedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("profitToday")}</p>
                <p className="text-xl font-bold text-emerald-500">${stats.profitToday.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm">{t("minSpread")}:</span>
              <Input
                type="number"
                value={minSpread}
                onChange={(e) => setMinSpread(parseFloat(e.target.value) || 0)}
                className="w-24"
                step="0.01"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="flex gap-2">
              {[0.05, 0.1, 0.15, 0.2].map((val) => (
                <Button
                  key={val}
                  variant={minSpread === val ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setMinSpread(val)}
                >
                  {val}%
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.map((opp) => (
          <Card
            key={opp.id}
            className={cn(
              "cursor-pointer transition-all relative overflow-hidden",
              selectedOpp?.id === opp.id && "ring-2 ring-primary",
              opp.isNew && "border-green-500/50"
            )}
            onClick={() => setSelectedOpp(opp)}
          >
            {opp.isNew && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500">NEW</Badge>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">{opp.symbol}</span>
                <Badge variant="outline" className={cn("border", getRiskColor(opp.riskLevel))}>
                  {getRiskLabel(opp.riskLevel)}
                </Badge>
              </div>

              {/* Trade Flow */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("buy")}</p>
                  <p className="font-semibold text-green-500">{opp.buyExchange}</p>
                  <p className="text-sm">${formatPrice(opp.buyPrice)}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("sell")}</p>
                  <p className="font-semibold text-blue-500">{opp.sellExchange}</p>
                  <p className="text-sm">${formatPrice(opp.sellPrice)}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{t("spread")}</p>
                  <p className={cn(
                    "font-semibold",
                    opp.spreadPercent >= 0.15 ? "text-green-500" :
                    opp.spreadPercent >= 0.1 ? "text-yellow-500" : "text-orange-500"
                  )}>
                    {opp.spreadPercent.toFixed(3)}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{t("estProfit")}</p>
                  <p className="font-semibold text-green-500">${opp.estimatedProfit.toFixed(2)}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{t("confidence")}</p>
                  <p className={cn(
                    "font-semibold",
                    opp.confidence >= 90 ? "text-green-500" : "text-yellow-500"
                  )}>
                    {opp.confidence.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {opp.latency}ms
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {opp.timestamp}
                </span>
              </div>

              <Button className="w-full mt-3" size="sm">
                <Zap className="mr-1 h-3 w-3" />
                {t("execute")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t("noOpportunitiesFound")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("noOpportunitiesHint")}
          </p>
        </div>
      )}

      {/* Auto-execution Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("autoExecutionSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("autoExecute")}</span>
                <Badge variant="outline">{t("disabled")}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("autoExecuteDesc")}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("minSpread")}</span>
                <span className="font-semibold">0.15%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("minSpreadForAuto")}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("maxPosition")}</span>
                <span className="font-semibold">$10,000</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("maxPositionDesc")}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("dailyLimit")}</span>
                <span className="font-semibold">$50,000</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dailyLimitDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
