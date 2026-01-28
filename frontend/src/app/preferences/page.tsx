"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Settings,
  User,
  Palette,
  Globe,
  Clock,
  DollarSign,
  Bell,
  Shield,
  Monitor,
  Moon,
  Sun,
  Languages,
  Save,
  RotateCcw,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface UserPreferences {
  display: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
  };
  trading: {
    defaultExchange: string;
    defaultPair: string;
    defaultTimeframe: string;
    confirmOrders: boolean;
    soundAlerts: boolean;
    defaultLeverage: number;
  };
  currency: {
    baseCurrency: string;
    showPnlIn: "base" | "usd" | "both";
    decimalPlaces: number;
  };
  privacy: {
    showBalances: boolean;
    hideSmallBalances: boolean;
    smallBalanceThreshold: number;
    activityStatus: "online" | "away" | "invisible";
  };
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Asia/Shanghai", label: "China (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
];

const EXCHANGES = ["Binance", "OKX", "Bybit", "Kraken", "Coinbase"];
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH"];

export default function PreferencesPage() {
  const t = useTranslations("preferencesPage");

  // Theme options - moved inside component for i18n
  const THEMES = [
    { id: "light", name: t("light"), icon: Sun },
    { id: "dark", name: t("dark"), icon: Moon },
    { id: "system", name: t("system"), icon: Monitor },
  ];
  const [preferences, setPreferences] = useState<UserPreferences>({
    display: {
      theme: "dark",
      language: "en",
      timezone: "UTC",
      dateFormat: "YYYY-MM-DD",
      numberFormat: "1,234.56",
    },
    trading: {
      defaultExchange: "Binance",
      defaultPair: "BTC/USDT",
      defaultTimeframe: "1h",
      confirmOrders: true,
      soundAlerts: true,
      defaultLeverage: 1,
    },
    currency: {
      baseCurrency: "USD",
      showPnlIn: "usd",
      decimalPlaces: 2,
    },
    privacy: {
      showBalances: true,
      hideSmallBalances: true,
      smallBalanceThreshold: 1,
      activityStatus: "online",
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const updatePreference = <T extends keyof UserPreferences>(
    category: T,
    key: keyof UserPreferences[T],
    value: UserPreferences[T][keyof UserPreferences[T]]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    setHasChanges(false);
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
          {savedMessage && (
            <Badge className="bg-green-500">
              <Check className="mr-1 h-3 w-3" />
              {t("saved")}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reset")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("display")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div>
              <label className="text-sm font-medium mb-3 block">{t("theme")}</label>
              <div className="flex gap-2">
                {THEMES.map((theme) => (
                  <Button
                    key={theme.id}
                    variant={preferences.display.theme === theme.id ? "secondary" : "outline"}
                    className="flex-1"
                    onClick={() => updatePreference("display", "theme", theme.id as UserPreferences["display"]["theme"])}
                  >
                    <theme.icon className="mr-2 h-4 w-4" />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("language")}</label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3"
                value={preferences.display.language}
                onChange={(e) => updatePreference("display", "language", e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("timezone")}</label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3"
                value={preferences.display.timezone}
                onChange={(e) => updatePreference("display", "timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("dateFormat")}</label>
              <div className="flex gap-2">
                {["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"].map((format) => (
                  <Button
                    key={format}
                    variant={preferences.display.dateFormat === format ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("display", "dateFormat", format)}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("trading")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Exchange */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("defaultExchange")}</label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3"
                value={preferences.trading.defaultExchange}
                onChange={(e) => updatePreference("trading", "defaultExchange", e.target.value)}
              >
                {EXCHANGES.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            {/* Default Pair */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("defaultTradingPair")}</label>
              <Input
                value={preferences.trading.defaultPair}
                onChange={(e) => updatePreference("trading", "defaultPair", e.target.value)}
              />
            </div>

            {/* Default Timeframe */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("defaultTimeframe")}</label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <Button
                    key={tf}
                    variant={preferences.trading.defaultTimeframe === tf ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("trading", "defaultTimeframe", tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{t("confirmOrders")}</p>
                  <p className="text-sm text-muted-foreground">{t("confirmOrdersDesc")}</p>
                </div>
                <Button
                  variant={preferences.trading.confirmOrders ? "default" : "outline"}
                  size="sm"
                  className={cn(preferences.trading.confirmOrders && "bg-green-500 hover:bg-green-600")}
                  onClick={() => updatePreference("trading", "confirmOrders", !preferences.trading.confirmOrders)}
                >
                  {preferences.trading.confirmOrders ? t("on") : t("off")}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{t("soundAlerts")}</p>
                  <p className="text-sm text-muted-foreground">{t("soundAlertsDesc")}</p>
                </div>
                <Button
                  variant={preferences.trading.soundAlerts ? "default" : "outline"}
                  size="sm"
                  className={cn(preferences.trading.soundAlerts && "bg-green-500 hover:bg-green-600")}
                  onClick={() => updatePreference("trading", "soundAlerts", !preferences.trading.soundAlerts)}
                >
                  {preferences.trading.soundAlerts ? t("on") : t("off")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("currency")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Base Currency */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("baseCurrency")}</label>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((currency) => (
                  <Button
                    key={currency}
                    variant={preferences.currency.baseCurrency === currency ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("currency", "baseCurrency", currency)}
                  >
                    {currency}
                  </Button>
                ))}
              </div>
            </div>

            {/* P&L Display */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("showPnlIn")}</label>
              <div className="flex gap-2">
                {(["base", "usd", "both"] as const).map((option) => (
                  <Button
                    key={option}
                    variant={preferences.currency.showPnlIn === option ? "secondary" : "outline"}
                    className="flex-1"
                    onClick={() => updatePreference("currency", "showPnlIn", option)}
                  >
                    {option === "base" ? t("baseCurrencyOption") : option === "usd" ? t("usd") : t("both")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Decimal Places */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("decimalPlaces")}</label>
              <div className="flex gap-2">
                {[2, 4, 6, 8].map((places) => (
                  <Button
                    key={places}
                    variant={preferences.currency.decimalPlaces === places ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("currency", "decimalPlaces", places)}
                  >
                    {places}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("privacy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{t("showBalances")}</p>
                <p className="text-sm text-muted-foreground">{t("showBalancesDesc")}</p>
              </div>
              <Button
                variant={preferences.privacy.showBalances ? "default" : "outline"}
                size="sm"
                className={cn(preferences.privacy.showBalances && "bg-green-500 hover:bg-green-600")}
                onClick={() => updatePreference("privacy", "showBalances", !preferences.privacy.showBalances)}
              >
                {preferences.privacy.showBalances ? t("show") : t("hide")}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{t("hideSmallBalances")}</p>
                <p className="text-sm text-muted-foreground">{t("hideSmallBalancesDesc", { threshold: preferences.privacy.smallBalanceThreshold })}</p>
              </div>
              <Button
                variant={preferences.privacy.hideSmallBalances ? "default" : "outline"}
                size="sm"
                className={cn(preferences.privacy.hideSmallBalances && "bg-green-500 hover:bg-green-600")}
                onClick={() => updatePreference("privacy", "hideSmallBalances", !preferences.privacy.hideSmallBalances)}
              >
                {preferences.privacy.hideSmallBalances ? t("on") : t("off")}
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t("activityStatus")}</label>
              <div className="flex gap-2">
                {(["online", "away", "invisible"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={preferences.privacy.activityStatus === status ? "secondary" : "outline"}
                    className="flex-1"
                    onClick={() => updatePreference("privacy", "activityStatus", status)}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      status === "online" ? "bg-green-500" :
                      status === "away" ? "bg-yellow-500" : "bg-gray-500"
                    )} />
                    {status === "online" ? t("online") : status === "away" ? t("away") : t("invisible")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
