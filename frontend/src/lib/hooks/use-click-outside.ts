"use client";

/**
 * Click Outside Hook
 *
 * Detect clicks outside of a referenced element.
 * Essential for dropdowns, modals, and popovers.
 */

import { useEffect, useRef, useCallback, type RefObject } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Detect clicks outside of a referenced element
 * @param handler - Callback when click outside is detected
 * @param enabled - Whether the listener is active (default: true)
 * @returns Ref to attach to the target element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  enabled = true
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const handlerRef = useRef<Handler>(handler);

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [enabled]);

  return ref;
}

/**
 * Detect clicks outside of multiple elements
 * @param refs - Array of refs to consider as "inside"
 * @param handler - Callback when click outside is detected
 * @param enabled - Whether the listener is active
 */
export function useClickOutsideMultiple(
  refs: RefObject<HTMLElement>[],
  handler: Handler,
  enabled = true
): void {
  const handlerRef = useRef<Handler>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.some((ref) => {
        const el = ref.current;
        return el && el.contains(event.target as Node);
      });

      if (!isInside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, enabled]);
}

/**
 * Hook for dismissable UI elements (combines click outside + escape key)
 * @param onDismiss - Callback when dismissed
 * @param enabled - Whether listeners are active
 * @returns Ref to attach to the target element
 */
export function useDismissable<T extends HTMLElement = HTMLElement>(
  onDismiss: () => void,
  enabled = true
): RefObject<T | null> {
  const ref = useClickOutside<T>(onDismiss, enabled);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  // Escape key handler
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissRef.current();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [enabled]);

  return ref;
}
