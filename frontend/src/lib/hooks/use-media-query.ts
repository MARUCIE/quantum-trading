"use client";

/**
 * Media Query Hook
 *
 * React to viewport and device changes with CSS media queries.
 * Essential for responsive design and conditional rendering.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Subscribe to a CSS media query
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const getMatches = useCallback((mediaQuery: string): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", listener);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", listener);
  }, [query, getMatches]);

  return matches;
}

// Tailwind CSS breakpoint values
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Check if viewport is at or above a Tailwind breakpoint
 * @param breakpoint - Tailwind breakpoint name
 * @returns Whether viewport matches or exceeds the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

/**
 * Get the current active breakpoint
 * @returns Current Tailwind breakpoint name
 */
export function useCurrentBreakpoint(): Breakpoint | "xs" {
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const md = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const lg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const xl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`);

  if (xxl) return "2xl";
  if (xl) return "xl";
  if (lg) return "lg";
  if (md) return "md";
  if (sm) return "sm";
  return "xs";
}

/**
 * Check if device prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

/**
 * Check if device prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Check if device is touch-capable
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}

/**
 * Check if viewport is in portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery("(orientation: portrait)");
}

/**
 * Check if viewport is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery("(orientation: landscape)");
}

/**
 * Responsive value helper - returns different values based on breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
}): T | undefined {
  const breakpoint = useCurrentBreakpoint();

  // Find the largest defined breakpoint that is <= current breakpoint
  const breakpointOrder: (Breakpoint | "xs")[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
}
