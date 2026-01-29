"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Globe,
  Server,
  Lock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  Zap,
  HardDrive,
  Cpu,
  Activity,
  MapPin,
  ArrowUpDown,
  FileText,
  Settings,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface SSLCertificate {
  domain: string;
  issuer: string;
  validFrom: string;
  validUntil: string;
  daysRemaining: number;
  status: "valid" | "expiring" | "expired";
  autoRenew: boolean;
}

interface CDNEdge {
  location: string;
  region: string;
  status: "online" | "offline" | "degraded";
  latency: number;
  cacheHitRate: number;
  bandwidth: number;
}

interface InfraService {
  name: string;
  type: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  lastCheck: string;
  responseTime: number;
}

// Mock data
const SSL_CERTS: SSLCertificate[] = [
  {
    domain: "quantumx.io",
    issuer: "Let's Encrypt",
    validFrom: "2024-01-15",
    validUntil: "2024-04-15",
    daysRemaining: 75,
    status: "valid",
    autoRenew: true,
  },
  {
    domain: "api.quantumx.io",
    issuer: "Let's Encrypt",
    validFrom: "2024-01-15",
    validUntil: "2024-04-15",
    daysRemaining: 75,
    status: "valid",
    autoRenew: true,
  },
  {
    domain: "ws.quantumx.io",
    issuer: "Let's Encrypt",
    validFrom: "2024-01-01",
    validUntil: "2024-04-01",
    daysRemaining: 61,
    status: "valid",
    autoRenew: true,
  },
  {
    domain: "staging.quantumx.io",
    issuer: "Let's Encrypt",
    validFrom: "2023-12-01",
    validUntil: "2024-03-01",
    daysRemaining: 28,
    status: "expiring",
    autoRenew: true,
  },
];

const CDN_EDGES: CDNEdge[] = [
  { location: "San Francisco", region: "US West", status: "online", latency: 12, cacheHitRate: 94.5, bandwidth: 2500 },
  { location: "New York", region: "US East", status: "online", latency: 8, cacheHitRate: 92.3, bandwidth: 3200 },
  { location: "London", region: "EU West", status: "online", latency: 15, cacheHitRate: 91.8, bandwidth: 1800 },
  { location: "Frankfurt", region: "EU Central", status: "online", latency: 18, cacheHitRate: 89.2, bandwidth: 1500 },
  { location: "Singapore", region: "Asia Pacific", status: "online", latency: 35, cacheHitRate: 88.5, bandwidth: 1200 },
  { location: "Tokyo", region: "Asia Pacific", status: "degraded", latency: 65, cacheHitRate: 85.2, bandwidth: 900 },
  { location: "Sydney", region: "Oceania", status: "online", latency: 42, cacheHitRate: 87.8, bandwidth: 650 },
];

const SERVICES: InfraService[] = [
  { name: "Frontend (Vercel)", type: "CDN", status: "healthy", uptime: 99.99, lastCheck: "30s ago", responseTime: 45 },
  { name: "API Server", type: "Compute", status: "healthy", uptime: 99.95, lastCheck: "30s ago", responseTime: 120 },
  { name: "WebSocket Server", type: "Compute", status: "healthy", uptime: 99.92, lastCheck: "30s ago", responseTime: 25 },
  { name: "PostgreSQL", type: "Database", status: "healthy", uptime: 99.99, lastCheck: "30s ago", responseTime: 5 },
  { name: "Redis Cache", type: "Cache", status: "healthy", uptime: 99.98, lastCheck: "30s ago", responseTime: 2 },
  { name: "TimescaleDB", type: "Database", status: "healthy", uptime: 99.97, lastCheck: "30s ago", responseTime: 8 },
];

export default function InfrastructurePage() {
  const t = useTranslations("infrastructurePage");
  const [selectedTab, setSelectedTab] = useState<"ssl" | "cdn" | "services">("ssl");

  const sslStats = {
    total: SSL_CERTS.length,
    valid: SSL_CERTS.filter((c) => c.status === "valid").length,
    expiring: SSL_CERTS.filter((c) => c.status === "expiring").length,
    expired: SSL_CERTS.filter((c) => c.status === "expired").length,
  };

  const cdnStats = {
    totalEdges: CDN_EDGES.length,
    online: CDN_EDGES.filter((e) => e.status === "online").length,
    avgCacheHit: CDN_EDGES.reduce((sum, e) => sum + e.cacheHitRate, 0) / CDN_EDGES.length,
    totalBandwidth: CDN_EDGES.reduce((sum, e) => sum + e.bandwidth, 0),
  };

  const serviceStats = {
    total: SERVICES.length,
    healthy: SERVICES.filter((s) => s.status === "healthy").length,
    avgUptime: SERVICES.reduce((sum, s) => sum + s.uptime, 0) / SERVICES.length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
      case "online":
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "expiring":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "expired":
      case "offline":
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
      case "online":
      case "healthy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "expiring":
      case "degraded":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "expired":
      case "offline":
      case "down":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
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
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("refreshAll")}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedTab === "ssl" ? "secondary" : "outline"}
          onClick={() => setSelectedTab("ssl")}
        >
          <Lock className="mr-2 h-4 w-4" />
          {t("sslTls")}
        </Button>
        <Button
          variant={selectedTab === "cdn" ? "secondary" : "outline"}
          onClick={() => setSelectedTab("cdn")}
        >
          <Globe className="mr-2 h-4 w-4" />
          {t("cdnEdges")}
        </Button>
        <Button
          variant={selectedTab === "services" ? "secondary" : "outline"}
          onClick={() => setSelectedTab("services")}
        >
          <Server className="mr-2 h-4 w-4" />
          {t("services")}
        </Button>
      </div>

      {/* SSL/TLS Section */}
      {selectedTab === "ssl" && (
        <>
          {/* SSL Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalCerts")}</p>
                    <p className="text-xl font-bold">{sslStats.total}</p>
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
                    <p className="text-sm text-muted-foreground">{t("valid")}</p>
                    <p className="text-xl font-bold text-green-500">{sslStats.valid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("expiringSoon")}</p>
                    <p className="text-xl font-bold text-yellow-500">{sslStats.expiring}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("autoRenew")}</p>
                    <p className="text-xl font-bold">{SSL_CERTS.filter((c) => c.autoRenew).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("sslCertificates")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SSL_CERTS.map((cert) => (
                  <div key={cert.domain} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(cert.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{cert.domain}</span>
                          <Badge variant="outline">{cert.issuer}</Badge>
                          {cert.autoRenew && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                              <RefreshCw className="mr-1 h-3 w-3" />
                              {t("autoRenew")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("valid")}: {cert.validFrom} to {cert.validUntil}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline" className={cn("border", getStatusColor(cert.status))}>
                          {cert.status}
                        </Badge>
                        <p className={cn(
                          "text-sm mt-1",
                          cert.daysRemaining < 30 ? "text-yellow-500" : "text-muted-foreground"
                        )}>
                          {cert.daysRemaining} {t("daysRemaining")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* CDN Section */}
      {selectedTab === "cdn" && (
        <>
          {/* CDN Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("edgeLocations")}</p>
                    <p className="text-xl font-bold">{cdnStats.totalEdges}</p>
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
                    <p className="text-sm text-muted-foreground">{t("online")}</p>
                    <p className="text-xl font-bold text-green-500">{cdnStats.online}</p>
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
                    <p className="text-sm text-muted-foreground">{t("cacheHitRate")}</p>
                    <p className="text-xl font-bold">{cdnStats.avgCacheHit.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <ArrowUpDown className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("bandwidth")}</p>
                    <p className="text-xl font-bold">{(cdnStats.totalBandwidth / 1000).toFixed(1)} Gbps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edge Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("edgeLocations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {CDN_EDGES.map((edge) => (
                  <div key={edge.location} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(edge.status)}
                        <span className="font-medium">{edge.location}</span>
                      </div>
                      <Badge variant="outline">{edge.region}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("latency")}</p>
                        <p className={cn(
                          "font-semibold",
                          edge.latency < 30 ? "text-green-500" :
                          edge.latency < 50 ? "text-yellow-500" : "text-red-500"
                        )}>
                          {edge.latency}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("cacheHit")}</p>
                        <p className={cn(
                          "font-semibold",
                          edge.cacheHitRate > 90 ? "text-green-500" : "text-yellow-500"
                        )}>
                          {edge.cacheHitRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("bandwidth")}</p>
                        <p className="font-semibold">{edge.bandwidth} Mbps</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Services Section */}
      {selectedTab === "services" && (
        <>
          {/* Service Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("healthy")}</p>
                    <p className="text-xl font-bold text-green-500">
                      {serviceStats.healthy} / {serviceStats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("avgUptime")}</p>
                    <p className="text-xl font-bold">{serviceStats.avgUptime.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("lastCheck")}</p>
                    <p className="text-xl font-bold">30s ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("services")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SERVICES.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{service.name}</span>
                          <Badge variant="outline">{service.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("response")}: {service.responseTime}ms | {t("lastCheck")}: {service.lastCheck}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline" className={cn("border", getStatusColor(service.status))}>
                          {service.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.uptime}% {t("uptime")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
