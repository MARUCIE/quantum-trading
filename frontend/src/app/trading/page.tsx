"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { generateMockCandlestickData } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

const mockOrderBook = {
  bids: [
    { price: 43245.5, size: 2.5 },
    { price: 43244.0, size: 1.8 },
    { price: 43242.5, size: 3.2 },
    { price: 43240.0, size: 5.1 },
    { price: 43238.5, size: 2.9 },
    { price: 43236.0, size: 4.2 },
    { price: 43234.5, size: 1.5 },
    { price: 43232.0, size: 6.8 },
  ],
  asks: [
    { price: 43246.0, size: 1.2 },
    { price: 43247.5, size: 2.1 },
    { price: 43249.0, size: 4.5 },
    { price: 43251.5, size: 3.3 },
    { price: 43253.0, size: 2.7 },
    { price: 43255.5, size: 5.4 },
    { price: 43257.0, size: 1.9 },
    { price: 43259.5, size: 4.1 },
  ],
};

export default function TradingPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const chartData = useMemo(() => generateMockCandlestickData(90), []);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const maxSize = Math.max(
    ...mockOrderBook.bids.map((b) => b.size),
    ...mockOrderBook.asks.map((a) => a.size)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Trading</h1>
          <p className="text-muted-foreground">
            Real-time market data and order management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">Connected</span>
        </div>
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

      {/* Main Trading View */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-4">
              <CardTitle>{selectedSymbol}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-500">
                  $43,245.50
                </span>
                <Badge variant="outline" className="text-green-500">
                  +2.34%
                </Badge>
              </div>
            </div>
            <Tabs defaultValue="1D">
              <TabsList className="h-8">
                <TabsTrigger value="1m" className="text-xs">
                  1m
                </TabsTrigger>
                <TabsTrigger value="5m" className="text-xs">
                  5m
                </TabsTrigger>
                <TabsTrigger value="15m" className="text-xs">
                  15m
                </TabsTrigger>
                <TabsTrigger value="1H" className="text-xs">
                  1H
                </TabsTrigger>
                <TabsTrigger value="4H" className="text-xs">
                  4H
                </TabsTrigger>
                <TabsTrigger value="1D" className="text-xs">
                  1D
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <CandlestickChart data={chartData} height={500} />
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Order Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {/* Asks (reversed to show lowest at bottom) */}
            <div className="space-y-0.5">
              {[...mockOrderBook.asks].reverse().map((ask, i) => (
                <div
                  key={`ask-${i}`}
                  className="relative flex items-center justify-between px-2 py-0.5 text-xs"
                >
                  <div
                    className="absolute right-0 top-0 h-full bg-red-500/10"
                    style={{ width: `${(ask.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-red-500">
                    {formatPrice(ask.price)}
                  </span>
                  <span className="relative font-mono text-muted-foreground">
                    {ask.size.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="border-y border-border py-2 text-center">
              <span className="text-xs text-muted-foreground">Spread: </span>
              <span className="text-xs font-mono">$0.50 (0.001%)</span>
            </div>

            {/* Bids */}
            <div className="space-y-0.5">
              {mockOrderBook.bids.map((bid, i) => (
                <div
                  key={`bid-${i}`}
                  className="relative flex items-center justify-between px-2 py-0.5 text-xs"
                >
                  <div
                    className="absolute right-0 top-0 h-full bg-green-500/10"
                    style={{ width: `${(bid.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-green-500">
                    {formatPrice(bid.price)}
                  </span>
                  <span className="relative font-mono text-muted-foreground">
                    {bid.size.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Entry & Open Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="limit">
              <TabsList className="w-full">
                <TabsTrigger value="market" className="flex-1">
                  Market
                </TabsTrigger>
                <TabsTrigger value="limit" className="flex-1">
                  Limit
                </TabsTrigger>
                <TabsTrigger value="stop" className="flex-1">
                  Stop
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Price</label>
                <input
                  type="text"
                  defaultValue="43,245.50"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <input
                  type="text"
                  defaultValue="0.1"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Total</label>
                <input
                  type="text"
                  value="$4,324.55"
                  disabled
                  className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-green-600 hover:bg-green-700">Buy</Button>
              <Button variant="destructive">Sell</Button>
            </div>
          </CardContent>
        </Card>

        {/* Open Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                {
                  id: "1",
                  symbol: "BTC/USDT",
                  side: "buy",
                  type: "Limit",
                  price: 42500,
                  amount: 0.5,
                  filled: 0.2,
                },
                {
                  id: "2",
                  symbol: "ETH/USDT",
                  side: "sell",
                  type: "Limit",
                  price: 2400,
                  amount: 5,
                  filled: 0,
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
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
                    <div>
                      <p className="font-medium">{order.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.type} @ {formatPrice(order.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      {order.filled}/{order.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((order.filled / order.amount) * 100).toFixed(0)}% filled
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
