"use client";

/**
 * Real-time Trading Page
 *
 * Live market data, order book, and trade execution interface.
 * Integrates WebSocket for real-time price updates and trade feed.
 * Uses Trading Components for unified UX.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicCandlestickChart } from "@/components/charts/dynamic-candlestick-chart";
import { generateMockCandlestickData } from "@/lib/mock-data";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWebSocket, useTicker, useTrades, useOrderBook } from "@/lib/ws";
import { useToast } from "@/components/ui/toast";
import {
  QuickOrderForm,
  OrderBook as OrderBookComponent,
  PositionSummary,
  RecentTrades,
} from "@/components/trading";
import { useTradingStore } from "@/lib/stores";
import { useTranslations } from "next-intl";
import { useAssetClass, type AssetClass } from "@/lib/assets";

// Symbols available for each asset class
const SYMBOLS_BY_CLASS: Record<AssetClass, string[]> = {
  crypto: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"],
  stocks: ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL"],
  futures: ["ES", "NQ", "CL", "GC", "ZB"],
  options: ["SPY", "QQQ", "IWM", "AAPL", "TSLA"],
};

// Convert symbol format: "BTC/USDT" -> "BTCUSDT" (for WebSocket)
function toWsSymbol(symbol: string): string {
  return symbol.replace("/", "").toUpperCase();
}

// Base prices for each symbol (fallback when no WebSocket data)
const basePrices: Record<string, number> = {
  // Crypto
  "BTC/USDT": 43245.5,
  "ETH/USDT": 2345.67,
  "SOL/USDT": 98.45,
  "BNB/USDT": 312.78,
  // Stocks
  "AAPL": 178.50,
  "NVDA": 485.20,
  "TSLA": 248.30,
  "MSFT": 378.90,
  "GOOGL": 141.25,
  // Futures
  "ES": 4785.25,
  "NQ": 16892.50,
  "CL": 78.45,
  "GC": 2045.30,
  "ZB": 118.75,
  // Options (underlying prices)
  "SPY": 478.50,
  "QQQ": 405.20,
  "IWM": 198.45,
};

export default function TradingPage() {
  const t = useTranslations("tradingPage");
  const tTrading = useTranslations("trading");
  const tAsset = useTranslations("assetClass");
  const { assetClass } = useAssetClass();

  // Get symbols for current asset class
  const symbols = SYMBOLS_BY_CLASS[assetClass];
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);

  // Reset selected symbol when asset class changes
  useEffect(() => {
    setSelectedSymbol(SYMBOLS_BY_CLASS[assetClass][0]);
  }, [assetClass]);

  // Regenerate chart data when symbol changes
  const chartData = useMemo(
    () => generateMockCandlestickData(90, selectedSymbol),
    [selectedSymbol]
  );

  // Trading store
  const {
    orders,
    positions,
    bids,
    asks,
    recentTrades,
    submitOrder,
    isSubmittingOrder,
    cancelOrder,
    setCurrentSymbol,
    setMarketPrice,
    refreshOrders,
    refreshPositions,
    refreshTrades,
    refreshAccountBalance,
  } = useTradingStore();

  // WebSocket connection status
  const { state: wsState, isConnected, reconnect } = useWebSocket();

  // Real-time ticker data
  const ticker = useTicker(toWsSymbol(selectedSymbol));

  // Real-time trade feed from WebSocket
  const wsTrades = useTrades(toWsSymbol(selectedSymbol), 20);

  // Real-time order book from WebSocket
  const wsOrderBook = useOrderBook(toWsSymbol(selectedSymbol));

  // Toast notifications
  const { addToast } = useToast();

  // Track price changes for color indication
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | "neutral">("neutral");
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  // Update store when symbol changes
  useEffect(() => {
    setCurrentSymbol(selectedSymbol);
  }, [selectedSymbol, setCurrentSymbol]);

  useEffect(() => {
    void refreshOrders();
    void refreshPositions();
    void refreshTrades();
    void refreshAccountBalance();
  }, [refreshOrders, refreshPositions, refreshTrades, refreshAccountBalance]);

  // Update store when price changes
  useEffect(() => {
    if (ticker?.last) {
      setMarketPrice(ticker.last);
    }
  }, [ticker?.last, setMarketPrice]);

  // Update price direction when ticker changes
  useEffect(() => {
    if (ticker?.last && prevPrice !== null) {
      if (ticker.last > prevPrice) {
        setPriceDirection("up");
      } else if (ticker.last < prevPrice) {
        setPriceDirection("down");
      }
      // Reset direction after animation
      const timer = setTimeout(() => setPriceDirection("neutral"), 500);
      return () => clearTimeout(timer);
    }
    if (ticker?.last) {
      setPrevPrice(ticker.last);
    }
  }, [ticker?.last, prevPrice]);

  // Show toast for large trades
  useEffect(() => {
    if (wsTrades.length > 0) {
      const latestTrade = wsTrades[0];
      const tradeValue = latestTrade.price * latestTrade.quantity;
      // Notify for trades > $10,000
      if (tradeValue > 10000) {
        addToast({
          type: latestTrade.side === "buy" ? "success" : "warning",
          title: latestTrade.side === "buy" ? t("largeBuyDetected") : t("largeSellDetected"),
          message: `${latestTrade.quantity.toFixed(4)} @ $${latestTrade.price.toLocaleString()}`,
          duration: 3000,
        });
      }
    }
  }, [wsTrades.length, addToast]);

  // Current price (from WebSocket or fallback)
  const currentPrice = ticker?.last ?? basePrices[selectedSymbol];
  const bidPrice = ticker?.bid ?? currentPrice * 0.9999;
  const askPrice = ticker?.ask ?? currentPrice * 1.0001;

  // Calculate 24h change
  const priceChange = ((currentPrice - basePrices[selectedSymbol]) / basePrices[selectedSymbol]) * 100;
  const isPositiveChange = priceChange >= 0;

  const formatPrice = (value: number, decimals: number = 2) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

  // Convert WebSocket order book to component format
  const orderBookData = wsOrderBook
    ? {
        bids: wsOrderBook.bids.map((b, i) => ({
          price: b.price,
          quantity: b.size,
          total: wsOrderBook.bids.slice(0, i + 1).reduce((sum, x) => sum + x.size, 0),
        })),
        asks: wsOrderBook.asks.map((a, i) => ({
          price: a.price,
          quantity: a.size,
          total: wsOrderBook.asks.slice(0, i + 1).reduce((sum, x) => sum + x.size, 0),
        })),
      }
    : { bids, asks };

  // Convert WebSocket trades to component format
  const tradesData = wsTrades.length > 0
    ? wsTrades.map((t) => ({
        id: t.id,
        symbol: selectedSymbol,
        side: t.side as "buy" | "sell",
        price: t.price,
        quantity: t.quantity,
        total: t.price * t.quantity,
        timestamp: new Date(t.timestamp),
      }))
    : recentTrades;

  const openOrders = orders
    .filter((order) => ["pending", "submitted", "partial"].includes(order.status))
    .slice(0, 5);
  const orderHistory = orders
    .filter((order) => ["filled", "cancelled", "rejected", "expired"].includes(order.status))
    .slice(0, 5);

  // Connection status indicator
  const connectionStatus = {
    connected: { color: "bg-green-500", text: t("connected"), ping: true },
    connecting: { color: "bg-yellow-500", text: t("connecting"), ping: true },
    disconnected: { color: "bg-red-500", text: t("disconnected"), ping: false },
  }[wsState];

  // Handle quick order submission
  const handleQuickOrder = async (order: { side: "buy" | "sell"; quantity: number }) => {
    const fullOrder = {
      symbol: selectedSymbol,
      side: order.side,
      type: "market" as const,
      quantity: order.quantity,
      timeInForce: "GTC" as const,
    };
    const result = await submitOrder(fullOrder);
    if (result) {
      addToast({
        type: "success",
        title: t("orderPlaced"),
        message: `${order.side.toUpperCase()} ${order.quantity} ${selectedSymbol} @ Market`,
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
        <button
          onClick={!isConnected ? reconnect : undefined}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          title={isConnected ? "WebSocket connected" : "Click to reconnect"}
        >
          <span className="relative flex h-2 w-2">
            {connectionStatus.ping && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  connectionStatus.color
                )}
              />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                connectionStatus.color
              )}
            />
          </span>
          <span className="text-sm text-muted-foreground">
            {connectionStatus.text}
          </span>
        </button>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2">
        {symbols.map((symbol) => (
          <Button
            key={symbol}
            variant={selectedSymbol === symbol ? "default" : "outline"}
            onClick={() => setSelectedSymbol(symbol)}
          >
            {symbol}
          </Button>
        ))}
      </div>

      {/* Position Summary (if positions exist) */}
      {positions.length > 0 && (
        <PositionSummary positions={positions} />
      )}

      {/* Main Trading View */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <CardTitle>{selectedSymbol}</CardTitle>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-2xl font-bold transition-colors duration-200",
                    priceDirection === "up" && "text-green-500",
                    priceDirection === "down" && "text-red-500",
                    priceDirection === "neutral" && (isPositiveChange ? "text-green-500" : "text-red-500")
                  )}
                >
                  {formatPrice(currentPrice)}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    isPositiveChange
                      ? "text-green-500 border-green-500/50"
                      : "text-red-500 border-red-500/50"
                  )}
                >
                  {isPositiveChange ? "+" : ""}{priceChange.toFixed(2)}%
                </Badge>
              </div>
            </div>
            <Tabs defaultValue="1D">
              <TabsList className="h-8">
                <TabsTrigger value="1m" className="text-xs">1m</TabsTrigger>
                <TabsTrigger value="5m" className="text-xs">5m</TabsTrigger>
                <TabsTrigger value="15m" className="text-xs">15m</TabsTrigger>
                <TabsTrigger value="1H" className="text-xs">1H</TabsTrigger>
                <TabsTrigger value="4H" className="text-xs">4H</TabsTrigger>
                <TabsTrigger value="1D" className="text-xs">1D</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DynamicCandlestickChart data={chartData} height={400} />
          </CardContent>
        </Card>

        {/* Order Book Component */}
        <OrderBookComponent
          symbol={selectedSymbol}
          bids={orderBookData.bids}
          asks={orderBookData.asks}
          lastPrice={currentPrice}
          priceChange={priceChange}
        />
      </div>

      {/* Order Entry, Recent Trades & Positions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Order Form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("quickOrder")}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickOrderForm
              symbol={selectedSymbol}
              marketPrice={currentPrice}
              onSubmit={handleQuickOrder}
              isLoading={isSubmittingOrder}
            />
          </CardContent>
        </Card>

        {/* Recent Trades Component */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{tTrading("recentTrades")}</CardTitle>
              {isConnected && (
                <Badge variant="outline" className="text-xs">{t("live")}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RecentTrades
              trades={tradesData}
              maxItems={15}
            />
          </CardContent>
        </Card>

        {/* Trading Tabs */}
        <Card>
          <Tabs defaultValue="orders">
            <CardHeader className="pb-2">
              <TabsList className="w-full">
                <TabsTrigger value="orders" className="flex-1">{t("openOrders")}</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">{t("history")}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="orders" className="mt-0">
                <div className="space-y-2">
                  {openOrders.map((order) => (
                      <div
                        key={order.orderId}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              order.side === "buy"
                                ? "border-green-500/50 text-green-500"
                                : "border-red-500/50 text-red-500"
                            )}
                          >
                            {order.side.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-xs">
                            {order.quantity} @{" "}
                            {order.type === "market"
                              ? tTrading("market")
                              : formatPrice(order.price || order.avgPrice || 0)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-destructive"
                          onClick={() => cancelOrder(order.orderId)}
                        >
                          {tTrading("cancelOrder")}
                        </Button>
                      </div>
                    ))}
                  {openOrders.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      {t("noOpenOrders")}
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <div className="space-y-2">
                  {orderHistory.map((order) => (
                      <div
                        key={order.orderId}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {order.status.toUpperCase()}
                          </Badge>
                          <span className="font-mono text-xs">
                            {order.quantity} @{" "}
                            {order.type === "market"
                              ? formatPrice(order.avgPrice || 0)
                              : formatPrice(order.price || order.avgPrice || 0)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  {orderHistory.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      {t("noOrderHistory")}
                    </p>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
