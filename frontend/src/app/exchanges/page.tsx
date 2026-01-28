"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Key,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  TestTube,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Exchange {
  id: string;
  name: string;
  logo: string;
  status: "connected" | "disconnected" | "error" | "rate_limited";
  latency: number;
  apiKeyConfigured: boolean;
  lastSync: string;
  features: string[];
  supportedAssets: number;
  dailyVolume: number;
  spotEnabled: boolean;
  futuresEnabled: boolean;
  marginEnabled: boolean;
  websocketConnected: boolean;
  rateLimit: {
    used: number;
    max: number;
  };
}

interface APIKey {
  id: string;
  exchange: string;
  name: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: "active" | "expired" | "revoked";
}

// Mock data
function generateMockExchanges(): Exchange[] {
  return [
    {
      id: "binance",
      name: "Binance",
      logo: "BN",
      status: "connected",
      latency: 45,
      apiKeyConfigured: true,
      lastSync: "2s ago",
      features: ["Spot", "Futures", "Margin", "Staking"],
      supportedAssets: 385,
      dailyVolume: 15200000000,
      spotEnabled: true,
      futuresEnabled: true,
      marginEnabled: true,
      websocketConnected: true,
      rateLimit: { used: 450, max: 1200 },
    },
    {
      id: "okx",
      name: "OKX",
      logo: "OK",
      status: "connected",
      latency: 68,
      apiKeyConfigured: true,
      lastSync: "5s ago",
      features: ["Spot", "Futures", "Options", "Earn"],
      supportedAssets: 312,
      dailyVolume: 8500000000,
      spotEnabled: true,
      futuresEnabled: true,
      marginEnabled: false,
      websocketConnected: true,
      rateLimit: { used: 180, max: 600 },
    },
    {
      id: "bybit",
      name: "Bybit",
      logo: "BY",
      status: "connected",
      latency: 52,
      apiKeyConfigured: true,
      lastSync: "3s ago",
      features: ["Spot", "Derivatives", "Copy Trading"],
      supportedAssets: 245,
      dailyVolume: 5800000000,
      spotEnabled: true,
      futuresEnabled: true,
      marginEnabled: true,
      websocketConnected: true,
      rateLimit: { used: 95, max: 300 },
    },
    {
      id: "kraken",
      name: "Kraken",
      logo: "KR",
      status: "disconnected",
      latency: 0,
      apiKeyConfigured: false,
      lastSync: "never",
      features: ["Spot", "Margin", "Staking"],
      supportedAssets: 185,
      dailyVolume: 1200000000,
      spotEnabled: false,
      futuresEnabled: false,
      marginEnabled: false,
      websocketConnected: false,
      rateLimit: { used: 0, max: 500 },
    },
    {
      id: "coinbase",
      name: "Coinbase Pro",
      logo: "CB",
      status: "error",
      latency: 0,
      apiKeyConfigured: true,
      lastSync: "5m ago",
      features: ["Spot", "Advanced Trading"],
      supportedAssets: 165,
      dailyVolume: 980000000,
      spotEnabled: false,
      futuresEnabled: false,
      marginEnabled: false,
      websocketConnected: false,
      rateLimit: { used: 0, max: 400 },
    },
  ];
}

function generateMockAPIKeys(): APIKey[] {
  return [
    {
      id: "key-1",
      exchange: "Binance",
      name: "Trading Bot #1",
      permissions: ["Read", "Trade", "Futures"],
      createdAt: "2024-01-15",
      lastUsed: "2m ago",
      status: "active",
    },
    {
      id: "key-2",
      exchange: "OKX",
      name: "Portfolio Tracker",
      permissions: ["Read"],
      createdAt: "2024-02-20",
      lastUsed: "1h ago",
      status: "active",
    },
    {
      id: "key-3",
      exchange: "Bybit",
      name: "Copy Trading",
      permissions: ["Read", "Trade"],
      createdAt: "2024-03-10",
      lastUsed: "5m ago",
      status: "active",
    },
  ];
}

export default function ExchangesPage() {
  const t = useTranslations("exchangesPage");
  const [exchanges, setExchanges] = useState<Exchange[]>(generateMockExchanges);
  const [apiKeys] = useState<APIKey[]>(generateMockAPIKeys);
  const [showAddExchange, setShowAddExchange] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

  const stats = useMemo(() => ({
    connected: exchanges.filter((e) => e.status === "connected").length,
    totalVolume: exchanges.filter((e) => e.status === "connected")
      .reduce((sum, e) => sum + e.dailyVolume, 0),
    avgLatency: exchanges.filter((e) => e.status === "connected" && e.latency > 0)
      .reduce((sum, e, _, arr) => sum + e.latency / arr.length, 0),
  }), [exchanges]);

  const getStatusIcon = (status: Exchange["status"]) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected": return <WifiOff className="h-4 w-4 text-gray-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      case "rate_limited": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Exchange["status"]) => {
    switch (status) {
      case "connected": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "disconnected": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "error": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "rate_limited": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${vol.toLocaleString()}`;
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("syncAll")}
          </Button>
          <Button size="sm" onClick={() => setShowAddExchange(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addExchange")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Wifi className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("connected")}</p>
                <p className="text-xl font-bold">{stats.connected} / {exchanges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("volume24h")}</p>
                <p className="text-xl font-bold">{formatVolume(stats.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgLatency")}</p>
                <p className="text-xl font-bold">{stats.avgLatency.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Key className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("apiKeys")}</p>
                <p className="text-xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exchanges.map((exchange) => (
          <Card
            key={exchange.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedExchange?.id === exchange.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedExchange(exchange)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-bold text-lg">
                    {exchange.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold">{exchange.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("border", getStatusColor(exchange.status))}>
                        {getStatusIcon(exchange.status)}
                        <span className="ml-1 capitalize">{exchange.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                {exchange.websocketConnected && (
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("latency")}</p>
                  <p className={cn(
                    "font-semibold",
                    exchange.latency <= 50 ? "text-green-500" :
                    exchange.latency <= 100 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {exchange.latency > 0 ? `${exchange.latency}ms` : "N/A"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("assets")}</p>
                  <p className="font-semibold">{exchange.supportedAssets}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("volume")}</p>
                  <p className="font-semibold">{formatVolume(exchange.dailyVolume)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {exchange.spotEnabled && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500">{t("spot")}</Badge>
                )}
                {exchange.futuresEnabled && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">{t("futures")}</Badge>
                )}
                {exchange.marginEnabled && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500">{t("margin")}</Badge>
                )}
              </div>

              {/* Rate Limit Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("rateLimit")}</span>
                  <span>{exchange.rateLimit.used} / {exchange.rateLimit.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      (exchange.rateLimit.used / exchange.rateLimit.max) < 0.5 ? "bg-green-500" :
                      (exchange.rateLimit.used / exchange.rateLimit.max) < 0.8 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${(exchange.rateLimit.used / exchange.rateLimit.max) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {exchange.lastSync}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("apiKeys")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant="outline">{key.exchange}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t("permissions")}: {key.permissions.join(", ")}</span>
                      <span>|</span>
                      <span>{t("lastUsed")}: {key.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.status === "active" ? "default" : "destructive"}>
                    {key.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
