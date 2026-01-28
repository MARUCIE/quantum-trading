"use client";

/**
 * Strategy Marketplace Page (T103)
 *
 * Browse, purchase, and subscribe to trading strategies.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Store,
  Search,
  Filter,
  Star,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Zap,
  BarChart2,
  DollarSign,
  Heart,
  ShoppingCart,
  Eye,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Strategy {
  id: string;
  name: string;
  author: string;
  authorVerified: boolean;
  description: string;
  category: string;
  price: number;
  priceType: "one-time" | "monthly" | "free";
  rating: number;
  reviews: number;
  subscribers: number;
  returns: number;
  winRate: number;
  maxDrawdown: number;
  timeframe: string;
  pairs: string[];
  featured: boolean;
  isNew: boolean;
}

// Mock data
const STRATEGIES: Strategy[] = [
  {
    id: "s1",
    name: "Momentum Alpha Pro",
    author: "QuantumTrader",
    authorVerified: true,
    description: "Advanced momentum strategy with multi-timeframe confirmation and dynamic position sizing.",
    category: "Momentum",
    price: 299,
    priceType: "one-time",
    rating: 4.8,
    reviews: 156,
    subscribers: 2340,
    returns: 145.6,
    winRate: 72.4,
    maxDrawdown: 12.5,
    timeframe: "4H",
    pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
    featured: true,
    isNew: false,
  },
  {
    id: "s2",
    name: "Grid Trading Bot",
    author: "AlgoMaster",
    authorVerified: true,
    description: "Automated grid trading with smart range detection and profit optimization.",
    category: "Grid",
    price: 49,
    priceType: "monthly",
    rating: 4.6,
    reviews: 89,
    subscribers: 1560,
    returns: 68.2,
    winRate: 85.1,
    maxDrawdown: 8.3,
    timeframe: "1H",
    pairs: ["BTC/USDT", "ETH/USDT"],
    featured: true,
    isNew: false,
  },
  {
    id: "s3",
    name: "Scalping Sniper",
    author: "ScalpKing",
    authorVerified: false,
    description: "High-frequency scalping strategy for volatile market conditions.",
    category: "Scalping",
    price: 199,
    priceType: "one-time",
    rating: 4.4,
    reviews: 67,
    subscribers: 890,
    returns: 89.4,
    winRate: 68.9,
    maxDrawdown: 15.2,
    timeframe: "5M",
    pairs: ["BTC/USDT"],
    featured: false,
    isNew: true,
  },
  {
    id: "s4",
    name: "DeFi Yield Optimizer",
    author: "DeFiWhale",
    authorVerified: true,
    description: "Automated yield farming strategy across multiple DeFi protocols.",
    category: "DeFi",
    price: 0,
    priceType: "free",
    rating: 4.2,
    reviews: 234,
    subscribers: 4560,
    returns: 42.8,
    winRate: 91.2,
    maxDrawdown: 5.6,
    timeframe: "1D",
    pairs: ["Multiple"],
    featured: false,
    isNew: false,
  },
  {
    id: "s5",
    name: "Trend Following Master",
    author: "TrendPro",
    authorVerified: true,
    description: "Classic trend following with advanced entry/exit signals and risk management.",
    category: "Trend",
    price: 149,
    priceType: "one-time",
    rating: 4.7,
    reviews: 112,
    subscribers: 1890,
    returns: 112.3,
    winRate: 58.6,
    maxDrawdown: 18.4,
    timeframe: "1D",
    pairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
    featured: true,
    isNew: false,
  },
  {
    id: "s6",
    name: "Mean Reversion Elite",
    author: "StatArb",
    authorVerified: false,
    description: "Statistical arbitrage strategy based on mean reversion principles.",
    category: "Mean Reversion",
    price: 79,
    priceType: "monthly",
    rating: 4.5,
    reviews: 45,
    subscribers: 670,
    returns: 76.5,
    winRate: 74.2,
    maxDrawdown: 11.8,
    timeframe: "15M",
    pairs: ["BTC/USDT", "ETH/USDT"],
    featured: false,
    isNew: true,
  },
];

export default function MarketplacePage() {
  const t = useTranslations("marketplacePage");
  const [category, setCategory] = useState("categoryAll");
  const [sortBy, setSortBy] = useState("sortPopular");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const CATEGORIES = [
    { key: "categoryAll", label: t("categoryAll"), value: "All" },
    { key: "categoryMomentum", label: t("categoryMomentum"), value: "Momentum" },
    { key: "categoryGrid", label: t("categoryGrid"), value: "Grid" },
    { key: "categoryScalping", label: t("categoryScalping"), value: "Scalping" },
    { key: "categoryDeFi", label: t("categoryDeFi"), value: "DeFi" },
    { key: "categoryTrend", label: t("categoryTrend"), value: "Trend" },
    { key: "categoryMeanReversion", label: t("categoryMeanReversion"), value: "Mean Reversion" },
  ];

  const SORT_OPTIONS = [
    { key: "sortPopular", label: t("sortPopular") },
    { key: "sortTopRated", label: t("sortTopRated") },
    { key: "sortNewest", label: t("sortNewest") },
    { key: "sortHighestReturns", label: t("sortHighestReturns") },
    { key: "sortPriceLowHigh", label: t("sortPriceLowHigh") },
  ];

  const filteredStrategies = useMemo(() => {
    const currentCategory = CATEGORIES.find(c => c.key === category);
    let result = STRATEGIES.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (currentCategory && currentCategory.value !== "All") {
      result = result.filter((s) => s.category === currentCategory.value);
    }

    return result;
  }, [searchQuery, category, CATEGORIES]);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const getPriceDisplay = (strategy: Strategy) => {
    if (strategy.priceType === "free") {
      return <Badge className="bg-green-500">{t("free")}</Badge>;
    }
    return (
      <span className="font-bold">
        ${strategy.price}
        {strategy.priceType === "monthly" && <span className="text-xs font-normal">{t("perMonth")}</span>}
      </span>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {t("filters")}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
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

      {/* Featured Strategies */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("featured")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStrategies.filter((s) => s.featured).map((strategy) => (
            <Card key={strategy.id} className="relative overflow-hidden">
              {strategy.isNew && (
                <Badge className="absolute top-2 right-2 bg-blue-500">{t("new")}</Badge>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{strategy.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{strategy.author}</span>
                      {strategy.authorVerified && (
                        <Check className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(strategy.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorites.has(strategy.id) && "fill-red-500 text-red-500"
                      )}
                    />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {strategy.description}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{strategy.rating}</span>
                    <span className="text-sm text-muted-foreground">({strategy.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {strategy.subscribers.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("returns")}</p>
                    <p className="font-semibold text-green-500">+{strategy.returns}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("winRate")}</p>
                    <p className="font-semibold">{strategy.winRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("maxDd")}</p>
                    <p className="font-semibold text-red-500">-{strategy.maxDrawdown}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {getPriceDisplay(strategy)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      {t("preview")}
                    </Button>
                    <Button size="sm">
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      {strategy.priceType === "free" ? t("get") : t("buy")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Strategies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("allStrategies")}</h2>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredStrategies.map((strategy) => (
            <Card key={strategy.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    {strategy.category === "Momentum" && <TrendingUp className="h-8 w-8 text-primary" />}
                    {strategy.category === "Grid" && <BarChart2 className="h-8 w-8 text-primary" />}
                    {strategy.category === "Scalping" && <Zap className="h-8 w-8 text-primary" />}
                    {strategy.category === "DeFi" && <DollarSign className="h-8 w-8 text-primary" />}
                    {strategy.category === "Trend" && <ArrowUpRight className="h-8 w-8 text-primary" />}
                    {strategy.category === "Mean Reversion" && <Shield className="h-8 w-8 text-primary" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{strategy.name}</h3>
                      {strategy.isNew && <Badge className="bg-blue-500 text-xs">{t("new")}</Badge>}
                      <Badge variant="outline">{strategy.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{strategy.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {strategy.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {strategy.subscribers.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {strategy.timeframe}
                      </span>
                      <span className="text-green-500">+{strategy.returns}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {getPriceDisplay(strategy)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(strategy.id)}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          favorites.has(strategy.id) && "fill-red-500 text-red-500"
                        )}
                      />
                    </Button>
                    <Button>
                      {strategy.priceType === "free" ? t("get") : t("subscribe")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
