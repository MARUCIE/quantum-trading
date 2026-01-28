"use client";

/**
 * Position Manager Component
 *
 * Displays and manages open trading positions.
 * Includes P&L tracking, risk metrics, and position actions.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  X,
  Edit2,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface Position {
  id: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: Date;
  leverage?: number;
}

export interface PositionManagerProps {
  /** List of open positions */
  positions: Position[];
  /** Callback when position is closed */
  onClosePosition?: (positionId: string) => Promise<void>;
  /** Callback when position is modified (e.g., SL/TP update) */
  onModifyPosition?: (
    positionId: string,
    updates: Partial<Position>
  ) => Promise<void>;
  /** Whether actions are loading */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

export function PositionManager({
  positions,
  onClosePosition,
  onModifyPosition,
  isLoading = false,
  className,
}: PositionManagerProps) {
  const t = useTranslations("position");
  const tTrading = useTranslations("trading");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [closingId, setClosingId] = React.useState<string | null>(null);

  // Calculate aggregate metrics
  const metrics = React.useMemo(() => {
    let totalPnL = 0;
    let totalPnLPercent = 0;
    let totalValue = 0;

    positions.forEach((pos) => {
      const pnl = calculatePnL(pos);
      totalPnL += pnl.absolute;
      totalValue += pos.quantity * pos.entryPrice;
    });

    if (totalValue > 0) {
      totalPnLPercent = (totalPnL / totalValue) * 100;
    }

    return {
      totalPnL,
      totalPnLPercent,
      positionCount: positions.length,
      longCount: positions.filter((p) => p.side === "long").length,
      shortCount: positions.filter((p) => p.side === "short").length,
    };
  }, [positions]);

  const handleClose = async (positionId: string) => {
    setClosingId(positionId);
    try {
      await onClosePosition?.(positionId);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header with Aggregate Metrics */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{tTrading("openPositions")}</h3>
          <span className="text-sm text-muted-foreground">
            {metrics.positionCount} {t("position")}
            {metrics.positionCount !== 1 ? "s" : ""}
          </span>
        </div>

        {positions.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t("pnl")}</span>
              <div
                className={cn(
                  "font-semibold",
                  metrics.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {metrics.totalPnL >= 0 ? "+" : ""}$
                {metrics.totalPnL.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">{t("pnlPercent")}</span>
              <div
                className={cn(
                  "font-semibold",
                  metrics.totalPnLPercent >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {metrics.totalPnLPercent >= 0 ? "+" : ""}
                {metrics.totalPnLPercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">{t("longShort")}</span>
              <div className="font-semibold">
                {metrics.longCount}/{metrics.shortCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position List */}
      <div className="divide-y">
        {positions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t("noPositions")}
          </div>
        ) : (
          positions.map((position) => (
            <PositionRow
              key={position.id}
              position={position}
              isExpanded={expandedId === position.id}
              isClosing={closingId === position.id}
              isLoading={isLoading}
              onToggle={() =>
                setExpandedId(expandedId === position.id ? null : position.id)
              }
              onClose={() => handleClose(position.id)}
              onModify={onModifyPosition}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PositionRowProps {
  position: Position;
  isExpanded: boolean;
  isClosing: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onClose: () => void;
  onModify?: (
    positionId: string,
    updates: Partial<Position>
  ) => Promise<void>;
}

function PositionRow({
  position,
  isExpanded,
  isClosing,
  isLoading,
  onToggle,
  onClose,
  onModify,
}: PositionRowProps) {
  const t = useTranslations("position");
  const tTrading = useTranslations("trading");
  const pnl = calculatePnL(position);
  const riskLevel = calculateRiskLevel(position);

  return (
    <div className="p-4">
      {/* Main Row */}
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Direction Indicator */}
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              position.side === "long"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                : "bg-red-100 text-red-600 dark:bg-red-900/30"
            )}
          >
            {position.side === "long" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>

          {/* Symbol & Size */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{position.symbol}</span>
              {position.leverage && position.leverage > 1 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {position.leverage}x
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {position.quantity.toLocaleString()} @{" "}
              {position.entryPrice.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* P&L */}
          <div className="text-right">
            <div
              className={cn(
                "font-semibold",
                pnl.absolute >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {pnl.absolute >= 0 ? "+" : ""}$
              {pnl.absolute.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div
              className={cn(
                "text-sm",
                pnl.percent >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {pnl.percent >= 0 ? "+" : ""}
              {pnl.percent.toFixed(2)}%
            </div>
          </div>

          {/* Risk Indicator */}
          <RiskIndicator level={riskLevel} />

          {/* Expand Chevron */}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Price Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{tTrading("entryPrice")}</span>
              <div className="font-medium">
                ${position.entryPrice.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">{tTrading("currentPrice")}</span>
              <div className="font-medium">
                ${position.currentPrice.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">{tTrading("positionValue")}</span>
              <div className="font-medium">
                $
                {(position.quantity * position.currentPrice).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}
              </div>
            </div>
          </div>

          {/* SL/TP Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tTrading("stopLoss")}:</span>
              <span className="font-medium">
                {position.stopLoss
                  ? `$${position.stopLoss.toLocaleString()}`
                  : t("notSet")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tTrading("takeProfit")}:</span>
              <span className="font-medium">
                {position.takeProfit
                  ? `$${position.takeProfit.toLocaleString()}`
                  : t("notSet")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Open modify modal
              }}
              disabled={isLoading}
            >
              <Edit2 className="mr-2 h-3 w-3" />
              {t("modify")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={isLoading || isClosing}
            >
              <X className="mr-2 h-3 w-3" />
              {isClosing ? tTrading("closing") : tTrading("closePosition")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskIndicator({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600",
      icon: Shield,
    },
    medium: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600",
      icon: AlertTriangle,
    },
    high: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600",
      icon: AlertTriangle,
    },
  };

  const { bg, text, icon: Icon } = config[level];

  return (
    <div
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full",
        bg,
        text
      )}
      title={`${level} risk`}
    >
      <Icon className="h-3 w-3" />
    </div>
  );
}

// Utility functions
function calculatePnL(position: Position): { absolute: number; percent: number } {
  const direction = position.side === "long" ? 1 : -1;
  const priceDiff = position.currentPrice - position.entryPrice;
  const absolute = priceDiff * position.quantity * direction;
  const percent = (priceDiff / position.entryPrice) * 100 * direction;

  return { absolute, percent };
}

function calculateRiskLevel(position: Position): "low" | "medium" | "high" {
  const pnl = calculatePnL(position);

  // Risk based on P&L percentage
  if (pnl.percent < -10) return "high";
  if (pnl.percent < -5) return "medium";
  return "low";
}

/**
 * Position Summary Card - Compact view of position metrics
 */
export interface PositionSummaryProps {
  positions: Position[];
  className?: string;
}

export function PositionSummary({ positions, className }: PositionSummaryProps) {
  const t = useTranslations("position");
  const tTrading = useTranslations("trading");
  const metrics = React.useMemo(() => {
    let totalPnL = 0;
    let totalValue = 0;
    let totalMargin = 0;

    positions.forEach((pos) => {
      const pnl = calculatePnL(pos);
      totalPnL += pnl.absolute;
      totalValue += pos.quantity * pos.currentPrice;
      totalMargin += pos.quantity * pos.entryPrice / (pos.leverage || 1);
    });

    return {
      totalPnL,
      totalValue,
      totalMargin,
      positionCount: positions.length,
    };
  }, [positions]);

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-4 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div>
        <div className="text-sm text-muted-foreground">{t("positions")}</div>
        <div className="text-xl font-semibold">{metrics.positionCount}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{t("totalValue")}</div>
        <div className="text-xl font-semibold">
          ${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{t("marginUsed")}</div>
        <div className="text-xl font-semibold">
          ${metrics.totalMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{tTrading("unrealizedPnl")}</div>
        <div
          className={cn(
            "text-xl font-semibold",
            metrics.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
          )}
        >
          {metrics.totalPnL >= 0 ? "+" : ""}$
          {metrics.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
