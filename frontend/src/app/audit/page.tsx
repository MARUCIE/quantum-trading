"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface AuditEntry {
  timestamp: number;
  action: string;
  actor: string;
  subject: string;
  details: Record<string, unknown>;
  hash?: string;
}

interface AuditStats {
  totalEntries: number;
  actionCounts: Record<string, number>;
  actorCounts: Record<string, number>;
  firstEntry?: number;
  lastEntry?: number;
  integrityValid: boolean;
  integrityErrors: number;
}

const ACTION_TYPES = [
  { value: "all", label: "All Actions" },
  { value: "order_submit", label: "Order Submit" },
  { value: "order_fill", label: "Order Fill" },
  { value: "order_cancel", label: "Order Cancel" },
  { value: "order_reject", label: "Order Reject" },
  { value: "position_open", label: "Position Open" },
  { value: "position_close", label: "Position Close" },
  { value: "risk_check", label: "Risk Check" },
  { value: "risk_breach", label: "Risk Breach" },
  { value: "strategy_signal", label: "Strategy Signal" },
  { value: "system_event", label: "System Event" },
];

const ACTION_COLORS: Record<string, string> = {
  order_submit: "bg-blue-500/10 text-blue-500",
  order_fill: "bg-green-500/10 text-green-500",
  order_cancel: "bg-yellow-500/10 text-yellow-500",
  order_reject: "bg-red-500/10 text-red-500",
  position_open: "bg-emerald-500/10 text-emerald-500",
  position_close: "bg-orange-500/10 text-orange-500",
  risk_check: "bg-cyan-500/10 text-cyan-500",
  risk_breach: "bg-red-600/10 text-red-600",
  strategy_signal: "bg-purple-500/10 text-purple-500",
  system_event: "bg-gray-500/10 text-gray-500",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Fetch audit logs
  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (actionFilter !== "all") {
        params.set("action", actionFilter);
      }

      const response = await fetch(`${apiUrl}/audit/logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
  };

  // Fetch audit stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/audit/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch audit stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [actionFilter]);

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setLoading(false);
  };

  // Export logs as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format timestamp
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  // Format action for display
  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.actor.toLowerCase().includes(query) ||
      log.subject.toLowerCase().includes(query) ||
      JSON.stringify(log.details).toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Immutable audit trail for compliance and debugging
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEntries.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Since {stats?.firstEntry ? formatTime(stats.firstEntry) : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chain Integrity</CardTitle>
            {stats?.integrityValid ? (
              <ShieldCheck className="h-4 w-4 text-green-500" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats?.integrityValid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold text-green-500">Valid</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold text-red-500">
                    {stats?.integrityErrors || 0} Errors
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Hash chain verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.actionCounts && Object.keys(stats.actionCounts).length > 0 ? (
              <>
                <div className="text-lg font-semibold">
                  {formatAction(
                    Object.entries(stats.actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
                      "N/A"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(stats.actionCounts).sort(([, a], [, b]) => b - a)[0]?.[1] || 0}{" "}
                  occurrences
                </p>
              </>
            ) : (
              <div className="text-lg font-semibold">N/A</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Entry</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {stats?.lastEntry ? formatTime(stats.lastEntry) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent audit entry</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-[200px]"
            >
              {ACTION_TYPES.map((type) => (
                <SelectOption key={type.value} value={type.value}>
                  {type.label}
                </SelectOption>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[140px]">Action</TableHead>
                  <TableHead className="w-[120px]">Actor</TableHead>
                  <TableHead className="w-[150px]">Subject</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[100px]">Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No audit entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.slice(0, 100).map((log, index) => (
                    <TableRow key={`${log.timestamp}-${index}`}>
                      <TableCell className="font-mono text-xs">
                        {formatTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            ACTION_COLORS[log.action] || "bg-gray-500/10"
                          )}
                        >
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.actor}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[150px]">
                        {log.subject}
                      </TableCell>
                      <TableCell className="text-xs">
                        <pre className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {JSON.stringify(log.details)}
                        </pre>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.hash?.slice(0, 8) || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLogs.length > 100 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing 100 of {filteredLogs.length} entries
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
