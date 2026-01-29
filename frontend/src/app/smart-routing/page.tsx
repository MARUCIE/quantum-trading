"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Route,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Play,
  Layers,
  Target,
  Shield,
  BarChart3,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface OrderRoute {
  exchange: string;
  allocation: number;
  estimatedPrice: number;
  estimatedSlippage: number;
  estimatedFee: number;
  liquidity: number;
  latency: number;
  confidence: number;
}

interface RoutingResult {
  symbol: string;
  side: "buy" | "sell";
  totalQuantity: number;
  totalValue: number;
  routes: OrderRoute[];
  savings: number;
  estimatedExecution: string;
  strategy: string;
}

interface ExecutedOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  avgPrice: number;
  exchanges: string[];
  savedAmount: number;
  executedAt: string;
  status: "filled" | "partial" | "failed";
}

// Mock data
function generateMockRouting(symbol: string, side: "buy" | "sell", quantity: number): RoutingResult {
  const basePrice = symbol === "BTC/USDT" ? 67500 : symbol === "ETH/USDT" ? 3450 : 142.5;
  const totalValue = quantity * basePrice;

  const routes: OrderRoute[] = [
    {
      exchange: "Binance",
      allocation: 45,
      estimatedPrice: basePrice * (1 + (side === "buy" ? 0.0001 : -0.0001)),
      estimatedSlippage: 0.02,
      estimatedFee: totalValue * 0.45 * 0.001,
      liquidity: 2500000,
      latency: 45,
      confidence: 98,
    },
    {
      exchange: "OKX",
      allocation: 30,
      estimatedPrice: basePrice * (1 + (side === "buy" ? 0.00015 : -0.00015)),
      estimatedSlippage: 0.03,
      estimatedFee: totalValue * 0.30 * 0.0008,
      liquidity: 1800000,
      latency: 62,
      confidence: 95,
    },
    {
      exchange: "Bybit",
      allocation: 25,
      estimatedPrice: basePrice * (1 + (side === "buy" ? 0.00012 : -0.00012)),
      estimatedSlippage: 0.025,
      estimatedFee: totalValue * 0.25 * 0.00075,
      liquidity: 1200000,
      latency: 55,
      confidence: 96,
    },
  ];

  return {
    symbol,
    side,
    totalQuantity: quantity,
    totalValue,
    routes,
    savings: totalValue * 0.0015,
    estimatedExecution: "< 500ms",
    strategy: "TWAP + Liquidity Split",
  };
}

function generateMockHistory(): ExecutedOrder[] {
  return [
    {
      id: "ord-001",
      symbol: "BTC/USDT",
      side: "buy",
      quantity: 2.5,
      avgPrice: 67485.23,
      exchanges: ["Binance", "OKX", "Bybit"],
      savedAmount: 125.50,
      executedAt: "2m ago",
      status: "filled",
    },
    {
      id: "ord-002",
      symbol: "ETH/USDT",
      side: "sell",
      quantity: 15,
      avgPrice: 3452.18,
      exchanges: ["Binance", "OKX"],
      savedAmount: 45.20,
      executedAt: "15m ago",
      status: "filled",
    },
    {
      id: "ord-003",
      symbol: "SOL/USDT",
      side: "buy",
      quantity: 100,
      avgPrice: 142.35,
      exchanges: ["Bybit", "OKX"],
      savedAmount: 18.75,
      executedAt: "1h ago",
      status: "filled",
    },
  ];
}

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];
const STRATEGIES = ["Best Price", "TWAP", "VWAP", "Liquidity Split", "Iceberg"];

export default function SmartRoutingPage() {
  const t = useTranslations("smartRoutingPage");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("1.0");
  const [strategy, setStrategy] = useState("TWAP + Liquidity Split");
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [history] = useState<ExecutedOrder[]>(generateMockHistory);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRoute = async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRoutingResult(generateMockRouting(symbol, side, parseFloat(quantity)));
    setIsCalculating(false);
  };

  const stats = useMemo(() => ({
    totalSaved: history.reduce((sum, o) => sum + o.savedAmount, 0),
    ordersRouted: history.length,
    avgSavings: history.reduce((sum, o) => sum + o.savedAmount, 0) / history.length,
    successRate: (history.filter((o) => o.status === "filled").length / history.length) * 100,
  }), [history]);

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
        <Badge variant="outline" className="bg-green-500/10 text-green-500">
          <Zap className="mr-1 h-3 w-3" />
          {t("active")}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalSaved")}</p>
                <p className="text-xl font-bold text-green-500">${stats.totalSaved.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Route className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("ordersRouted")}</p>
                <p className="text-xl font-bold">{stats.ordersRouted}</p>
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
                <p className="text-sm text-muted-foreground">{t("avgSavings")}</p>
                <p className="text-xl font-bold">${stats.avgSavings.toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">{t("successRate")}</p>
                <p className="text-xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("orderConfiguration")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("symbol")}</label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                >
                  {SYMBOLS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("side")}</label>
                <div className="flex gap-2">
                  <Button
                    variant={side === "buy" ? "default" : "outline"}
                    className={cn("flex-1", side === "buy" && "bg-green-500 hover:bg-green-600")}
                    onClick={() => setSide("buy")}
                  >
                    <TrendingUp className="mr-1 h-4 w-4" />
                    {t("buy")}
                  </Button>
                  <Button
                    variant={side === "sell" ? "default" : "outline"}
                    className={cn("flex-1", side === "sell" && "bg-red-500 hover:bg-red-600")}
                    onClick={() => setSide("sell")}
                  >
                    <TrendingDown className="mr-1 h-4 w-4" />
                    {t("sell")}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("quantity")}</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t("enterQuantity")}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("executionStrategy")}</label>
              <div className="flex flex-wrap gap-2">
                {STRATEGIES.map((s) => (
                  <Button
                    key={s}
                    variant={strategy.includes(s) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setStrategy(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={calculateRoute}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("calculating")}
                </>
              ) : (
                <>
                  <Route className="mr-2 h-4 w-4" />
                  {t("calculateOptimalRoute")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Routing Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t("optimalRoute")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routingResult ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">
                      {routingResult.side === "buy" ? t("buy").toUpperCase() : t("sell").toUpperCase()} {routingResult.totalQuantity} {routingResult.symbol.split("/")[0]}
                    </span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      {t("save")} ${routingResult.savings.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("totalValue")}</p>
                      <p className="font-semibold">${routingResult.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("estExecution")}</p>
                      <p className="font-semibold">{routingResult.estimatedExecution}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("strategy")}</p>
                      <p className="font-semibold">{routingResult.strategy}</p>
                    </div>
                  </div>
                </div>

                {/* Routes */}
                <div className="space-y-3">
                  {routingResult.routes.map((route, index) => (
                    <div key={route.exchange} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{route.exchange}</span>
                          <Badge>{route.allocation}%</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            {route.confidence}% {t("confidence")}
                          </Badge>
                        </div>
                      </div>

                      {/* Allocation Bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                          className={cn(
                            "h-full",
                            index === 0 ? "bg-blue-500" :
                            index === 1 ? "bg-purple-500" : "bg-orange-500"
                          )}
                          style={{ width: `${route.allocation}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">{t("price")}</p>
                          <p className="font-medium">${route.estimatedPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("slippage")}</p>
                          <p className="font-medium">{route.estimatedSlippage.toFixed(3)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("fee")}</p>
                          <p className="font-medium">${route.estimatedFee.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("latency")}</p>
                          <p className="font-medium">{route.latency}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  {t("executeOrder")}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("configureOrderHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("recentRoutedOrders")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    order.side === "buy" ? "bg-green-500/10" : "bg-red-500/10"
                  )}>
                    {order.side === "buy" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.symbol}</span>
                      <Badge variant="outline" className={cn(
                        order.side === "buy" ? "text-green-500" : "text-red-500"
                      )}>
                        {order.side === "buy" ? t("buy").toUpperCase() : t("sell").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} @ ${order.avgPrice.toFixed(2)} {t("via")} {order.exchanges.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-500">+${order.savedAmount.toFixed(2)} {t("saved")}</p>
                  <p className="text-xs text-muted-foreground">{order.executedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
