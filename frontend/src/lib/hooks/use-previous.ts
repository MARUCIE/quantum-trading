"use client";

/**
 * Previous Value Hooks
 *
 * Track previous values for comparison and animations.
 * Essential for detecting changes and computing deltas.
 */

import { useRef, useEffect, useState, useMemo } from "react";

/**
 * Get the previous value of a state
 * @param value - Current value
 * @returns Previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Track if a value has changed
 * @param value - Value to track
 * @returns Whether the value changed since last render
 */
export function useHasChanged<T>(value: T): boolean {
  const previous = usePrevious(value);
  return previous !== value;
}

/**
 * Get the delta between current and previous numeric values
 * @param value - Current numeric value
 * @returns Delta (current - previous), or 0 on first render
 */
export function useDelta(value: number): number {
  const previous = usePrevious(value);
  return previous !== undefined ? value - previous : 0;
}

/**
 * Track the direction of change for a numeric value
 * @param value - Current numeric value
 * @returns "up" | "down" | "unchanged"
 */
export function useDirection(value: number): "up" | "down" | "unchanged" {
  const delta = useDelta(value);

  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "unchanged";
}

/**
 * Track value history
 * @param value - Value to track
 * @param maxLength - Maximum history length (default: 10)
 * @returns Array of historical values (newest first)
 */
export function useValueHistory<T>(value: T, maxLength = 10): T[] {
  const [history, setHistory] = useState<T[]>([value]);

  useEffect(() => {
    setHistory((prev) => {
      // Don't add if value hasn't changed
      if (prev[0] === value) return prev;

      const newHistory = [value, ...prev];
      return newHistory.slice(0, maxLength);
    });
  }, [value, maxLength]);

  return history;
}

/**
 * Compute derived value only when dependencies change
 * Similar to useMemo but tracks if the result changed
 */
export function useDerivedValue<T>(
  compute: () => T,
  deps: React.DependencyList
): { value: T; changed: boolean } {
  const value = useMemo(compute, deps);
  const changed = useHasChanged(value);

  return { value, changed };
}

/**
 * Track the trend of a numeric value over multiple changes
 * @param value - Current numeric value
 * @param sampleSize - Number of samples to consider (default: 5)
 * @returns Trend analysis
 */
export function useTrend(
  value: number,
  sampleSize = 5
): {
  trend: "bullish" | "bearish" | "neutral";
  strength: number; // 0-1
  average: number;
  min: number;
  max: number;
} {
  const history = useValueHistory(value, sampleSize);

  return useMemo(() => {
    if (history.length < 2) {
      return {
        trend: "neutral" as const,
        strength: 0,
        average: value,
        min: value,
        max: value,
      };
    }

    const min = Math.min(...history);
    const max = Math.max(...history);
    const average = history.reduce((a, b) => a + b, 0) / history.length;

    // Calculate trend based on recent changes
    let upMoves = 0;
    let downMoves = 0;

    for (let i = 0; i < history.length - 1; i++) {
      if (history[i] > history[i + 1]) upMoves++;
      else if (history[i] < history[i + 1]) downMoves++;
    }

    const totalMoves = upMoves + downMoves;
    const strength = totalMoves > 0 ? Math.abs(upMoves - downMoves) / totalMoves : 0;

    let trend: "bullish" | "bearish" | "neutral";
    if (upMoves > downMoves) trend = "bullish";
    else if (downMoves > upMoves) trend = "bearish";
    else trend = "neutral";

    return { trend, strength, average, min, max };
  }, [history, value]);
}
