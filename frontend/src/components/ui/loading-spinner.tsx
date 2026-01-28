"use client";

/**
 * Loading Spinner Component
 *
 * Consistent loading indicators with multiple variants.
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "bars" | "pulse";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: { icon: "h-4 w-4", text: "text-xs", container: "gap-1.5" },
  md: { icon: "h-6 w-6", text: "text-sm", container: "gap-2" },
  lg: { icon: "h-8 w-8", text: "text-base", container: "gap-2.5" },
  xl: { icon: "h-12 w-12", text: "text-lg", container: "gap-3" },
};

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  label,
  className,
}: LoadingSpinnerProps) {
  const sizes = sizeClasses[size];

  // Spinner variant (default)
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          sizes.container,
          className
        )}
        role="status"
        aria-label={label || "Loading"}
      >
        <Loader2 className={cn("animate-spin text-primary", sizes.icon)} />
        {label && (
          <span className={cn("text-muted-foreground", sizes.text)}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Dots variant
  if (variant === "dots") {
    const dotSize =
      size === "sm"
        ? "h-1.5 w-1.5"
        : size === "md"
          ? "h-2 w-2"
          : size === "lg"
            ? "h-2.5 w-2.5"
            : "h-3 w-3";

    return (
      <div
        className={cn(
          "flex items-center justify-center",
          sizes.container,
          className
        )}
        role="status"
        aria-label={label || "Loading"}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "rounded-full bg-primary animate-bounce",
                dotSize
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        {label && (
          <span className={cn("text-muted-foreground ml-2", sizes.text)}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Bars variant
  if (variant === "bars") {
    const barHeight =
      size === "sm"
        ? "h-3"
        : size === "md"
          ? "h-4"
          : size === "lg"
            ? "h-5"
            : "h-6";

    return (
      <div
        className={cn(
          "flex items-center justify-center",
          sizes.container,
          className
        )}
        role="status"
        aria-label={label || "Loading"}
      >
        <div className="flex gap-0.5 items-end">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn(
                "w-1 bg-primary rounded-full animate-pulse",
                barHeight
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${60 + Math.sin(i * 0.8) * 40}%`,
              }}
            />
          ))}
        </div>
        {label && (
          <span className={cn("text-muted-foreground ml-2", sizes.text)}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Pulse variant
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        sizes.container,
        className
      )}
      role="status"
      aria-label={label || "Loading"}
    >
      <span
        className={cn(
          "rounded-full bg-primary animate-ping",
          sizes.icon
        )}
      />
      {label && (
        <span className={cn("text-muted-foreground", sizes.text)}>
          {label}
        </span>
      )}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({
  label = "Loading...",
  blur = true,
}: {
  label?: string;
  blur?: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80",
        blur && "backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card border shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// Inline loading state for buttons/text
export function LoadingInline({
  label = "Loading...",
  size = "sm",
}: {
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Loader2
        className={cn(
          "animate-spin",
          size === "sm" ? "h-3 w-3" : "h-4 w-4"
        )}
      />
      <span className={cn(size === "sm" ? "text-xs" : "text-sm")}>{label}</span>
    </span>
  );
}
