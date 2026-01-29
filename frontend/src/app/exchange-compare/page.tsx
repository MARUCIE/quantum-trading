"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Layers,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface ExchangePrice {
  exchange: string;
  bid: number;
  ask: number;
  spread: number;
  spreadPercent: number;
  volume24h: number;
  lastUpdate: string;
  latency: number;
}

interface AssetComparison {
  symbol: string;
  name: string;
  basePrice: number;
  prices: ExchangePrice[];
  bestBid: { exchange: string; price: number };
  bestAsk: { exchange: string; price: number };
  arbitrageOpportunity: number;
}

// Mock data generator
function generateMockComparison(): AssetComparison[] {
  const symbols = [
    { symbol: "BTC/USDT", name: "Bitcoin", basePrice: 67500 },
    { symbol: "ETH/USDT", name: "Ethereum", basePrice: 3450 },
    { symbol: "SOL/USDT", name: "Solana", basePrice: 142.5 },
    { symbol: "BNB/USDT", name: "BNB", basePrice: 580 },
    { symbol: "XRP/USDT", name: "Ripple", basePrice: 0.52 },
    { symbol: "ADA/USDT", name: "Cardano", basePrice: 0.45 },
    { symbol: "AVAX/USDT", name: "Avalanche", basePrice: 35.2 },
    { symbol: "DOT/USDT", name: "Polkadot", basePrice: 7.25 },
  ];

  const exchanges = ["Binance", "OKX", "Bybit", "Kraken", "Coinbase"];

  return symbols.map(({ symbol, name, basePrice }) => {
    const prices: ExchangePrice[] = exchanges.map((exchange) => {
      const variance = (Math.random() - 0.5) * 0.002; // 0.2% variance
      const bid = basePrice * (1 + variance - 0.0002);
      const ask = basePrice * (1 + variance + 0.0002);
      const spread = ask - bid;

      return {
        exchange,
        bid,
        ask,
        spread,
        spreadPercent: (spread / bid) * 100,
        volume24h: Math.random() * 500000000 + 10000000,
        lastUpdate: `${Math.floor(Math.random() * 5)}s ago`,
        latency: Math.floor(Math.random() * 80) + 20,
      };
    });

    const bestBid = prices.reduce((best, p) => p.bid > best.price ? { exchange: p.exchange, price: p.bid } : best,
      { exchange: "", price: 0 });
    const bestAsk = prices.reduce((best, p) => p.ask < best.price || best.price === 0 ? { exchange: p.exchange, price: p.ask } : best,
      { exchange: "", price: Infinity });

    return {
      symbol,
      name,
      basePrice,
      prices,
      bestBid,
      bestAsk,
      arbitrageOpportunity: ((bestBid.price - bestAsk.price) / bestAsk.price) * 100,
    };
  });
}

const EXCHANGES = ["Binance", "OKX", "Bybit", "Kraken", "Coinbase"];

export default function ExchangeComparePage() {
  const t = useTranslations("exchangeComparePage");
  const [comparisons] = useState<AssetComparison[]>(generateMockComparison);
  const [selectedAsset, setSelectedAsset] = useState<AssetComparison | null>(comparisons[0]);
  const [sortBy, setSortBy] = useState<"symbol" | "arbitrage" | "volume">("arbitrage");

  const sortedComparisons = useMemo(() => {
    return [...comparisons].sort((a, b) => {
      switch (sortBy) {
        case "arbitrage": return b.arbitrageOpportunity - a.arbitrageOpportunity;
        case "volume": return b.prices.reduce((s, p) => s + p.volume24h, 0) - a.prices.reduce((s, p) => s + p.volume24h, 0);
        default: return a.symbol.localeCompare(b.symbol);
      }
    });
  }, [comparisons, sortBy]);

  const formatPrice = (price: number, symbol: string) => {
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${(vol / 1000).toFixed(0)}K`;
  };

  const stats = useMemo(() => {
    const opportunities = comparisons.filter((c) => c.arbitrageOpportunity > 0.05);
    const totalVolume = comparisons.reduce((sum, c) =>
      sum + c.prices.reduce((s, p) => s + p.volume24h, 0), 0);
    const avgSpread = comparisons.reduce((sum, c) =>
      sum + c.prices.reduce((s, p) => s + p.spreadPercent, 0) / c.prices.length, 0) / comparisons.length;

    return { opportunities: opportunities.length, totalVolume, avgSpread };
  }, [comparisons]);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refreshAll")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("arbOpportunities")}</p>
                <p className="text-xl font-bold text-green-500">{stats.opportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalVolume")}</p>
                <p className="text-xl font-bold">{formatVolume(stats.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Layers className="h-5 w-5 text-purple-500" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("pairsTracked")}</p>
                <p className="text-xl font-bold">{comparisons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                {t("assets")}
              </CardTitle>
              <div className="flex items-center gap-1">
                {(["symbol", "arbitrage", "volume"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={sortBy === s ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(s)}
                  >
                    {t(s)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedComparisons.map((asset) => (
              <div
                key={asset.symbol}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  selectedAsset?.symbol === asset.symbol
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-xs text-muted-foreground ml-2">{asset.name}</span>
                  </div>
                  {asset.arbitrageOpportunity > 0.05 && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      <Zap className="h-3 w-3 mr-1" />
                      {asset.arbitrageOpportunity.toFixed(2)}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${formatPrice(asset.basePrice, asset.symbol)}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-500">{asset.bestBid.exchange}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-blue-500">{asset.bestAsk.exchange}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detailed Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedAsset ? `${selectedAsset.symbol} ${t("priceComparison")}` : t("selectAsset")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAsset ? (
              <div className="space-y-6">
                {/* Best Prices Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground mb-1">{t("bestBid")}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-500">
                        ${formatPrice(selectedAsset.bestBid.price, selectedAsset.symbol)}
                      </span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        {selectedAsset.bestBid.exchange}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground mb-1">{t("bestAsk")}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-500">
                        ${formatPrice(selectedAsset.bestAsk.price, selectedAsset.symbol)}
                      </span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        {selectedAsset.bestAsk.exchange}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Arbitrage Opportunity */}
                {selectedAsset.arbitrageOpportunity > 0 && (
                  <div className={cn(
                    "p-4 rounded-lg border",
                    selectedAsset.arbitrageOpportunity > 0.05
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-muted/50"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedAsset.arbitrageOpportunity > 0.05 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="font-medium">{t("arbitrageOpportunity")}</span>
                      </div>
                      <span className={cn(
                        "text-lg font-bold",
                        selectedAsset.arbitrageOpportunity > 0.05 ? "text-green-500" : "text-yellow-500"
                      )}>
                        {selectedAsset.arbitrageOpportunity.toFixed(3)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("buyOn")} {selectedAsset.bestAsk.exchange} {t("at")} ${formatPrice(selectedAsset.bestAsk.price, selectedAsset.symbol)},
                      {t("sellOn")} {selectedAsset.bestBid.exchange} {t("at")} ${formatPrice(selectedAsset.bestBid.price, selectedAsset.symbol)}
                    </p>
                  </div>
                )}

                {/* Exchange Details Table */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">{t("exchange")}</th>
                        <th className="text-right p-3 font-medium">{t("bid")}</th>
                        <th className="text-right p-3 font-medium">{t("ask")}</th>
                        <th className="text-right p-3 font-medium">{t("spread")}</th>
                        <th className="text-right p-3 font-medium">{t("volume24h")}</th>
                        <th className="text-right p-3 font-medium">{t("latency")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAsset.prices.map((price) => (
                        <tr key={price.exchange} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{price.exchange}</span>
                              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                            </div>
                          </td>
                          <td className={cn(
                            "p-3 text-right font-mono",
                            price.bid === selectedAsset.bestBid.price && "text-green-500 font-semibold"
                          )}>
                            ${formatPrice(price.bid, selectedAsset.symbol)}
                          </td>
                          <td className={cn(
                            "p-3 text-right font-mono",
                            price.ask === selectedAsset.bestAsk.price && "text-blue-500 font-semibold"
                          )}>
                            ${formatPrice(price.ask, selectedAsset.symbol)}
                          </td>
                          <td className="p-3 text-right">
                            <span className={cn(
                              "text-sm",
                              price.spreadPercent < 0.05 ? "text-green-500" : "text-yellow-500"
                            )}>
                              {price.spreadPercent.toFixed(3)}%
                            </span>
                          </td>
                          <td className="p-3 text-right text-muted-foreground">
                            {formatVolume(price.volume24h)}
                          </td>
                          <td className="p-3 text-right">
                            <span className={cn(
                              "text-sm",
                              price.latency < 50 ? "text-green-500" :
                              price.latency < 100 ? "text-yellow-500" : "text-red-500"
                            )}>
                              {price.latency}ms
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("selectAssetHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
