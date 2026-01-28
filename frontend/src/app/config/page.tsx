"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Server,
  Globe,
  Shield,
  Database,
  Key,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Save,
  Upload,
  Download,
  Lock,
  Unlock,
  Layers,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface EnvConfig {
  name: string;
  value: string;
  isSecret: boolean;
  category: string;
  description: string;
  required: boolean;
  isSet: boolean;
}

interface Environment {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  lastDeploy: string;
  version: string;
  url: string;
  configCount: number;
}

// Mock data
const ENVIRONMENTS: Environment[] = [
  {
    id: "prod",
    name: "Production",
    status: "active",
    lastDeploy: "2h ago",
    version: "v2.3.1",
    url: "https://quantumx.io",
    configCount: 24,
  },
  {
    id: "staging",
    name: "Staging",
    status: "active",
    lastDeploy: "30m ago",
    version: "v2.4.0-beta",
    url: "https://staging.quantumx.io",
    configCount: 24,
  },
  {
    id: "dev",
    name: "Development",
    status: "active",
    lastDeploy: "5m ago",
    version: "v2.4.1-dev",
    url: "https://dev.quantumx.io",
    configCount: 24,
  },
];

const CONFIG_VARS: EnvConfig[] = [
  // API Keys
  { name: "BINANCE_API_KEY", value: "bnb_xxxxx", isSecret: true, category: "API Keys", description: "Binance API Key", required: true, isSet: true },
  { name: "BINANCE_SECRET", value: "bnb_secret", isSecret: true, category: "API Keys", description: "Binance API Secret", required: true, isSet: true },
  { name: "OKX_API_KEY", value: "okx_xxxxx", isSecret: true, category: "API Keys", description: "OKX API Key", required: false, isSet: true },
  { name: "BYBIT_API_KEY", value: "bybit_xxxxx", isSecret: true, category: "API Keys", description: "Bybit API Key", required: false, isSet: false },
  // Database
  { name: "DATABASE_URL", value: "postgresql://...", isSecret: true, category: "Database", description: "PostgreSQL connection string", required: true, isSet: true },
  { name: "REDIS_URL", value: "redis://...", isSecret: true, category: "Database", description: "Redis connection string", required: true, isSet: true },
  { name: "TIMESCALE_URL", value: "postgresql://...", isSecret: true, category: "Database", description: "TimescaleDB for time-series", required: true, isSet: true },
  // Security
  { name: "JWT_SECRET", value: "jwt_xxxxx", isSecret: true, category: "Security", description: "JWT signing secret", required: true, isSet: true },
  { name: "ENCRYPTION_KEY", value: "enc_xxxxx", isSecret: true, category: "Security", description: "Data encryption key", required: true, isSet: true },
  { name: "API_RATE_LIMIT", value: "1000", isSecret: false, category: "Security", description: "Requests per minute", required: true, isSet: true },
  // Services
  { name: "SENTRY_DSN", value: "https://sentry.io/...", isSecret: true, category: "Services", description: "Sentry error tracking", required: false, isSet: true },
  { name: "SLACK_WEBHOOK", value: "https://hooks.slack.com/...", isSecret: true, category: "Services", description: "Slack notifications", required: false, isSet: true },
  { name: "TELEGRAM_BOT_TOKEN", value: "tg_xxxxx", isSecret: true, category: "Services", description: "Telegram bot token", required: false, isSet: false },
  // Feature Flags
  { name: "ENABLE_LIVE_TRADING", value: "false", isSecret: false, category: "Features", description: "Enable live trading", required: true, isSet: true },
  { name: "ENABLE_COPY_TRADING", value: "true", isSecret: false, category: "Features", description: "Enable copy trading", required: true, isSet: true },
  { name: "MAINTENANCE_MODE", value: "false", isSecret: false, category: "Features", description: "Maintenance mode", required: true, isSet: true },
];

export default function ConfigPage() {
  const t = useTranslations("configPage");

  const CATEGORIES = [
    { value: "All", label: t("all") },
    { value: "API Keys", label: t("apiKeys") },
    { value: "Database", label: t("database") },
    { value: "Security", label: t("security") },
    { value: "Services", label: t("services") },
    { value: "Features", label: t("features") },
  ];
  const [selectedEnv, setSelectedEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConfigs = CONFIG_VARS.filter((config) => {
    const matchesCategory = selectedCategory === "All" || config.category === CATEGORIES.find(c => c.value === selectedCategory)?.value;
    const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, EnvConfig[]>);

  const getStatusIcon = (status: Environment["status"]) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive": return <XCircle className="h-4 w-4 text-gray-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const toggleSecret = (name: string) => {
    setShowSecrets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const stats = {
    total: CONFIG_VARS.length,
    set: CONFIG_VARS.filter((c) => c.isSet).length,
    required: CONFIG_VARS.filter((c) => c.required).length,
    missing: CONFIG_VARS.filter((c) => c.required && !c.isSet).length,
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
            <Upload className="mr-2 h-4 w-4" />
            {t("import")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      {/* Environment Selector */}
      <div className="grid gap-4 md:grid-cols-3">
        {ENVIRONMENTS.map((env) => (
          <Card
            key={env.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedEnv.id === env.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedEnv(env)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(env.status)}
                  <span className="font-semibold">{env.name}</span>
                </div>
                <Badge variant="outline">{env.version}</Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="truncate">{env.url}</p>
                <p>{t("lastDeploy")}: {env.lastDeploy}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalConfigs")}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("configured")}</p>
                <p className="text-xl font-bold text-green-500">{stats.set}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("required")}</p>
                <p className="text-xl font-bold">{stats.required}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stats.missing > 0 ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                {stats.missing > 0 ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("missing")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.missing > 0 ? "text-red-500" : "text-green-500"
                )}>
                  {stats.missing}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Config Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("environmentVariables", { env: selectedEnv.name })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("searchConfigs")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Config Groups */}
          <div className="space-y-6">
            {Object.entries(groupedConfigs).map(([category, configs]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div
                      key={config.name}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        !config.isSet && config.required && "border-red-500/50 bg-red-500/5"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-semibold">{config.name}</code>
                          {config.required && (
                            <Badge variant="outline" className="text-xs">required</Badge>
                          )}
                          {config.isSecret && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-2 w-80">
                        <Input
                          type={config.isSecret && !showSecrets[config.name] ? "password" : "text"}
                          value={config.isSet ? (config.isSecret && !showSecrets[config.name] ? "••••••••" : config.value) : ""}
                          placeholder={t("notSet")}
                          className="font-mono text-sm"
                          disabled={!config.isSet}
                        />
                        {config.isSecret && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSecret(config.name)}
                          >
                            {showSecrets[config.name] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-20 text-center">
                        {config.isSet ? (
                          <Badge className="bg-green-500">{t("set")}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500 border-red-500">{t("missing")}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
