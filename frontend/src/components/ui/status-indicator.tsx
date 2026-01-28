"use client";

/**
 * Status Indicator Component
 *
 * Consistent status badges and indicators with dot animations.
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "online"
  | "offline"
  | "pending";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "dot" | "text";
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { color: string; bgColor: string; borderColor: string; label: string }
> = {
  success: {
    color: "text-green-500",
    bgColor: "bg-green-500",
    borderColor: "border-green-500/50",
    label: "Success",
  },
  warning: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500/50",
    label: "Warning",
  },
  error: {
    color: "text-red-500",
    bgColor: "bg-red-500",
    borderColor: "border-red-500/50",
    label: "Error",
  },
  info: {
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500/50",
    label: "Info",
  },
  neutral: {
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground",
    borderColor: "border-muted-foreground/50",
    label: "Neutral",
  },
  online: {
    color: "text-green-500",
    bgColor: "bg-green-500",
    borderColor: "border-green-500/50",
    label: "Online",
  },
  offline: {
    color: "text-gray-500",
    bgColor: "bg-gray-500",
    borderColor: "border-gray-500/50",
    label: "Offline",
  },
  pending: {
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    borderColor: "border-amber-500/50",
    label: "Pending",
  },
};

const sizeConfig = {
  sm: { dot: "h-1.5 w-1.5", text: "text-xs", badge: "text-xs h-5" },
  md: { dot: "h-2 w-2", text: "text-sm", badge: "text-sm h-6" },
  lg: { dot: "h-2.5 w-2.5", text: "text-base", badge: "text-base h-7" },
};

export function StatusIndicator({
  status,
  label,
  showDot = true,
  pulse = false,
  size = "md",
  variant = "badge",
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const displayLabel = label || config.label;

  // Dot only variant
  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          className
        )}
        title={displayLabel}
      >
        <span
          className={cn(
            "rounded-full",
            config.bgColor,
            sizes.dot,
            pulse && "animate-pulse"
          )}
        />
      </span>
    );
  }

  // Text with dot variant
  if (variant === "text") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          config.color,
          sizes.text,
          className
        )}
      >
        {showDot && (
          <span
            className={cn(
              "rounded-full",
              config.bgColor,
              sizes.dot,
              pulse && "animate-pulse"
            )}
          />
        )}
        {displayLabel}
      </span>
    );
  }

  // Badge variant (default)
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        config.color,
        config.borderColor,
        sizes.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full mr-1.5",
            config.bgColor,
            sizes.dot,
            pulse && "animate-pulse"
          )}
        />
      )}
      {displayLabel}
    </Badge>
  );
}

// Convenience components for common statuses
export function OnlineStatus(props: Omit<StatusIndicatorProps, "status">) {
  return <StatusIndicator status="online" pulse {...props} />;
}

export function OfflineStatus(props: Omit<StatusIndicatorProps, "status">) {
  return <StatusIndicator status="offline" {...props} />;
}

export function LoadingStatus(props: Omit<StatusIndicatorProps, "status">) {
  return <StatusIndicator status="pending" pulse label="Loading..." {...props} />;
}
