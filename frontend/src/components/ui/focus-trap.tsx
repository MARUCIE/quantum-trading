"use client";

/**
 * Focus Trap Component
 *
 * Traps focus within a container for modals, dialogs, and dropdowns.
 * Supports keyboard navigation and escape handling.
 */

import { useRef, useEffect, useCallback, type ReactNode } from "react";

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  onEscape?: () => void;
  initialFocus?: "first" | "last" | string;
  restoreFocus?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  onEscape,
  initialFocus = "first",
  restoreFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]:not([tabindex="-1"])',
    ].join(", ");

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      // Check if element is visible
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }, []);

  // Handle Tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!active) return;

      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tab on first element -> move to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> move to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, onEscape, getFocusableElements]
  );

  // Set initial focus
  useEffect(() => {
    if (!active) return;

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    // Determine which element to focus
    let elementToFocus: HTMLElement | null = null;

    if (initialFocus === "first") {
      elementToFocus = focusableElements[0];
    } else if (initialFocus === "last") {
      elementToFocus = focusableElements[focusableElements.length - 1];
    } else {
      // Try to find element by selector
      elementToFocus = containerRef.current?.querySelector(initialFocus) || null;
      if (!elementToFocus) {
        elementToFocus = focusableElements[0];
      }
    }

    // Focus after a brief delay to ensure DOM is ready
    const timer = setTimeout(() => {
      elementToFocus?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [active, initialFocus, getFocusableElements]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Add event listener
  useEffect(() => {
    if (!active) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, handleKeyDown]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Skip to content link
export function SkipToContent({
  href = "#main-content",
  children = "Skip to main content",
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      {children}
    </a>
  );
}
