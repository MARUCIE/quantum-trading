"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Power,
  PowerOff,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: number;
  lastUsedAt: number | null;
  expiresAt: number | null;
  isActive: boolean;
  ipWhitelist: string[] | null;
  rateLimit: number;
  usageCount: number;
}

interface ApiKeyCreateResult {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  permissions: string[];
  createdAt: number;
  expiresAt: number | null;
}

interface KeyStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  totalUsage: number;
}

interface PermissionGroups {
  readonly: string[];
  trading: string[];
  full: string[];
  admin: string[];
}

// Moved inside component to use translations

export default function ApiKeysPage() {
  const t = useTranslations("apiKeysPage");

  const EXPIRY_OPTIONS = [
    { value: "none", label: t("neverExpires") },
    { value: "7d", label: t("days7"), ms: 7 * 24 * 60 * 60 * 1000 },
    { value: "30d", label: t("days30"), ms: 30 * 24 * 60 * 60 * 1000 },
    { value: "90d", label: t("days90"), ms: 90 * 24 * 60 * 60 * 1000 },
    { value: "1y", label: t("year1"), ms: 365 * 24 * 60 * 60 * 1000 },
  ];
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [stats, setStats] = useState<KeyStats | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroups | null>(null);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyCreateResult | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [keyName, setKeyName] = useState("");
  const [permissionGroup, setPermissionGroup] = useState("readonly");
  const [expiry, setExpiry] = useState("30d");
  const [rateLimit, setRateLimit] = useState("60");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/keys`);
      const data = await response.json();
      setKeys(data.keys || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/keys/permissions`);
      const data = await response.json();
      setAllPermissions(data.all || []);
      setPermissionGroups(data.groups || null);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchKeys();
    fetchPermissions();
  }, [fetchKeys, fetchPermissions]);

  // Create key
  const handleCreateKey = async () => {
    if (!keyName.trim() || !permissionGroups) return;

    setCreating(true);
    try {
      const permissions = permissionGroups[permissionGroup as keyof PermissionGroups] || [];
      const expiryOption = EXPIRY_OPTIONS.find((e) => e.value === expiry);
      const expiresIn = expiryOption?.ms || null;

      const response = await fetch(`${apiUrl}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName.trim(),
          permissions,
          expiresIn,
          rateLimit: parseInt(rateLimit, 10) || 60,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setNewlyCreatedKey(data);
        setShowCreateForm(false);
        setKeyName("");
        setPermissionGroup("readonly");
        setExpiry("30d");
        setRateLimit("60");
        fetchKeys();
      } else {
        console.error("Failed to create key:", data.error);
      }
    } catch (error) {
      console.error("Failed to create key:", error);
    } finally {
      setCreating(false);
    }
  };

  // Toggle key active status
  const handleToggleKey = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/keys/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to toggle key:", error);
    }
  };

  // Revoke key
  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to revoke key:", error);
    }
  };

  // Copy key to clipboard
  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Format date
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (ts: number) =>
    new Date(ts).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Check if key is expired
  const isExpired = (expiresAt: number | null) =>
    expiresAt !== null && expiresAt < Date.now();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchKeys} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            {t("refresh")}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createKey")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalKeys")}
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("activeKeys")}
              </CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("expiredKeys")}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.expired}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalUsage")}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUsage.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <Card className="border-green-500 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <Check className="h-5 w-5" />
              {t("apiKeyCreatedSuccessfully")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                {t("copyKeyWarning")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">
                {showKey ? newlyCreatedKey.key : "qx_live_" + "*".repeat(56)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyKey(newlyCreatedKey.key)}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setNewlyCreatedKey(null);
                setShowKey(false);
              }}
            >
              {t("iveCopiedTheKey")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Key Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t("createNewApiKey")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="keyName">{t("keyName")}</Label>
                <Input
                  id="keyName"
                  placeholder={t("keyNamePlaceholder")}
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permissionGroup">{t("permissionLevel")}</Label>
                <Select
                  id="permissionGroup"
                  value={permissionGroup}
                  onChange={(e) => setPermissionGroup(e.target.value)}
                >
                  <SelectOption value="readonly">{t("readOnly")}</SelectOption>
                  <SelectOption value="trading">{t("trading")}</SelectOption>
                  <SelectOption value="full">{t("fullAccess")}</SelectOption>
                  <SelectOption value="admin">{t("admin")}</SelectOption>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">{t("expiration")}</Label>
                <Select
                  id="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                >
                  {EXPIRY_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimit">{t("rateLimit")}</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  min={1}
                  max={10000}
                />
              </div>
            </div>

            {/* Permission Preview */}
            {permissionGroups && (
              <div className="space-y-2">
                <Label>{t("permissions")}</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    permissionGroups[permissionGroup as keyof PermissionGroups] || []
                  ).map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateKey}
                disabled={creating || !keyName.trim()}
              >
                {creating ? t("creating") : t("createApiKey")}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                {t("cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("apiKeys")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("noApiKeys")}</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {t("noApiKeysDescription")}
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("createKey")}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("key")}</TableHead>
                    <TableHead>{t("permissions")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("lastUsed")}</TableHead>
                    <TableHead>{t("usage")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{key.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t("created")} {formatDate(key.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.keyPrefix}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.slice(0, 3).map((perm) => (
                            <Badge
                              key={perm}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {perm.split(":")[1]}
                            </Badge>
                          ))}
                          {key.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{key.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpired(key.expiresAt) ? (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                            {t("expired")}
                          </Badge>
                        ) : key.isActive ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                            {t("active")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                            {t("inactive")}
                          </Badge>
                        )}
                        {key.expiresAt && !isExpired(key.expiresAt) && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {t("expires")} {formatDate(key.expiresAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {key.lastUsedAt ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(key.lastUsedAt)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("never")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {key.usageCount.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          / {key.rateLimit}/min
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleKey(key.id, key.isActive)}
                            title={key.isActive ? t("deactivate") : t("activate")}
                          >
                            {key.isActive ? (
                              <PowerOff className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRevokeKey(key.id, key.name)}
                            title={t("revoke")}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-500">{t("securityBestPractices")}</h4>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>- {t("securityTip1")}</li>
              <li>- {t("securityTip2")}</li>
              <li>- {t("securityTip3")}</li>
              <li>- {t("securityTip4")}</li>
              <li>- {t("securityTip5")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
