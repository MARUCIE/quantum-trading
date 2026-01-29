"use client";

/**
 * Leaderboard Page (T102)
 *
 * Trading performance leaderboard and rankings.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Star,
  Users,
  BarChart2,
  Percent,
  DollarSign,
  Clock,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Trader {
  rank: number;
  previousRank: number;
  username: string;
  avatar: string;
  verified: boolean;
  pnl: number;
  pnlPercent: number;
  winRate: number;
  trades: number;
  followers: number;
  sharpeRatio: number;
  maxDrawdown: number;
  streak: number;
}

// Mock data
const TRADERS: Trader[] = [
  { rank: 1, previousRank: 2, username: "CryptoWhale", avatar: "CW", verified: true, pnl: 1245000, pnlPercent: 156.8, winRate: 78.5, trades: 342, followers: 12500, sharpeRatio: 2.85, maxDrawdown: 8.2, streak: 15 },
  { rank: 2, previousRank: 1, username: "TradingMaster", avatar: "TM", verified: true, pnl: 980000, pnlPercent: 142.3, winRate: 72.1, trades: 456, followers: 9800, sharpeRatio: 2.45, maxDrawdown: 11.5, streak: 8 },
  { rank: 3, previousRank: 3, username: "AlphaSeeker", avatar: "AS", verified: true, pnl: 875000, pnlPercent: 128.9, winRate: 69.8, trades: 289, followers: 7600, sharpeRatio: 2.12, maxDrawdown: 14.2, streak: 12 },
  { rank: 4, previousRank: 6, username: "QuantumTrader", avatar: "QT", verified: false, pnl: 756000, pnlPercent: 118.4, winRate: 71.2, trades: 512, followers: 5400, sharpeRatio: 1.98, maxDrawdown: 12.8, streak: 6 },
  { rank: 5, previousRank: 4, username: "BitcoinBull", avatar: "BB", verified: true, pnl: 698000, pnlPercent: 105.6, winRate: 65.4, trades: 678, followers: 8200, sharpeRatio: 1.75, maxDrawdown: 18.5, streak: 4 },
  { rank: 6, previousRank: 5, username: "DeFiKing", avatar: "DK", verified: false, pnl: 645000, pnlPercent: 98.2, winRate: 68.9, trades: 234, followers: 4100, sharpeRatio: 1.89, maxDrawdown: 15.3, streak: 9 },
  { rank: 7, previousRank: 9, username: "SwingPro", avatar: "SP", verified: false, pnl: 578000, pnlPercent: 89.7, winRate: 64.2, trades: 445, followers: 3200, sharpeRatio: 1.65, maxDrawdown: 16.8, streak: 5 },
  { rank: 8, previousRank: 7, username: "MomentumKing", avatar: "MK", verified: true, pnl: 534000, pnlPercent: 82.1, winRate: 62.8, trades: 567, followers: 5600, sharpeRatio: 1.54, maxDrawdown: 19.2, streak: 3 },
  { rank: 9, previousRank: 8, username: "ScalpMaster", avatar: "SM", verified: false, pnl: 489000, pnlPercent: 76.5, winRate: 73.5, trades: 1234, followers: 2800, sharpeRatio: 1.42, maxDrawdown: 10.5, streak: 7 },
  { rank: 10, previousRank: 12, username: "TrendFollower", avatar: "TF", verified: false, pnl: 445000, pnlPercent: 68.9, winRate: 61.2, trades: 312, followers: 2100, sharpeRatio: 1.38, maxDrawdown: 21.4, streak: 4 },
];

export default function LeaderboardPage() {
  const t = useTranslations("leaderboardPage");
  const [category, setCategory] = useState("categoryAll");
  const [period, setPeriod] = useState("periodThisMonth");
  const [searchQuery, setSearchQuery] = useState("");

  const CATEGORIES = [
    { key: "categoryAll", label: t("categoryAll") },
    { key: "categoryTopGainers", label: t("categoryTopGainers") },
    { key: "categoryBestWinRate", label: t("categoryBestWinRate") },
    { key: "categoryMostConsistent", label: t("categoryMostConsistent") },
    { key: "categoryNewTraders", label: t("categoryNewTraders") },
  ];

  const TIME_PERIODS = [
    { key: "periodToday", label: t("periodToday") },
    { key: "periodThisWeek", label: t("periodThisWeek") },
    { key: "periodThisMonth", label: t("periodThisMonth") },
    { key: "periodThisYear", label: t("periodThisYear") },
    { key: "periodAllTime", label: t("periodAllTime") },
  ];

  const filteredTraders = useMemo(() => {
    return TRADERS.filter((t) =>
      t.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ChevronUp className="h-3 w-3" />
          <span className="text-xs">{diff}</span>
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ChevronDown className="h-3 w-3" />
          <span className="text-xs">{Math.abs(diff)}</span>
        </div>
      );
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const currentPeriodLabel = TIME_PERIODS.find(p => p.key === period)?.label || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("description", { period: currentPeriodLabel.toLowerCase() })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c.key}
              variant={category === c.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {TIME_PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TRADERS.slice(0, 3).map((trader, index) => (
          <Card
            key={trader.rank}
            className={cn(
              "relative overflow-hidden",
              index === 0 && "border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-transparent",
              index === 1 && "border-gray-400/50 bg-gradient-to-br from-gray-400/5 to-transparent",
              index === 2 && "border-amber-600/50 bg-gradient-to-br from-amber-600/5 to-transparent"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-gray-400/20 text-gray-400",
                    index === 2 && "bg-amber-600/20 text-amber-600"
                  )}>
                    {trader.avatar}
                  </div>
                  <div className="absolute -top-1 -right-1">
                    {getRankIcon(trader.rank)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{trader.username}</p>
                    {trader.verified && (
                      <Badge variant="secondary" className="h-4 text-[10px]">
                        {t("verified")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    +{trader.pnlPercent.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${trader.pnl.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("winRate")}</p>
                  <p className="font-semibold">{trader.winRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("trades")}</p>
                  <p className="font-semibold">{trader.trades}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("followers")}</p>
                  <p className="font-semibold">{(trader.followers / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("fullRankings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">{t("rank")}</th>
                  <th className="text-left py-3 px-2">{t("trader")}</th>
                  <th className="text-right py-3 px-2">{t("pnl")}</th>
                  <th className="text-right py-3 px-2">{t("returnPercent")}</th>
                  <th className="text-right py-3 px-2">{t("winRate")}</th>
                  <th className="text-right py-3 px-2">{t("sharpe")}</th>
                  <th className="text-right py-3 px-2">{t("maxDd")}</th>
                  <th className="text-right py-3 px-2">{t("trades")}</th>
                  <th className="text-right py-3 px-2">{t("streak")}</th>
                  <th className="text-center py-3 px-2">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraders.map((trader) => (
                  <tr key={trader.rank} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 text-center">{getRankIcon(trader.rank)}</div>
                        {getRankChange(trader.rank, trader.previousRank)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {trader.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{trader.username}</span>
                            {trader.verified && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {trader.followers.toLocaleString()} {t("followers").toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-green-500">
                      +${trader.pnl.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-green-500">
                      +{trader.pnlPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {trader.winRate}%
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {trader.sharpeRatio.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-red-500">
                      -{trader.maxDrawdown}%
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {trader.trades}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Badge variant={trader.streak >= 10 ? "default" : "outline"}>
                        {trader.streak}W
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Button variant="outline" size="sm">
                        <Users className="mr-1 h-3 w-3" />
                        {t("follow")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
