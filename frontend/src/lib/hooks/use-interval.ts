"use client";

/**
 * Interval and Timeout Hooks
 *
 * Declarative timers with automatic cleanup.
 * Essential for polling, countdowns, and periodic updates.
 */

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Set up an interval that automatically cleans up
 * @param callback - Function to call on each interval
 * @param delay - Interval in milliseconds (null to pause)
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Set up a timeout that automatically cleans up
 * @param callback - Function to call after timeout
 * @param delay - Timeout in milliseconds (null to cancel)
 */
export function useTimeout(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Countdown timer hook
 * @param initialSeconds - Starting seconds
 * @param autoStart - Start counting immediately (default: true)
 * @returns Timer state and controls
 */
export function useCountdown(
  initialSeconds: number,
  autoStart = true
): {
  seconds: number;
  isRunning: boolean;
  isFinished: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
} {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useInterval(
    () => {
      if (seconds > 0) {
        setSeconds((s) => s - 1);
      } else {
        setIsRunning(false);
      }
    },
    isRunning ? 1000 : null
  );

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true);
    }
  }, [seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  return {
    seconds,
    isRunning,
    isFinished: seconds === 0,
    start,
    pause,
    reset,
  };
}

/**
 * Stopwatch hook
 * @param autoStart - Start counting immediately (default: false)
 * @returns Timer state and controls
 */
export function useStopwatch(autoStart = false): {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: () => number;
  laps: number[];
} {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<number[]>([]);

  useInterval(
    () => {
      setTime((t) => t + 100);
    },
    isRunning ? 100 : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    setLaps((prev) => [...prev, time]);
    return time;
  }, [time]);

  return { time, isRunning, start, pause, reset, lap, laps };
}

/**
 * Polling hook - repeatedly calls a function at specified intervals
 * @param callback - Async function to poll
 * @param interval - Polling interval in milliseconds
 * @param options - Configuration options
 */
export function usePolling<T>(
  callback: () => Promise<T>,
  interval: number,
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
  } = {}
): {
  data: T | null;
  error: Error | null;
  isPolling: boolean;
  refetch: () => Promise<void>;
} {
  const { enabled = true, onSuccess, onError, immediate = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const refetch = useCallback(async () => {
    try {
      const result = await callbackRef.current();
      setData(result);
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (immediate && enabled) {
      refetch();
    }
  }, [immediate, enabled, refetch]);

  // Polling
  useInterval(
    () => {
      refetch();
    },
    enabled && isPolling ? interval : null
  );

  return { data, error, isPolling, refetch };
}
