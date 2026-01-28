"use client";

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors and displays a fallback UI.
 * Also provides an inline error display component.
 */

import { Component, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          title="Something went wrong"
          message={this.state.error?.message || "An unexpected error occurred"}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Inline error display component
interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  error?: Error;
  variant?: "card" | "inline" | "banner";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ErrorDisplay({
  title = "Error",
  message = "Something went wrong",
  onRetry,
  onGoHome,
  showDetails = false,
  error,
  variant = "card",
  size = "md",
  className,
}: ErrorDisplayProps) {
  const sizeClasses = {
    sm: {
      icon: "h-8 w-8",
      title: "text-sm",
      message: "text-xs",
      padding: "p-4",
    },
    md: {
      icon: "h-12 w-12",
      title: "text-base",
      message: "text-sm",
      padding: "p-6",
    },
    lg: {
      icon: "h-16 w-16",
      title: "text-lg",
      message: "text-base",
      padding: "p-8",
    },
  };

  const sizes = sizeClasses[size];

  // Banner variant
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20",
          className
        )}
        role="alert"
      >
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-destructive",
          className
        )}
        role="alert"
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardContent className={cn("flex flex-col items-center text-center", sizes.padding)}>
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertTriangle className={cn("text-destructive", sizes.icon)} />
        </div>
        <h3 className={cn("font-semibold text-foreground mb-1", sizes.title)}>
          {title}
        </h3>
        <p className={cn("text-muted-foreground max-w-md mb-4", sizes.message)}>
          {message}
        </p>

        {showDetails && error && (
          <details className="w-full mb-4 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Show technical details
            </summary>
            <pre className="mt-2 p-3 rounded bg-muted text-xs overflow-auto max-h-32">
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button variant="ghost" onClick={onGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// API/Network error display
export function NetworkError({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="card"
      size="md"
      className={className}
    />
  );
}

// Not found error
export function NotFoundError({
  resource = "page",
  onGoHome,
  className,
}: {
  resource?: string;
  onGoHome?: () => void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      title="Not Found"
      message={`The ${resource} you're looking for doesn't exist or has been moved.`}
      onGoHome={onGoHome}
      variant="card"
      size="md"
      className={className}
    />
  );
}
