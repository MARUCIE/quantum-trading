/**
 * React Hooks Library
 *
 * Comprehensive collection of utility hooks for the trading platform.
 */

// Debounce & Throttle
export {
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
} from "./use-debounce";

// Storage
export { useLocalStorage, useSessionStorage } from "./use-local-storage";

// Media Queries & Responsive
export {
  useMediaQuery,
  useBreakpoint,
  useCurrentBreakpoint,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useIsTouchDevice,
  useIsPortrait,
  useIsLandscape,
  useResponsiveValue,
} from "./use-media-query";

// Timers & Intervals
export {
  useInterval,
  useTimeout,
  useCountdown,
  useStopwatch,
  usePolling,
} from "./use-interval";

// Clipboard
export { useClipboard, useClipboardRead } from "./use-clipboard";

// Click Outside
export {
  useClickOutside,
  useClickOutsideMultiple,
  useDismissable,
} from "./use-click-outside";

// Previous Values & Comparison
export {
  usePrevious,
  useHasChanged,
  useDelta,
  useDirection,
  useValueHistory,
  useDerivedValue,
  useTrend,
} from "./use-previous";

// Form Validation
export { useFormValidation } from "./use-form-validation";

// Web Vitals
export { useWebVitals } from "./use-web-vitals";
