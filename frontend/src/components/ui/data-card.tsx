"use client";

/**
 * Data Card Component
 *
 * Consistent card for displaying metrics, stats, and KPIs.
 * Supports trend indicators, sparklines, and various layouts.
 */

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function DataCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  size = "md",
  className,
  onClick,
}: DataCardProps) {
  const sizeClasses = {
    sm: {
      padding: "p-4",
      icon: "h-8 w-8",
      iconContainer: "h-10 w-10",
      title: "text-xs",
      value: "text-xl",
      subtitle: "text-[10px]",
    },
    md: {
      padding: "p-6",
      icon: "h-5 w-5",
      iconContainer: "h-12 w-12",
      title: "text-sm",
      value: "text-2xl",
      subtitle: "text-xs",
    },
    lg: {
      padding: "p-8",
      icon: "h-6 w-6",
      iconContainer: "h-14 w-14",
      title: "text-base",
      value: "text-3xl",
      subtitle: "text-sm",
    },
  };

  const sizes = sizeClasses[size];

  const getTrendIcon = () => {
    if (!trend || trend === "neutral") return Minus;
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-muted-foreground";
    return trend === "up" ? "text-green-500" : "text-red-500";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={sizes.padding}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn("text-muted-foreground font-medium", sizes.title)}>
              {title}
            </p>
            <p className={cn("font-bold tracking-tight", sizes.value)}>
              {value}
            </p>
            {(subtitle || change !== undefined) && (
              <div className="flex items-center gap-2">
                {change !== undefined && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs",
                      change >= 0
                        ? "text-green-500 border-green-500/50"
                        : "text-red-500 border-red-500/50"
                    )}
                  >
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </Badge>
                )}
                {subtitle && (
                  <span className={cn("text-muted-foreground", sizes.subtitle)}>
                    {changeLabel || subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-primary/10",
                sizes.iconContainer
              )}
            >
              <Icon className={cn(sizes.icon, iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
