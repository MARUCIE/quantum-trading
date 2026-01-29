"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Wifi,
  XCircle,
  Zap,
  Users,
  BarChart3,
  Timer,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
  threshold: { warning: number; critical: number };
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  service: string;
  timestamp: string;
  acknowledged: boolean;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
  responseTime: number;
  errorRate: number;
  requests: number;
}

export default function MonitoringPage() {
  const t = useTranslations("monitoringPage");

  // Mock data - moved inside component to use translations
  const generateMockMetrics = (): SystemMetric[] => {
    return [
      { name: t("cpuUsage"), value: 45 + Math.random() * 20, unit: "%", trend: "up", status: "healthy", threshold: { warning: 70, critical: 90 } },
      { name: t("memoryUsage"), value: 62 + Math.random() * 15, unit: "%", trend: "stable", status: "healthy", threshold: { warning: 80, critical: 95 } },
      { name: t("diskUsage"), value: 58 + Math.random() * 10, unit: "%", trend: "up", status: "healthy", threshold: { warning: 75, critical: 90 } },
      { name: t("networkIO"), value: 125 + Math.random() * 50, unit: "Mbps", trend: "up", status: "healthy", threshold: { warning: 800, critical: 950 } },
      { name: t("dbConnections"), value: 45 + Math.floor(Math.random() * 20), unit: "", trend: "stable", status: "healthy", threshold: { warning: 80, critical: 95 } },
      { name: t("cacheHitRate"), value: 92 + Math.random() * 5, unit: "%", trend: "stable", status: "healthy", threshold: { warning: 85, critical: 75 } },
    ];
  };

  const generateMockAlerts = (): Alert[] => {
    return [
      {
        id: "alert-1",
        severity: "warning",
        title: t("highApiLatency"),
        message: t("highApiLatencyMsg"),
        service: t("apiGateway"),
        timestamp: "2m ago",
        acknowledged: false,
      },
      {
        id: "alert-2",
        severity: "info",
        title: t("deploymentCompleted"),
        message: t("deploymentCompletedMsg"),
        service: t("cicd"),
        timestamp: "15m ago",
        acknowledged: true,
      },
      {
        id: "alert-3",
        severity: "critical",
        title: t("wsConnectionDrop"),
        message: t("wsConnectionDropMsg"),
        service: t("wsServer"),
        timestamp: "5m ago",
        acknowledged: false,
      },
      {
        id: "alert-4",
        severity: "warning",
        title: t("rateLimitApproaching"),
        message: t("rateLimitApproachingMsg"),
        service: t("exchangeConnector"),
        timestamp: "8m ago",
        acknowledged: true,
      },
    ];
  };

  const SERVICES: ServiceStatus[] = [
    { name: t("frontend"), status: "operational", uptime: 99.99, responseTime: 45, errorRate: 0.01, requests: 125000 },
    { name: t("apiServer"), status: "operational", uptime: 99.95, responseTime: 120, errorRate: 0.05, requests: 85000 },
    { name: t("webSocket"), status: "degraded", uptime: 99.82, responseTime: 25, errorRate: 0.15, requests: 250000 },
    { name: t("database"), status: "operational", uptime: 99.99, responseTime: 5, errorRate: 0.001, requests: 450000 },
    { name: t("redisCache"), status: "operational", uptime: 99.98, responseTime: 2, errorRate: 0.0, requests: 1200000 },
    { name: t("exchangeConnector"), status: "operational", uptime: 99.90, responseTime: 85, errorRate: 0.08, requests: 35000 },
  ];
  const [metrics, setMetrics] = useState<SystemMetric[]>(generateMockMetrics);
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const stats = useMemo(() => ({
    healthyServices: SERVICES.filter((s) => s.status === "operational").length,
    totalServices: SERVICES.length,
    activeAlerts: alerts.filter((a) => !a.acknowledged).length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    avgUptime: SERVICES.reduce((sum, s) => sum + s.uptime, 0) / SERVICES.length,
    totalRequests: SERVICES.reduce((sum, s) => sum + s.requests, 0),
  }), [alerts]);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational": return "bg-green-500/10 text-green-500";
      case "degraded": return "bg-yellow-500/10 text-yellow-500";
      case "outage": return "bg-red-500/10 text-red-500";
    }
  };

  const getMetricStatus = (metric: SystemMetric) => {
    if (metric.value >= metric.threshold.critical) return "critical";
    if (metric.value >= metric.threshold.warning) return "warning";
    return "healthy";
  };

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
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "default" : "outline"} className={cn(isLive && "bg-green-500")}>
            <Activity className={cn("mr-1 h-3 w-3", isLive && "animate-pulse")} />
            {isLive ? t("live") : t("paused")}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? t("pause") : t("resume")}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stats.healthyServices === stats.totalServices ? "bg-green-500/10" : "bg-yellow-500/10"
              )}>
                <Server className={cn(
                  "h-5 w-5",
                  stats.healthyServices === stats.totalServices ? "text-green-500" : "text-yellow-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("services")}</p>
                <p className="text-xl font-bold">
                  {stats.healthyServices}/{stats.totalServices}
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
                stats.criticalAlerts > 0 ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                <Bell className={cn(
                  "h-5 w-5",
                  stats.criticalAlerts > 0 ? "text-red-500" : "text-green-500"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("activeAlerts")}</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.criticalAlerts > 0 && "text-red-500"
                )}>
                  {stats.activeAlerts}
                </p>
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
                <p className="text-sm text-muted-foreground">{t("avgUptime")}</p>
                <p className="text-xl font-bold">{stats.avgUptime.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("requestsPerHour")}</p>
                <p className="text-xl font-bold">{(stats.totalRequests / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("activeUsers")}</p>
                <p className="text-xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Wifi className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("wsConnections")}</p>
                <p className="text-xl font-bold">892</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              {t("systemMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.map((metric) => {
              const status = getMetricStatus(metric);
              return (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{metric.name}</span>
                      {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      status === "critical" ? "text-red-500" :
                      status === "warning" ? "text-yellow-500" : "text-green-500"
                    )}>
                      {metric.value.toFixed(1)}{metric.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        status === "critical" ? "bg-red-500" :
                        status === "warning" ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className="text-yellow-500">{metric.threshold.warning}</span>
                    <span className="text-red-500">{metric.threshold.critical}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("activeAlerts")}
              {stats.activeAlerts > 0 && (
                <Badge variant="destructive">{stats.activeAlerts}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border",
                  !alert.acknowledged && "border-l-4",
                  !alert.acknowledged && alert.severity === "critical" && "border-l-red-500",
                  !alert.acknowledged && alert.severity === "warning" && "border-l-yellow-500",
                  !alert.acknowledged && alert.severity === "info" && "border-l-blue-500",
                  alert.acknowledged && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant="outline" className={cn("border", getSeverityColor(alert.severity))}>
                          {t(alert.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{alert.service}</span>
                        <span>|</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button variant="ghost" size="sm">
                      {t("acknowledge")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t("serviceStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <div key={service.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{service.name}</span>
                  <Badge variant="outline" className={getStatusColor(service.status)}>
                    {t(service.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("uptime")}</p>
                    <p className="font-semibold">{service.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("response")}</p>
                    <p className={cn(
                      "font-semibold",
                      service.responseTime < 100 ? "text-green-500" :
                      service.responseTime < 200 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {service.responseTime}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("errorRate")}</p>
                    <p className={cn(
                      "font-semibold",
                      service.errorRate < 0.1 ? "text-green-500" :
                      service.errorRate < 0.5 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {service.errorRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("requests")}</p>
                    <p className="font-semibold">{(service.requests / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
