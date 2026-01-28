"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Tag,
  MessageSquare,
  Image,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Percent,
  Clock,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface TradeEntry {
  id: string;
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryDate: string;
  exitDate: string;
  pnl: number;
  pnlPercent: number;
  fees: number;
  tags: string[];
  notes: string;
  setup: string;
  emotion: "confident" | "neutral" | "fearful" | "greedy";
  rating: 1 | 2 | 3 | 4 | 5;
  screenshots: string[];
}

// Mock data
const MOCK_TRADES: TradeEntry[] = [
  {
    id: "1",
    symbol: "BTC/USDT",
    side: "long",
    entryPrice: 42500,
    exitPrice: 43200,
    quantity: 0.5,
    entryDate: "2026-01-25T09:30:00Z",
    exitDate: "2026-01-25T14:45:00Z",
    pnl: 350,
    pnlPercent: 1.65,
    fees: 8.5,
    tags: ["breakout", "trend-following"],
    notes: "Clean breakout above resistance. Entered on retest of breakout level. Exit at first target.",
    setup: "Breakout + Retest",
    emotion: "confident",
    rating: 4,
    screenshots: [],
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    side: "short",
    entryPrice: 2280,
    exitPrice: 2320,
    quantity: 2,
    entryDate: "2026-01-24T16:00:00Z",
    exitDate: "2026-01-24T18:30:00Z",
    pnl: -80,
    pnlPercent: -1.75,
    fees: 4.5,
    tags: ["reversal", "counter-trend"],
    notes: "Tried to catch falling knife. Should have waited for confirmation.",
    setup: "Double Top",
    emotion: "greedy",
    rating: 2,
    screenshots: [],
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    side: "long",
    entryPrice: 98.5,
    exitPrice: 105.2,
    quantity: 10,
    entryDate: "2026-01-23T10:15:00Z",
    exitDate: "2026-01-24T09:00:00Z",
    pnl: 67,
    pnlPercent: 6.8,
    fees: 2.1,
    tags: ["swing", "support-bounce"],
    notes: "Strong support level held. Multiple timeframe alignment. Let winner run.",
    setup: "Support Bounce",
    emotion: "confident",
    rating: 5,
    screenshots: [],
  },
  {
    id: "4",
    symbol: "BNB/USDT",
    side: "long",
    entryPrice: 312,
    exitPrice: 308,
    quantity: 3,
    entryDate: "2026-01-22T14:20:00Z",
    exitDate: "2026-01-22T15:45:00Z",
    pnl: -12,
    pnlPercent: -1.28,
    fees: 1.8,
    tags: ["scalp", "failed-breakout"],
    notes: "False breakout. Stop loss triggered. Market reversed immediately after entry.",
    setup: "Breakout",
    emotion: "neutral",
    rating: 3,
    screenshots: [],
  },
  {
    id: "5",
    symbol: "XRP/USDT",
    side: "short",
    entryPrice: 0.62,
    exitPrice: 0.58,
    quantity: 1000,
    entryDate: "2026-01-21T08:00:00Z",
    exitDate: "2026-01-21T16:00:00Z",
    pnl: 40,
    pnlPercent: 6.45,
    fees: 1.2,
    tags: ["trend-following", "resistance-rejection"],
    notes: "Clear rejection at major resistance. Trend continuation trade. Followed the plan.",
    setup: "Resistance Rejection",
    emotion: "confident",
    rating: 5,
    screenshots: [],
  },
];

const SETUPS = ["Breakout", "Breakout + Retest", "Support Bounce", "Resistance Rejection", "Double Top", "Double Bottom", "Trend Continuation", "Reversal"];
const EMOTIONS = ["confident", "neutral", "fearful", "greedy"] as const;
const TAGS = ["breakout", "trend-following", "reversal", "scalp", "swing", "counter-trend", "support-bounce", "resistance-rejection", "failed-breakout"];

export default function JournalPage() {
  const t = useTranslations("journalPage");
  const [trades, setTrades] = useState<TradeEntry[]>(MOCK_TRADES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSide, setFilterSide] = useState<"all" | "long" | "short">("all");
  const [filterResult, setFilterResult] = useState<"all" | "win" | "loss">("all");
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [showNewTradeForm, setShowNewTradeForm] = useState(false);

  // Filter trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch =
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSide = filterSide === "all" || trade.side === filterSide;
      const matchesResult =
        filterResult === "all" ||
        (filterResult === "win" && trade.pnl > 0) ||
        (filterResult === "loss" && trade.pnl < 0);

      return matchesSearch && matchesSide && matchesResult;
    });
  }, [trades, searchQuery, filterSide, filterResult]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0).length;
    const losingTrades = trades.filter((t) => t.pnl < 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
    const avgWin = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades || 0;
    const avgLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades) || 0;
    const winRate = (winningTrades / totalTrades) * 100 || 0;
    const profitFactor = avgWin * winningTrades / (avgLoss * losingTrades) || 0;
    const avgRating = trades.reduce((sum, t) => sum + t.rating, 0) / totalTrades || 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      totalFees,
      avgWin,
      avgLoss,
      winRate,
      profitFactor,
      avgRating,
    };
  }, [trades]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmotionColor = (emotion: TradeEntry["emotion"]) => {
    switch (emotion) {
      case "confident":
        return "text-green-500";
      case "neutral":
        return "text-gray-500";
      case "fearful":
        return "text-yellow-500";
      case "greedy":
        return "text-red-500";
    }
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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
        <Button onClick={() => setShowNewTradeForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("newTrade")}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalTrades")}</p>
                <p className="text-xl font-bold">{stats.totalTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("winRate")}</p>
                <p className="text-xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stats.totalPnL >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <DollarSign className={cn(
                  "h-5 w-5",
                  stats.totalPnL >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalPnl")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.totalPnL >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {stats.totalPnL >= 0 ? "+" : ""}{stats.totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("profitFactor")}</p>
                <p className="text-xl font-bold">{stats.profitFactor.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <span className="text-lg text-yellow-500">★</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgRating")}</p>
                <p className="text-xl font-bold">{stats.avgRating.toFixed(1)}/5</p>
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

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex rounded-lg border">
                {(["all", "long", "short"] as const).map((side) => (
                  <Button
                    key={side}
                    variant={filterSide === side ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterSide(side)}
                    className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    {t(side)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex rounded-lg border">
              {(["all", "win", "loss"] as const).map((result) => (
                <Button
                  key={result}
                  variant={filterResult === result ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterResult(result)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {t(result)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade List */}
      <div className="space-y-4">
        {filteredTrades.map((trade) => (
          <Card key={trade.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Trade Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    trade.side === "long" ? "bg-green-500/10" : "bg-red-500/10"
                  )}>
                    {trade.side === "long" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.symbol}</span>
                      <Badge variant={trade.side === "long" ? "default" : "destructive"}>
                        {trade.side.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(trade.entryDate)}
                      <span className="text-muted-foreground/50">→</span>
                      {formatDate(trade.exitDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)} USDT
                    </p>
                    <p className={cn(
                      "text-sm",
                      trade.pnl >= 0 ? "text-green-500/70" : "text-red-500/70"
                    )}>
                      {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-yellow-500 text-sm">
                    {getRatingStars(trade.rating)}
                  </div>
                  {expandedTrade === trade.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTrade === trade.id && (
                <div className="border-t bg-muted/30 p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("entryPrice")}</p>
                      <p className="font-mono font-semibold">{trade.entryPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("exitPrice")}</p>
                      <p className="font-mono font-semibold">{trade.exitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("quantity")}</p>
                      <p className="font-mono font-semibold">{trade.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fees")}</p>
                      <p className="font-mono font-semibold">{trade.fees.toFixed(2)} USDT</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t("setup")}</p>
                      <Badge variant="outline">{trade.setup}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t("emotion")}</p>
                      <span className={cn("font-medium capitalize", getEmotionColor(trade.emotion))}>
                        {t(trade.emotion)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">{t("tags")}</p>
                    <div className="flex flex-wrap gap-2">
                      {trade.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">{t("notes")}</p>
                    <p className="text-sm bg-background rounded-lg p-3 border">
                      {trade.notes}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredTrades.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("noTradesFound")}</p>
              <p className="text-sm text-muted-foreground/70">
                {t("noTradesHint")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
