"use client";

/**
 * Visually Hidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Essential for accessibility compliance.
 */

import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
    >
      {children}
    </Component>
  );
}

// Announce content to screen readers
interface AnnounceProps {
  children: React.ReactNode;
  role?: "status" | "alert" | "log";
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-atomic"?: boolean;
}

export function Announce({
  children,
  role = "status",
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
}: AnnounceProps) {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}
