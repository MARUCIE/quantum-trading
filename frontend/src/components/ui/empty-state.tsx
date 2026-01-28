"use client";

/**
 * Empty State Component
 *
 * Consistent empty state display for tables, lists, and data views.
 * Supports icon, title, description, and action button.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "h-8 w-8",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-lg",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className={cn("text-muted-foreground", sizes.icon)} />
      </div>
      <h3 className={cn("font-medium text-foreground mb-1", sizes.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-sm", sizes.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
