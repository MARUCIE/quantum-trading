"use client";

/**
 * Mobile Dashboard Page (T104)
 *
 * Mobile-optimized trading dashboard with touch-friendly interface.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Wallet,
  TrendingUp,
  TrendingDown,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Settings,
  ChevronRight,
  Activity,
  BarChart2,
  PieChart,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface Position {
  pair: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface MarketItem {
  pair: string;
  price: number;
  change: number;
  volume: string;
}

// Mock data - positions and market data remain static
const POSITIONS: Position[] = [
  { pair: "BTC/USDT", side: "long", size: 0.5, entryPrice: 66500, currentPrice: 67800, pnl: 650, pnlPercent: 1.95 },
  { pair: "ETH/USDT", side: "long", size: 5, entryPrice: 3380, currentPrice: 3450, pnl: 350, pnlPercent: 2.07 },
  { pair: "SOL/USDT", side: "short", size: 50, entryPrice: 188, currentPrice: 185, pnl: 150, pnlPercent: 1.60 },
];

const MARKET_DATA: MarketItem[] = [
  { pair: "BTC/USDT", price: 67800, change: 2.34, volume: "1.2B" },
  { pair: "ETH/USDT", price: 3450, change: 1.89, volume: "890M" },
  { pair: "SOL/USDT", price: 185, change: -0.56, volume: "320M" },
  { pair: "AVAX/USDT", price: 42.5, change: 3.12, volume: "125M" },
  { pair: "LINK/USDT", price: 18.5, change: -1.24, volume: "89M" },
];

export default function MobileDashboardPage() {
  const t = useTranslations("mobilePage");
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<"positions" | "market">("positions");

  // Quick actions with translated labels - moved inside component to use t()
  const QUICK_ACTIONS: QuickAction[] = [
    { id: "buy", label: t("buy"), icon: Plus, color: "green" },
    { id: "sell", label: t("sell"), icon: TrendingDown, color: "red" },
    { id: "alerts", label: t("alerts"), icon: Bell, color: "blue" },
    { id: "scan", label: t("scan"), icon: Zap, color: "purple" },
  ];

  const totalBalance = 125680.45;
  const dailyPnl = 2345.67;
  const dailyPnlPercent = 1.89;

  const totalPositionPnl = POSITIONS.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="flex-1 p-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t("totalBalance")}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-3xl font-bold mb-4">
            {showBalance ? `$${totalBalance.toLocaleString()}` : "••••••"}
          </p>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm",
              dailyPnl >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {dailyPnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="font-medium">
                {showBalance ? `$${dailyPnl.toLocaleString()}` : "••••"}
              </span>
              <span>({dailyPnlPercent >= 0 ? "+" : ""}{dailyPnlPercent}%)</span>
            </div>
            <span className="text-xs text-muted-foreground">{t("today")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="flex-col h-auto py-4 gap-2"
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              `bg-${action.color}-500/10`
            )}>
              <action.icon className={cn("h-5 w-5", `text-${action.color}-500`)} />
            </div>
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === "positions" ? "secondary" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("positions")}
        >
          <Activity className="mr-2 h-4 w-4" />
          {t("positions")}
        </Button>
        <Button
          variant={activeTab === "market" ? "secondary" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("market")}
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          {t("market")}
        </Button>
      </div>

      {/* Positions Tab */}
      {activeTab === "positions" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t("openPositions")}</CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  totalPositionPnl >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {totalPositionPnl >= 0 ? "+" : ""}${totalPositionPnl}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {POSITIONS.map((position, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold",
                    position.side === "long" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {position.pair.split("/")[0].slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-medium">{position.pair}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-4",
                          position.side === "long" ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {position.side.toUpperCase()}
                      </Badge>
                      <span>{position.size}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-mono font-medium",
                    position.pnl >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {position.pnl >= 0 ? "+" : ""}${position.pnl}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent}%
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}

            {POSITIONS.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("noOpenPositions")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Tab */}
      {activeTab === "market" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t("marketOverview")}</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MARKET_DATA.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 active:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {item.pair.split("/")[0].slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-medium">{item.pair}</p>
                    <p className="text-xs text-muted-foreground">{t("volume")}: {item.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium">${item.price.toLocaleString()}</p>
                  <p className={cn(
                    "text-xs",
                    item.change >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {item.change >= 0 ? "+" : ""}{item.change}%
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              <span className="font-medium">{t("portfolio")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {["BTC", "ETH", "SOL"].map((coin, i) => (
                  <div
                    key={coin}
                    className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[8px] font-bold"
                    style={{ zIndex: 3 - i }}
                  >
                    {coin.slice(0, 2)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{t("more", { count: 3 })}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Navigation Hint */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around max-w-md mx-auto">
        <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
          <Wallet className="h-5 w-5" />
          <span className="text-[10px]">{t("navPortfolio")}</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
          <BarChart2 className="h-5 w-5" />
          <span className="text-[10px]">{t("navTrade")}</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2 gap-1 text-primary">
          <Activity className="h-5 w-5" />
          <span className="text-[10px]">{t("navHome")}</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px]">{t("navMarkets")}</span>
        </Button>
        <Button variant="ghost" className="flex-col h-auto py-2 gap-1">
          <Settings className="h-5 w-5" />
          <span className="text-[10px]">{t("navSettings")}</span>
        </Button>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-16" />
    </div>
  );
}
