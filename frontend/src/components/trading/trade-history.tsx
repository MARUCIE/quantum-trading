"use client";

/**
 * Trade History Component
 *
 * Displays recent trades with filtering and pagination.
 * Supports real-time updates via WebSocket.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  total: number;
  fee?: number;
  feeCurrency?: string;
  timestamp: Date;
  orderId?: string;
}

export interface TradeHistoryProps {
  /** List of trades */
  trades: Trade[];
  /** Current page (1-indexed) */
  page?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when filter changes */
  onFilterChange?: (filters: TradeFilters) => void;
  /** Callback to export trades */
  onExport?: () => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Price precision for display */
  pricePrecision?: number;
  /** Quantity precision for display */
  quantityPrecision?: number;
  /** Show symbol column (useful when showing multiple symbols) */
  showSymbol?: boolean;
  /** Additional class names */
  className?: string;
}

export interface TradeFilters {
  symbol?: string;
  side?: "buy" | "sell" | "all";
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export function TradeHistory({
  trades,
  page = 1,
  totalPages = 1,
  onPageChange,
  onFilterChange,
  onExport,
  isLoading = false,
  pricePrecision = 2,
  quantityPrecision = 4,
  showSymbol = false,
  className,
}: TradeHistoryProps) {
  const [filters, setFilters] = React.useState<TradeFilters>({
    side: "all",
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const handleFilterChange = (key: keyof TradeFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Trade History</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {onExport && (
            <Button variant="ghost" size="icon-sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                className="pl-9"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Side Filter */}
            <Select
              value={filters.side || "all"}
              onChange={(e) =>
                handleFilterChange(
                  "side",
                  e.target.value as "buy" | "sell" | "all"
                )
              }
            >
              <SelectOption value="all">All Sides</SelectOption>
              <SelectOption value="buy">Buy Only</SelectOption>
              <SelectOption value="sell">Sell Only</SelectOption>
            </Select>

            {/* Symbol Filter (if showing multiple) */}
            {showSymbol && (
              <Input
                placeholder="Filter by symbol..."
                value={filters.symbol || ""}
                onChange={(e) => handleFilterChange("symbol", e.target.value)}
              />
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Time</th>
              {showSymbol && <th className="px-4 py-3">Symbol</th>}
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={showSymbol ? 7 : 6}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td
                  colSpan={showSymbol ? 7 : 6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No trades found
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <TradeRow
                  key={trade.id}
                  trade={trade}
                  showSymbol={showSymbol}
                  pricePrecision={pricePrecision}
                  quantityPrecision={quantityPrecision}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TradeRowProps {
  trade: Trade;
  showSymbol: boolean;
  pricePrecision: number;
  quantityPrecision: number;
}

function TradeRow({
  trade,
  showSymbol,
  pricePrecision,
  quantityPrecision,
}: TradeRowProps) {
  const isBuy = trade.side === "buy";

  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/50">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {formatTime(trade.timestamp)}
          </span>
        </div>
      </td>
      {showSymbol && (
        <td className="px-4 py-3 text-sm font-medium">{trade.symbol}</td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded",
              isBuy
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                : "bg-red-100 text-red-600 dark:bg-red-900/30"
            )}
          >
            {isBuy ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              isBuy ? "text-emerald-600" : "text-red-600"
            )}
          >
            {isBuy ? "Buy" : "Sell"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm">
        ${trade.price.toFixed(pricePrecision)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm">
        {trade.quantity.toFixed(quantityPrecision)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm font-medium">
        ${trade.total.toFixed(pricePrecision)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
        {trade.fee ? (
          <span>
            {trade.fee.toFixed(4)} {trade.feeCurrency || ""}
          </span>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 24 hours ago - show time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // Less than 7 days ago - show day and time
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Otherwise show date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Recent Trades - Compact real-time trade ticker
 */
export interface RecentTradesProps {
  trades: Trade[];
  symbol?: string;
  maxItems?: number;
  pricePrecision?: number;
  quantityPrecision?: number;
  className?: string;
}

export function RecentTrades({
  trades,
  symbol,
  maxItems = 20,
  pricePrecision = 2,
  quantityPrecision = 4,
  className,
}: RecentTradesProps) {
  const displayTrades = trades.slice(0, maxItems);

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Recent Trades</h3>
        {symbol && (
          <span className="text-sm text-muted-foreground">{symbol}</span>
        )}
      </div>

      <div className="divide-y">
        {displayTrades.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No recent trades
          </div>
        ) : (
          displayTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono",
                    trade.side === "buy" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  ${trade.price.toFixed(pricePrecision)}
                </span>
                <span className="font-mono text-muted-foreground">
                  {trade.quantity.toFixed(quantityPrecision)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {trade.timestamp.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Trade Statistics - Summary metrics
 */
export interface TradeStatsProps {
  trades: Trade[];
  className?: string;
}

export function TradeStats({ trades, className }: TradeStatsProps) {
  const stats = React.useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        buyCount: 0,
        sellCount: 0,
        totalVolume: 0,
        averagePrice: 0,
        totalFees: 0,
      };
    }

    const buyTrades = trades.filter((t) => t.side === "buy");
    const sellTrades = trades.filter((t) => t.side === "sell");
    const totalVolume = trades.reduce((sum, t) => sum + t.total, 0);
    const totalQuantity = trades.reduce((sum, t) => sum + t.quantity, 0);
    const totalFees = trades.reduce((sum, t) => sum + (t.fee || 0), 0);

    return {
      totalTrades: trades.length,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalVolume,
      averagePrice: totalQuantity > 0 ? totalVolume / totalQuantity : 0,
      totalFees,
    };
  }, [trades]);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      <div>
        <div className="text-sm text-muted-foreground">Total Trades</div>
        <div className="text-xl font-semibold">{stats.totalTrades}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Buys</div>
        <div className="text-xl font-semibold text-emerald-600">
          {stats.buyCount}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Sells</div>
        <div className="text-xl font-semibold text-red-600">
          {stats.sellCount}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Total Volume</div>
        <div className="text-xl font-semibold">
          ${stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Avg Price</div>
        <div className="text-xl font-semibold">
          ${stats.averagePrice.toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">Total Fees</div>
        <div className="text-xl font-semibold text-amber-600">
          ${stats.totalFees.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
