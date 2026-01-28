"use client";

/**
 * Performance Monitor Component
 *
 * Real-time performance monitoring with Web Vitals display.
 * Only visible in development mode or when explicitly enabled.
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Activity, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  target?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showInProduction?: boolean;
}

// Thresholds based on Google's Core Web Vitals (2024)
// Note: FID was replaced by INP in web-vitals v4
const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

function formatValue(name: string, value: number): string {
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === "development",
  position = "bottom-right",
  showInProduction = false,
}: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<number | null>(null);

  // Check if should be visible
  const isVisible =
    enabled && (showInProduction || process.env.NODE_ENV === "development");

  // FPS counter
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const countFps = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(countFps);
    };

    animationId = requestAnimationFrame(countFps);
    return () => cancelAnimationFrame(animationId);
  }, [isOpen, isMinimized]);

  // Memory usage (Chrome only)
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const checkMemory = () => {
      if ("memory" in performance) {
        const memInfo = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
        setMemory(Math.round(memInfo.usedJSHeapSize / 1024 / 1024));
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 2000);
    return () => clearInterval(interval);
  }, [isOpen, isMinimized]);

  // Web Vitals collection
  const reportMetric = useCallback((metric: { name: string; value: number }) => {
    setMetrics((prev) => {
      const existing = prev.findIndex((m) => m.name === metric.name);
      const newMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        target:
          thresholds[metric.name as keyof typeof thresholds]?.good,
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newMetric;
        return updated;
      }
      return [...prev, newMetric];
    });
  }, []);

  // Initialize Web Vitals
  useEffect(() => {
    if (!isVisible) return;

    import("web-vitals").then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
      onCLS(reportMetric);
      onLCP(reportMetric);
      onFCP(reportMetric);
      onTTFB(reportMetric);
      onINP(reportMetric);
    });
  }, [isVisible, reportMetric]);

  if (!isVisible) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const ratingColors = {
    good: "text-green-500",
    "needs-improvement": "text-yellow-500",
    poor: "text-red-500",
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed z-50 shadow-lg",
          positionClasses[position]
        )}
        onClick={() => setIsOpen(true)}
        title="Open Performance Monitor"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-card border rounded-lg shadow-lg overflow-hidden transition-all",
        positionClasses[position],
        isMinimized ? "w-auto" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Performance</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-3">
          {/* Real-time metrics */}
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">FPS:</span>{" "}
              <span
                className={cn(
                  "font-mono",
                  fps >= 55 ? "text-green-500" : fps >= 30 ? "text-yellow-500" : "text-red-500"
                )}
              >
                {fps}
              </span>
            </div>
            {memory !== null && (
              <div>
                <span className="text-muted-foreground">Memory:</span>{" "}
                <span className="font-mono">{memory}MB</span>
              </div>
            )}
          </div>

          {/* Web Vitals */}
          {metrics.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Core Web Vitals
              </p>
              {metrics.map((metric) => (
                <div
                  key={metric.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono", ratingColors[metric.rating])}>
                      {formatValue(metric.name, metric.value)}
                    </span>
                    {metric.target && (
                      <span className="text-muted-foreground/50">
                        /{formatValue(metric.name, metric.target)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {metrics.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Collecting metrics...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
