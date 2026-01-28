"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const trendColor =
    trend === "up"
      ? "text-profit"
      : trend === "down"
        ? "text-loss"
        : "text-muted-foreground";

  return (
    <Card
      className={cn("relative overflow-hidden card-interactive", className)}
      data-testid="stats-card"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground transition-transform group-hover:scale-110" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {change !== undefined && (
          <p className={cn("text-xs tabular-nums", trendColor)}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}% {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
