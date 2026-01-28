"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Zap,
  DollarSign,
  Shield,
  Clock,
  Search,
  Archive,
  MailOpen,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface Notification {
  id: string;
  type: "trade" | "alert" | "system" | "price" | "news";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  metadata?: Record<string, string | number>;
}

interface NotificationPreference {
  type: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
}

export default function NotificationsPage() {
  const t = useTranslations("notificationsPage");

  // Mock data - moved inside component to use translations
  const generateMockNotifications = (): Notification[] => {
    return [
      {
        id: "n1",
        type: "trade",
        priority: "high",
        title: t("orderFilled"),
        message: t("orderFilledMsg"),
        timestamp: "2m ago",
        read: false,
        archived: false,
        metadata: { symbol: "BTC/USDT", quantity: 0.5, price: 67450 },
      },
      {
        id: "n2",
        type: "alert",
        priority: "urgent",
        title: t("stopLossTriggered"),
        message: t("stopLossTriggeredMsg"),
        timestamp: "5m ago",
        read: false,
        archived: false,
        metadata: { symbol: "ETH/USDT", pnl: -2.5 },
      },
      {
        id: "n3",
        type: "price",
        priority: "medium",
        title: t("priceAlert"),
        message: t("priceAlertMsg"),
        timestamp: "15m ago",
        read: false,
        archived: false,
        metadata: { symbol: "BTC/USDT", price: 67500 },
      },
      {
        id: "n4",
        type: "system",
        priority: "low",
        title: t("apiKeyExpiring"),
        message: t("apiKeyExpiringMsg"),
        timestamp: "1h ago",
        read: true,
        archived: false,
      },
      {
        id: "n5",
        type: "news",
        priority: "medium",
        title: t("marketNews"),
        message: t("marketNewsMsg"),
        timestamp: "2h ago",
        read: true,
        archived: false,
      },
      {
        id: "n6",
        type: "trade",
        priority: "high",
        title: t("takeProfitHit"),
        message: t("takeProfitHitMsg"),
        timestamp: "3h ago",
        read: true,
        archived: false,
        metadata: { symbol: "SOL/USDT", pnl: 8.5 },
      },
      {
        id: "n7",
        type: "system",
        priority: "low",
        title: t("backupComplete"),
        message: t("backupCompleteMsg"),
        timestamp: "6h ago",
        read: true,
        archived: false,
      },
      {
        id: "n8",
        type: "alert",
        priority: "medium",
        title: t("unusualVolume"),
        message: t("unusualVolumeMsg"),
        timestamp: "8h ago",
        read: true,
        archived: false,
        metadata: { symbol: "BNB/USDT", volumeMultiplier: 3 },
      },
    ];
  };

  const PREFERENCES: NotificationPreference[] = [
    { type: t("tradeExecutions"), email: true, push: true, inApp: true, sound: true },
    { type: t("priceAlerts"), email: false, push: true, inApp: true, sound: true },
    { type: t("stopLossTakeProfit"), email: true, push: true, inApp: true, sound: true },
    { type: t("systemUpdates"), email: true, push: false, inApp: true, sound: false },
    { type: t("newsAnalysis"), email: false, push: false, inApp: true, sound: false },
    { type: t("accountSecurity"), email: true, push: true, inApp: true, sound: true },
  ];

  const NOTIFICATION_TYPE_KEYS = ["all", "trade", "alert", "price", "system", "news"];
  const NOTIFICATION_TYPES = NOTIFICATION_TYPE_KEYS.map(key => ({ key, label: t(key) }));
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(PREFERENCES);
  const [selectedType, setSelectedType] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = selectedType === "all" || n.type === selectedType;
      const matchesArchived = showArchived ? n.archived : !n.archived;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesArchived && matchesSearch;
    });
  }, [notifications, selectedType, showArchived, searchQuery]);

  const stats = useMemo(() => ({
    total: notifications.filter((n) => !n.archived).length,
    unread: notifications.filter((n) => !n.read && !n.archived).length,
    urgent: notifications.filter((n) => n.priority === "urgent" && !n.read).length,
  }), [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "trade": return <TrendingUp className="h-4 w-4" />;
      case "alert": return <AlertTriangle className="h-4 w-4" />;
      case "price": return <DollarSign className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      case "news": return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "trade": return "text-green-500";
      case "alert": return "text-red-500";
      case "price": return "text-blue-500";
      case "system": return "text-purple-500";
      case "news": return "text-cyan-500";
    }
  };

  const togglePreference = (index: number, field: keyof NotificationPreference) => {
    if (field === "type") return;
    setPreferences((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: !p[field as keyof typeof p] } : p))
    );
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
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            {showSettings ? t("viewNotifications") : t("settings")}
          </Button>
          {!showSettings && stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              {t("markAllRead")}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("total")}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stats.unread > 0 ? "bg-orange-500/10" : "bg-green-500/10"
              )}>
                <Mail className={cn(
                  "h-5 w-5",
                  stats.unread > 0 ? "text-orange-500" : "text-green-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("unread")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.unread > 0 && "text-orange-500"
                )}>
                  {stats.unread}
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
                stats.urgent > 0 ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                <Zap className={cn(
                  "h-5 w-5",
                  stats.urgent > 0 ? "text-red-500" : "text-green-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("urgent")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.urgent > 0 && "text-red-500"
                )}>
                  {stats.urgent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Archive className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("archived")}</p>
                <p className="text-xl font-bold">
                  {notifications.filter((n) => n.archived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSettings ? (
        /* Settings Panel */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("notificationPreferences")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">{t("notificationType")}</th>
                    <th className="text-center p-3 font-medium">{t("email")}</th>
                    <th className="text-center p-3 font-medium">{t("push")}</th>
                    <th className="text-center p-3 font-medium">{t("inApp")}</th>
                    <th className="text-center p-3 font-medium">{t("sound")}</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map((pref, index) => (
                    <tr key={pref.type} className="border-t">
                      <td className="p-3 font-medium">{pref.type}</td>
                      {(["email", "push", "inApp", "sound"] as const).map((field) => (
                        <td key={field} className="p-3 text-center">
                          <Button
                            variant={pref[field] ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-16",
                              pref[field] && "bg-green-500 hover:bg-green-600"
                            )}
                            onClick={() => togglePreference(index, field)}
                          >
                            {pref[field] ? t("on") : t("off")}
                          </Button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Notifications List */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {showArchived ? t("archivedNotifications") : t("recentNotifications")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Button
                  variant={showArchived ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {showArchived ? t("showActive") : t("showArchived")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Type Filter */}
            <div className="flex gap-2 mb-4">
              {NOTIFICATION_TYPES.map((type) => (
                <Button
                  key={type.key}
                  variant={selectedType === type.key ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.key)}
                >
                  {type.label}
                </Button>
              ))}
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    !notification.read && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                      getTypeColor(notification.type)
                    )}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{notification.title}</span>
                        <Badge variant="outline" className={cn("border", getPriorityColor(notification.priority))}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => archiveNotification(notification.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("noNotificationsFound")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
