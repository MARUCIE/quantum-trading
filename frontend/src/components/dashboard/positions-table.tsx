"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/api/types";

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Entry Price</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">P&L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position, index) => (
          <TableRow
            key={position.symbol}
            className="table-row-hover cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TableCell className="font-medium">{position.symbol}</TableCell>
            <TableCell>
              <Badge
                variant={position.side === "long" ? "default" : "secondary"}
                className={position.side === "long" ? "badge-long" : "badge-short"}
              >
                {position.side.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {position.quantity}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatCurrency(position.entryPrice)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatCurrency(position.currentPrice)}
            </TableCell>
            <TableCell className="text-right">
              <div
                className={cn(
                  "font-mono tabular-nums",
                  position.unrealizedPnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {formatCurrency(position.unrealizedPnl)}
                <span className="ml-1 text-xs">
                  ({formatPercent(position.unrealizedPnlPct)})
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
