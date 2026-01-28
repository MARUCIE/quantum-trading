"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface ReplayCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ReplayTrade {
  id: string;
  type: "entry" | "exit";
  side: "long" | "short";
  price: number;
  quantity: number;
  time: number;
  pnl?: number;
}

interface ReplaySession {
  id: string;
  symbol: string;
  date: string;
  strategy: string;
  trades: ReplayTrade[];
  candles: ReplayCandle[];
  finalPnL: number;
  notes: string;
}

// Mock data generator
function generateReplaySession(symbol: string): ReplaySession {
  const basePrice = symbol === "BTC/USDT" ? 43000 : symbol === "ETH/USDT" ? 2280 : 100;
  const startTime = new Date().getTime() - 4 * 60 * 60 * 1000; // 4 hours ago
  const candles: ReplayCandle[] = [];
  const trades: ReplayTrade[] = [];

  let currentPrice = basePrice;

  // Generate candles (1 minute intervals)
  for (let i = 0; i < 240; i++) {
    const change = (Math.random() - 0.48) * (basePrice * 0.001);
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.0005);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.0005);

    candles.push({
      time: startTime + i * 60 * 1000,
      open,
      high,
      low,
      close,
      volume: Math.random() * 100 + 10,
    });

    currentPrice = close;
  }

  // Generate trades
  const entryIndex = Math.floor(Math.random() * 60) + 30;
  const exitIndex = entryIndex + Math.floor(Math.random() * 100) + 30;
  const side = Math.random() > 0.5 ? "long" : "short";
  const entryPrice = candles[entryIndex].close;
  const exitPrice = candles[exitIndex].close;
  const quantity = side === "long" ? 0.5 : 0.5;
  const pnl = side === "long"
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;

  trades.push({
    id: "t1",
    type: "entry",
    side,
    price: entryPrice,
    quantity,
    time: candles[entryIndex].time,
  });

  trades.push({
    id: "t2",
    type: "exit",
    side,
    price: exitPrice,
    quantity,
    time: candles[exitIndex].time,
    pnl,
  });

  return {
    id: "session-1",
    symbol,
    date: new Date().toISOString().split("T")[0],
    strategy: "BTC Momentum",
    trades,
    candles,
    finalPnL: pnl,
    notes: "Entry on MA crossover. Exit at target.",
  };
}

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
const SPEEDS = [0.5, 1, 2, 5, 10];

export default function ReplayPage() {
  const t = useTranslations("replayPage");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [session, setSession] = useState<ReplaySession | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load session
  useEffect(() => {
    setSession(generateReplaySession(symbol));
    setCurrentIndex(0);
    setPlaying(false);
  }, [symbol]);

  // Playback logic
  useEffect(() => {
    if (!playing || !session) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= session.candles.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, speed, session]);

  // Current state calculations
  const currentState = useMemo(() => {
    if (!session) return null;

    const visibleCandles = session.candles.slice(0, currentIndex + 1);
    const currentCandle = visibleCandles[visibleCandles.length - 1];
    const currentTime = currentCandle?.time || 0;

    // Find active trades
    const executedTrades = session.trades.filter((t) => t.time <= currentTime);
    const entryTrade = executedTrades.find((t) => t.type === "entry");
    const exitTrade = executedTrades.find((t) => t.type === "exit");

    let positionStatus: "none" | "open" | "closed" = "none";
    let unrealizedPnL = 0;
    let realizedPnL = 0;

    if (entryTrade && !exitTrade) {
      positionStatus = "open";
      const priceDiff = entryTrade.side === "long"
        ? currentCandle.close - entryTrade.price
        : entryTrade.price - currentCandle.close;
      unrealizedPnL = priceDiff * entryTrade.quantity;
    } else if (entryTrade && exitTrade) {
      positionStatus = "closed";
      realizedPnL = exitTrade.pnl || 0;
    }

    // Calculate price stats
    const high = Math.max(...visibleCandles.map((c) => c.high));
    const low = Math.min(...visibleCandles.map((c) => c.low));
    const change = ((currentCandle.close - visibleCandles[0].open) / visibleCandles[0].open) * 100;

    return {
      visibleCandles,
      currentCandle,
      currentTime,
      executedTrades,
      positionStatus,
      unrealizedPnL,
      realizedPnL,
      high,
      low,
      change,
    };
  }, [session, currentIndex]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price >= 1000 ? price.toFixed(2) : price.toFixed(4);
  };

  const handleSeek = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, (session?.candles.length || 1) - 1)));
  };

  if (!session || !currentState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Play className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

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
        <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {SYMBOLS.map((s) => (
            <SelectOption key={s} value={s}>{s}</SelectOption>
          ))}
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("time")}</p>
                <p className="text-xl font-bold">
                  {formatTime(currentState.currentTime)}
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
                currentState.change >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {currentState.change >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("price")}</p>
                <p className="text-xl font-bold">
                  ${formatPrice(currentState.currentCandle.close)}
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
                currentState.positionStatus === "open" ? "bg-yellow-500/10" :
                currentState.positionStatus === "closed" ? "bg-green-500/10" : "bg-gray-500/10"
              )}>
                <Activity className={cn(
                  "h-5 w-5",
                  currentState.positionStatus === "open" ? "text-yellow-500" :
                  currentState.positionStatus === "closed" ? "text-green-500" : "text-gray-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("position")}</p>
                <p className="text-xl font-bold capitalize">
                  {currentState.positionStatus === "none" ? t("none") :
                   currentState.positionStatus === "open" ? t("open") : t("closed")}
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
                (currentState.unrealizedPnL + currentState.realizedPnL) >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <DollarSign className={cn(
                  "h-5 w-5",
                  (currentState.unrealizedPnL + currentState.realizedPnL) >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("pnl")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  (currentState.unrealizedPnL + currentState.realizedPnL) >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  ${(currentState.unrealizedPnL + currentState.realizedPnL).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Area */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {session.symbol} - {session.strategy}
            </span>
            <Badge variant="outline">
              {currentIndex + 1} / {session.candles.length} {t("candles")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simple price visualization */}
          <div className="h-48 relative bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-end">
              {currentState.visibleCandles.slice(-60).map((candle, i) => {
                const height = ((candle.close - currentState.low) / (currentState.high - currentState.low)) * 100;
                const isGreen = candle.close >= candle.open;

                // Check if trade occurred at this candle
                const hasTrade = session.trades.some(
                  (t) => Math.abs(t.time - candle.time) < 60000
                );

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end items-center"
                    style={{ minWidth: 2 }}
                  >
                    <div
                      className={cn(
                        "w-full mx-px",
                        isGreen ? "bg-green-500" : "bg-red-500",
                        hasTrade && "ring-2 ring-yellow-500"
                      )}
                      style={{ height: `${Math.max(2, height)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Trade markers */}
            {currentState.executedTrades.map((trade) => (
              <div
                key={trade.id}
                className={cn(
                  "absolute top-2 px-2 py-1 rounded text-xs font-semibold",
                  trade.type === "entry" ? "bg-blue-500 text-white" : "bg-yellow-500 text-black"
                )}
                style={{
                  left: `${((session.candles.findIndex((c) => c.time >= trade.time)) / Math.min(60, currentIndex + 1)) * 100}%`,
                }}
              >
                {trade.type === "entry" ? t("entry") : t("exit")} @ ${formatPrice(trade.price)}
              </div>
            ))}
          </div>

          {/* Timeline slider */}
          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={session.candles.length - 1}
              value={currentIndex}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Playback controls */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => handleSeek(0)}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleSeek(currentIndex - 10)}>
              <Rewind className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => setPlaying(!playing)}
              className="h-12 w-12 rounded-full"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleSeek(currentIndex + 10)}>
              <FastForward className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleSeek(session.candles.length - 1)}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("speed")}:</span>
              {SPEEDS.map((s) => (
                <Button
                  key={s}
                  variant={speed === s ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("tradeLog")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.trades.map((trade) => {
              const isExecuted = trade.time <= currentState.currentTime;

              return (
                <div
                  key={trade.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isExecuted ? "bg-card" : "bg-muted/30 opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isExecuted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={trade.side === "long" ? "default" : "destructive"}>
                          {trade.side.toUpperCase()}
                        </Badge>
                        <Badge variant={trade.type === "entry" ? "outline" : "secondary"}>
                          {trade.type === "entry" ? t("entry") : t("exit")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTime(trade.time)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">${formatPrice(trade.price)}</p>
                    <p className="text-sm text-muted-foreground">{trade.quantity} {t("units")}</p>
                    {trade.pnl !== undefined && isExecuted && (
                      <p className={cn(
                        "font-semibold",
                        trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {session.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{t("notes")}</p>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
