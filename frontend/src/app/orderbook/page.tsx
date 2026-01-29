"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  BarChart3,
  RefreshCw,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
  DollarSign,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
  cumulative: number;
  percent: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  spreadPercent: number;
  midPrice: number;
  lastUpdate: string;
}

// Generate mock order book data
function generateOrderBook(symbol: string, midPrice: number, levels: number = 20): OrderBook {
  const tickSize = midPrice > 1000 ? 1 : midPrice > 100 ? 0.1 : 0.01;
  const bids: OrderLevel[] = [];
  const asks: OrderLevel[] = [];

  let bidCumulative = 0;
  let askCumulative = 0;

  // Generate bids (descending from mid price)
  for (let i = 0; i < levels; i++) {
    const price = midPrice - (i + 1) * tickSize * (1 + Math.random() * 0.5);
    const quantity = Math.random() * 10 + 0.5;
    bidCumulative += quantity;
    bids.push({
      price,
      quantity,
      total: price * quantity,
      cumulative: bidCumulative,
      percent: 0,
    });
  }

  // Generate asks (ascending from mid price)
  for (let i = 0; i < levels; i++) {
    const price = midPrice + (i + 1) * tickSize * (1 + Math.random() * 0.5);
    const quantity = Math.random() * 10 + 0.5;
    askCumulative += quantity;
    asks.push({
      price,
      quantity,
      total: price * quantity,
      cumulative: askCumulative,
      percent: 0,
    });
  }

  // Calculate percentages
  const maxCumulative = Math.max(bidCumulative, askCumulative);
  bids.forEach((bid) => (bid.percent = (bid.cumulative / maxCumulative) * 100));
  asks.forEach((ask) => (ask.percent = (ask.cumulative / maxCumulative) * 100));

  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const spread = bestAsk - bestBid;

  return {
    symbol,
    bids,
    asks,
    spread,
    spreadPercent: (spread / midPrice) * 100,
    midPrice: (bestBid + bestAsk) / 2,
    lastUpdate: new Date().toISOString(),
  };
}

const SYMBOLS = [
  { value: "BTC/USDT", label: "BTC/USDT", midPrice: 43250 },
  { value: "ETH/USDT", label: "ETH/USDT", midPrice: 2285 },
  { value: "SOL/USDT", label: "SOL/USDT", midPrice: 102.5 },
  { value: "BNB/USDT", label: "BNB/USDT", midPrice: 312.8 },
  { value: "XRP/USDT", label: "XRP/USDT", midPrice: 0.615 },
];

const DEPTH_LEVELS = [10, 15, 20, 25, 50];

export default function OrderBookPage() {
  const t = useTranslations("orderbookPage");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [levels, setLevels] = useState(15);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Get symbol config
  const symbolConfig = SYMBOLS.find((s) => s.value === symbol);

  // Generate order book
  const refreshOrderBook = () => {
    if (!symbolConfig) return;
    setLoading(true);
    setTimeout(() => {
      setOrderBook(generateOrderBook(symbol, symbolConfig.midPrice, levels));
      setLoading(false);
    }, 200);
  };

  // Initial load
  useEffect(() => {
    refreshOrderBook();
  }, [symbol, levels]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshOrderBook, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, symbol, levels]);

  // Calculate imbalance
  const imbalance = useMemo(() => {
    if (!orderBook) return 0;
    const bidVolume = orderBook.bids.reduce((sum, b) => sum + b.quantity, 0);
    const askVolume = orderBook.asks.reduce((sum, a) => sum + a.quantity, 0);
    return ((bidVolume - askVolume) / (bidVolume + askVolume)) * 100;
  }, [orderBook]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatQuantity = (qty: number) => {
    if (qty >= 100) return qty.toFixed(2);
    if (qty >= 1) return qty.toFixed(4);
    return qty.toFixed(6);
  };

  if (!orderBook) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className={cn("mr-2 h-4 w-4", autoRefresh && "text-yellow-500")} />
            {autoRefresh ? t("live") : t("auto")}
          </Button>
          <Button variant="outline" onClick={refreshOrderBook} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("symbol")}:</span>
              <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {SYMBOLS.map((s) => (
                  <SelectOption key={s.value} value={s.value}>
                    {s.label}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("depth")}:</span>
              <Select value={String(levels)} onChange={(e) => setLevels(Number(e.target.value))}>
                {DEPTH_LEVELS.map((l) => (
                  <SelectOption key={l} value={String(l)}>
                    {l} {t("levels")}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("midPrice")}: </span>
                <span className="font-mono font-semibold">${formatPrice(orderBook.midPrice)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("spread")}: </span>
                <span className="font-mono">${formatPrice(orderBook.spread)}</span>
                <span className="text-muted-foreground ml-1">
                  ({orderBook.spreadPercent.toFixed(4)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bestBid")}</p>
                <p className="text-xl font-bold font-mono text-green-500">
                  ${formatPrice(orderBook.bids[0].price)}
                </p>
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
                <p className="text-sm text-muted-foreground">{t("bestAsk")}</p>
                <p className="text-xl font-bold font-mono text-red-500">
                  ${formatPrice(orderBook.asks[0].price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalBidVolume")}</p>
                <p className="text-xl font-bold font-mono">
                  {orderBook.bids[orderBook.bids.length - 1].cumulative.toFixed(2)}
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
                imbalance >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <Activity className={cn(
                  "h-5 w-5",
                  imbalance >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("orderImbalance")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  imbalance >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {imbalance >= 0 ? "+" : ""}{imbalance.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Depth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("depthVisualization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 flex">
            {/* Bids side */}
            <div className="flex-1 flex flex-col justify-end">
              {[...orderBook.bids].reverse().map((bid, i) => (
                <div key={i} className="relative h-full flex items-end" style={{ flex: 1 }}>
                  <div
                    className="absolute right-0 bg-green-500/30 border-r-2 border-green-500 transition-all"
                    style={{
                      width: `${bid.percent}%`,
                      height: "100%",
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Center line */}
            <div className="w-px bg-border" />
            {/* Asks side */}
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((ask, i) => (
                <div key={i} className="relative h-full flex items-end" style={{ flex: 1 }}>
                  <div
                    className="absolute left-0 bg-red-500/30 border-l-2 border-red-500 transition-all"
                    style={{
                      width: `${ask.percent}%`,
                      height: "100%",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{t("bids")}</span>
            <span>{t("mid")}: ${formatPrice(orderBook.midPrice)}</span>
            <span>{t("asks")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Book Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bids */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t("bids")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-2 text-left">{t("price")}</th>
                    <th className="p-2 text-right">{t("quantity")}</th>
                    <th className="p-2 text-right">{t("total")}</th>
                    <th className="p-2 text-right">{t("cumulative")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBook.bids.map((bid, i) => (
                    <tr key={i} className="relative border-b hover:bg-muted/50">
                      <div
                        className="absolute inset-y-0 left-0 bg-green-500/10"
                        style={{ width: `${bid.percent}%` }}
                      />
                      <td className="p-2 relative font-mono text-green-500">
                        {formatPrice(bid.price)}
                      </td>
                      <td className="p-2 relative text-right font-mono">
                        {formatQuantity(bid.quantity)}
                      </td>
                      <td className="p-2 relative text-right font-mono text-muted-foreground">
                        ${bid.total.toFixed(2)}
                      </td>
                      <td className="p-2 relative text-right font-mono">
                        {formatQuantity(bid.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Asks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              {t("asks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-2 text-left">{t("price")}</th>
                    <th className="p-2 text-right">{t("quantity")}</th>
                    <th className="p-2 text-right">{t("total")}</th>
                    <th className="p-2 text-right">{t("cumulative")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBook.asks.map((ask, i) => (
                    <tr key={i} className="relative border-b hover:bg-muted/50">
                      <div
                        className="absolute inset-y-0 right-0 bg-red-500/10"
                        style={{ width: `${ask.percent}%` }}
                      />
                      <td className="p-2 relative font-mono text-red-500">
                        {formatPrice(ask.price)}
                      </td>
                      <td className="p-2 relative text-right font-mono">
                        {formatQuantity(ask.quantity)}
                      </td>
                      <td className="p-2 relative text-right font-mono text-muted-foreground">
                        ${ask.total.toFixed(2)}
                      </td>
                      <td className="p-2 relative text-right font-mono">
                        {formatQuantity(ask.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
