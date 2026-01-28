"use client";

/**
 * Progress Steps Component
 *
 * Multi-step progress indicator for wizards and forms.
 */

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  onStepClick,
  variant = "horizontal",
  size = "md",
  className,
}: ProgressStepsProps) {
  const sizeClasses = {
    sm: {
      circle: "h-6 w-6",
      icon: "h-3 w-3",
      text: "text-xs",
      description: "text-[10px]",
      connector: variant === "horizontal" ? "h-0.5" : "w-0.5",
    },
    md: {
      circle: "h-8 w-8",
      icon: "h-4 w-4",
      text: "text-sm",
      description: "text-xs",
      connector: variant === "horizontal" ? "h-0.5" : "w-0.5",
    },
    lg: {
      circle: "h-10 w-10",
      icon: "h-5 w-5",
      text: "text-base",
      description: "text-sm",
      connector: variant === "horizontal" ? "h-1" : "w-1",
    },
  };

  const sizes = sizeClasses[size];

  const getStepStatus = (index: number): "completed" | "current" | "upcoming" => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col", className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              {/* Circle and connector */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick || status === "upcoming"}
                  className={cn(
                    "rounded-full flex items-center justify-center font-medium transition-all",
                    sizes.circle,
                    status === "completed" && "bg-primary text-primary-foreground",
                    status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    status === "upcoming" && "bg-muted text-muted-foreground",
                    onStepClick && status !== "upcoming" && "cursor-pointer hover:ring-2 hover:ring-primary/50"
                  )}
                >
                  {status === "completed" ? (
                    <Check className={sizes.icon} />
                  ) : (
                    <span className={sizes.text}>{index + 1}</span>
                  )}
                </button>
                {!isLast && (
                  <div
                    className={cn(
                      "flex-1 min-h-8 my-1",
                      sizes.connector,
                      status === "completed" ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>

              {/* Label and description */}
              <div className="ml-4 pb-8">
                <p
                  className={cn(
                    "font-medium",
                    sizes.text,
                    status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className={cn("text-muted-foreground mt-0.5", sizes.description)}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || status === "upcoming"}
                className={cn(
                  "rounded-full flex items-center justify-center font-medium transition-all",
                  sizes.circle,
                  status === "completed" && "bg-primary text-primary-foreground",
                  status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  status === "upcoming" && "bg-muted text-muted-foreground",
                  onStepClick && status !== "upcoming" && "cursor-pointer hover:ring-2 hover:ring-primary/50"
                )}
              >
                {status === "completed" ? (
                  <Check className={sizes.icon} />
                ) : (
                  <span className={sizes.text}>{index + 1}</span>
                )}
              </button>
              <p
                className={cn(
                  "mt-2 text-center whitespace-nowrap",
                  sizes.text,
                  status === "upcoming" && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 mx-4",
                  sizes.connector,
                  status === "completed" ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simple progress bar variant
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
