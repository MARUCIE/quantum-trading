"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Plus,
  Trash2,
  Edit2,
  Star,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  FolderPlus,
  Folder,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useAssetClass, type AssetClass } from "@/lib/assets";

// Symbols available per asset class
const SYMBOLS_BY_CLASS: Record<AssetClass, string[]> = {
  crypto: [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT",
    "ADA/USDT", "AVAX/USDT", "DOT/USDT", "MATIC/USDT", "LINK/USDT",
    "ATOM/USDT", "UNI/USDT", "AAVE/USDT", "LTC/USDT", "NEAR/USDT",
  ],
  stocks: [
    "AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "META",
    "AMD", "NFLX", "CRM", "ORCL", "INTC", "QCOM", "AVGO", "ADBE",
  ],
  futures: [
    "ES", "NQ", "CL", "GC", "SI", "ZB", "ZN", "6E", "6J", "ZC",
    "ZS", "ZW", "NG", "HG", "PL",
  ],
  options: [
    "SPY", "QQQ", "IWM", "AAPL", "TSLA", "NVDA", "AMD", "AMZN",
    "GOOGL", "META", "MSFT", "VIX", "GLD", "SLV", "XLF",
  ],
};

// Base prices by symbol
const BASE_PRICES: Record<string, number> = {
  // Crypto
  "BTC/USDT": 43250, "ETH/USDT": 2285, "SOL/USDT": 102, "BNB/USDT": 312,
  "XRP/USDT": 0.62, "ADA/USDT": 0.52, "AVAX/USDT": 38.5, "DOT/USDT": 7.8,
  "MATIC/USDT": 0.85, "LINK/USDT": 15.2, "ATOM/USDT": 10.5, "UNI/USDT": 6.2,
  "AAVE/USDT": 92, "LTC/USDT": 72, "NEAR/USDT": 3.2,
  // Stocks
  "AAPL": 178, "NVDA": 485, "TSLA": 248, "MSFT": 379, "GOOGL": 141,
  "AMZN": 178, "META": 485, "AMD": 165, "NFLX": 485, "CRM": 275,
  "ORCL": 118, "INTC": 42, "QCOM": 168, "AVGO": 1245, "ADBE": 578,
  // Futures
  "ES": 4785, "NQ": 16890, "CL": 78, "GC": 2045, "SI": 24.5,
  "ZB": 118, "ZN": 110, "6E": 1.08, "6J": 0.0067, "ZC": 458,
  "ZS": 1245, "ZW": 612, "NG": 2.85, "HG": 3.92, "PL": 925,
  // Options (underlying)
  "SPY": 478, "QQQ": 405, "IWM": 198, "VIX": 14.5, "GLD": 185,
  "SLV": 22.5, "XLF": 38.5,
};

// Types
interface WatchlistItem {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  alertPrice?: number;
  alertType?: "above" | "below";
  alertEnabled: boolean;
  notes: string;
}

interface Watchlist {
  id: string;
  name: string;
  color: string;
  items: WatchlistItem[];
  createdAt: string;
}

// Mock data
const INITIAL_WATCHLISTS: Watchlist[] = [
  {
    id: "wl-1",
    name: "Main Portfolio",
    color: "#3b82f6",
    createdAt: new Date().toISOString(),
    items: [
      { id: "i1", symbol: "BTC/USDT", price: 43250, change24h: 2.5, high24h: 43800, low24h: 42100, volume24h: 1250000000, alertPrice: 45000, alertType: "above", alertEnabled: true, notes: "Watching for breakout above 45k" },
      { id: "i2", symbol: "ETH/USDT", price: 2285, change24h: 1.8, high24h: 2320, low24h: 2240, volume24h: 580000000, alertEnabled: false, notes: "" },
      { id: "i3", symbol: "SOL/USDT", price: 102.5, change24h: 4.2, high24h: 105, low24h: 98, volume24h: 320000000, alertPrice: 95, alertType: "below", alertEnabled: true, notes: "Buy more if drops to 95" },
    ],
  },
  {
    id: "wl-2",
    name: "DeFi Tokens",
    color: "#8b5cf6",
    createdAt: new Date().toISOString(),
    items: [
      { id: "i4", symbol: "UNI/USDT", price: 6.2, change24h: -1.5, high24h: 6.5, low24h: 6.1, volume24h: 45000000, alertEnabled: false, notes: "" },
      { id: "i5", symbol: "AAVE/USDT", price: 92, change24h: 0.8, high24h: 94, low24h: 90, volume24h: 32000000, alertEnabled: false, notes: "" },
      { id: "i6", symbol: "LINK/USDT", price: 15.2, change24h: 3.1, high24h: 15.8, low24h: 14.5, volume24h: 125000000, alertEnabled: false, notes: "" },
    ],
  },
  {
    id: "wl-3",
    name: "Layer 1s",
    color: "#22c55e",
    createdAt: new Date().toISOString(),
    items: [
      { id: "i7", symbol: "AVAX/USDT", price: 38.5, change24h: 5.2, high24h: 39.5, low24h: 36, volume24h: 180000000, alertEnabled: false, notes: "" },
      { id: "i8", symbol: "DOT/USDT", price: 7.8, change24h: -0.5, high24h: 8.0, low24h: 7.6, volume24h: 95000000, alertEnabled: false, notes: "" },
      { id: "i9", symbol: "ATOM/USDT", price: 10.5, change24h: 2.1, high24h: 10.8, low24h: 10.2, volume24h: 78000000, alertEnabled: false, notes: "" },
    ],
  },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"];

export default function WatchlistPage() {
  const t = useTranslations("watchlistPage");
  const tAsset = useTranslations("assetClass");
  const { assetClass } = useAssetClass();

  // Get available symbols for current asset class
  const availableSymbols = SYMBOLS_BY_CLASS[assetClass];
  const [watchlists, setWatchlists] = useState<Watchlist[]>(INITIAL_WATCHLISTS);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("wl-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Get current watchlist
  const currentWatchlist = useMemo(() => {
    return watchlists.find((w) => w.id === selectedWatchlist);
  }, [watchlists, selectedWatchlist]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!currentWatchlist) return [];
    if (!searchQuery) return currentWatchlist.items;
    return currentWatchlist.items.filter((item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentWatchlist, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!currentWatchlist) return { total: 0, gainers: 0, losers: 0, alerts: 0 };
    const items = currentWatchlist.items;
    return {
      total: items.length,
      gainers: items.filter((i) => i.change24h > 0).length,
      losers: items.filter((i) => i.change24h < 0).length,
      alerts: items.filter((i) => i.alertEnabled).length,
    };
  }, [currentWatchlist]);

  const addSymbol = () => {
    if (!newSymbol || !currentWatchlist) return;

    const basePrice = BASE_PRICES[newSymbol] ?? Math.random() * 100 + 1;

    const newItem: WatchlistItem = {
      id: `i-${Date.now()}`,
      symbol: newSymbol,
      price: basePrice,
      change24h: (Math.random() - 0.5) * 10,
      high24h: basePrice * 1.03,
      low24h: basePrice * 0.97,
      volume24h: Math.random() * 100000000,
      alertEnabled: false,
      notes: "",
    };

    setWatchlists(watchlists.map((w) =>
      w.id === selectedWatchlist
        ? { ...w, items: [...w.items, newItem] }
        : w
    ));
    setNewSymbol("");
    setShowAddSymbol(false);
  };

  const removeItem = (itemId: string) => {
    setWatchlists(watchlists.map((w) =>
      w.id === selectedWatchlist
        ? { ...w, items: w.items.filter((i) => i.id !== itemId) }
        : w
    ));
  };

  const toggleAlert = (itemId: string) => {
    setWatchlists(watchlists.map((w) =>
      w.id === selectedWatchlist
        ? {
            ...w,
            items: w.items.map((i) =>
              i.id === itemId ? { ...i, alertEnabled: !i.alertEnabled } : i
            ),
          }
        : w
    ));
  };

  const createWatchlist = () => {
    if (!newListName) return;

    const newList: Watchlist = {
      id: `wl-${Date.now()}`,
      name: newListName,
      color: COLORS[watchlists.length % COLORS.length],
      createdAt: new Date().toISOString(),
      items: [],
    };

    setWatchlists([...watchlists, newList]);
    setSelectedWatchlist(newList.id);
    setNewListName("");
    setShowCreateList(false);
  };

  const deleteWatchlist = (id: string) => {
    if (watchlists.length <= 1) return;
    const remaining = watchlists.filter((w) => w.id !== id);
    setWatchlists(remaining);
    if (selectedWatchlist === id) {
      setSelectedWatchlist(remaining[0].id);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${(volume / 1e3).toFixed(2)}K`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
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
        <Button onClick={() => setShowCreateList(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          {t("newWatchlist")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Watchlist Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("myWatchlists")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {watchlists.map((list) => (
                <div
                  key={list.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                    selectedWatchlist === list.id
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedWatchlist(list.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: list.color }}
                    />
                    <div>
                      <p className="font-medium">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {list.items.length} {t("items")}
                      </p>
                    </div>
                  </div>
                  {watchlists.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWatchlist(list.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              {showCreateList && (
                <div className="p-3 border rounded-lg space-y-2">
                  <Input
                    placeholder={t("watchlistNamePlaceholder")}
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={createWatchlist}>
                      {t("create")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateList(false)}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("total")}</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-500">{t("gainers")}</span>
                <span className="font-semibold text-green-500">{stats.gainers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-500">{t("losers")}</span>
                <span className="font-semibold text-red-500">{stats.losers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-500">{t("activeAlerts")}</span>
                <span className="font-semibold text-yellow-500">{stats.alerts}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("searchSymbols")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => setShowAddSymbol(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addSymbol")}
                </Button>
              </div>

              {showAddSymbol && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">{t("addSymbol")}</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSymbols.filter(
                      (s) => !currentWatchlist?.items.some((i) => i.symbol === s)
                    ).map((symbol) => (
                      <Button
                        key={symbol}
                        variant={newSymbol === symbol ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setNewSymbol(symbol)}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={addSymbol} disabled={!newSymbol}>
                      {t("add")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddSymbol(false);
                        setNewSymbol("");
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Watchlist Items */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        item.change24h >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                      )}>
                        {item.change24h >= 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{item.symbol}</span>
                          {item.alertEnabled && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              <Bell className="h-3 w-3 mr-1" />
                              {item.alertType === "above" ? ">" : "<"} ${formatPrice(item.alertPrice || 0)}
                            </Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono">
                          ${formatPrice(item.price)}
                        </p>
                        <p className={cn(
                          "flex items-center justify-end gap-1 font-semibold",
                          item.change24h >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {item.change24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                        </p>
                      </div>

                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          {t("high")}: <span className="font-mono">${formatPrice(item.high24h)}</span>
                        </p>
                        <p className="text-muted-foreground">
                          {t("low")}: <span className="font-mono">${formatPrice(item.low24h)}</span>
                        </p>
                      </div>

                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">{t("vol")}</p>
                        <p className="font-mono">{formatVolume(item.volume24h)}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleAlert(item.id)}
                        >
                          {item.alertEnabled ? (
                            <Bell className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Eye className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("noItemsInWatchlist")}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddSymbol(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addSymbol")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
