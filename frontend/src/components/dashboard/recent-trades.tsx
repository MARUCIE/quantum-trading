"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecentTrade } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

interface RecentTradesProps {
  trades: RecentTrade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "w-12 justify-center",
                trade.side === "buy" ? "badge-buy-outline" : "badge-sell-outline"
              )}
            >
              {trade.side.toUpperCase()}
            </Badge>
            <div>
              <p className="font-medium">{trade.symbol}</p>
              <p className="text-xs text-muted-foreground">{trade.strategy}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm">
              {trade.quantity} @ {formatCurrency(trade.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(trade.timestamp), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
