"use client";

/**
 * Keyboard Shortcut Components
 *
 * Display and handle keyboard shortcuts consistently.
 */

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Keyboard key display
interface KeyProps {
  children: string;
  className?: string;
}

export function Key({ children, className }: KeyProps) {
  // Map common key names to display symbols
  const keyMap: Record<string, string> = {
    cmd: "⌘",
    command: "⌘",
    ctrl: "⌃",
    control: "⌃",
    alt: "⌥",
    option: "⌥",
    shift: "⇧",
    enter: "↵",
    return: "↵",
    backspace: "⌫",
    delete: "⌦",
    escape: "⎋",
    esc: "⎋",
    tab: "⇥",
    space: "␣",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
  };

  const displayKey = keyMap[children.toLowerCase()] || children.toUpperCase();

  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
    >
      {displayKey}
    </kbd>
  );
}

// Keyboard shortcut display (e.g., ⌘+K)
interface ShortcutProps {
  keys: string[];
  className?: string;
}

export function Shortcut({ keys, className }: ShortcutProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <Key key={`${key}-${index}`}>{key}</Key>
      ))}
    </span>
  );
}

// Hook for registering keyboard shortcuts
type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  options: UseKeyboardShortcutOptions,
  handler: KeyHandler
) {
  const {
    key,
    ctrlKey = false,
    metaKey = false,
    altKey = false,
    shiftKey = false,
    preventDefault = true,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const modifiersMatch =
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey;

      if (keyMatches && modifiersMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [key, ctrlKey, metaKey, altKey, shiftKey, preventDefault, enabled, handler]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Multi-shortcut hook
interface ShortcutConfig {
  keys: UseKeyboardShortcutOptions;
  handler: KeyHandler;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handlers: Array<(event: KeyboardEvent) => void> = [];

    shortcuts.forEach(({ keys, handler }) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const keyMatches = event.key.toLowerCase() === keys.key.toLowerCase();
        const modifiersMatch =
          event.ctrlKey === (keys.ctrlKey ?? false) &&
          event.metaKey === (keys.metaKey ?? false) &&
          event.altKey === (keys.altKey ?? false) &&
          event.shiftKey === (keys.shiftKey ?? false);

        if (keyMatches && modifiersMatch) {
          if (keys.preventDefault !== false) {
            event.preventDefault();
          }
          handler(event);
        }
      };

      handlers.push(handleKeyDown);
      window.addEventListener("keydown", handleKeyDown);
    });

    return () => {
      handlers.forEach((handler) => {
        window.removeEventListener("keydown", handler);
      });
    };
  }, [shortcuts]);
}

// Shortcut help overlay
interface ShortcutHelpItem {
  keys: string[];
  description: string;
  category?: string;
}

interface ShortcutHelpProps {
  shortcuts: ShortcutHelpItem[];
  open: boolean;
  onClose: () => void;
}

export function ShortcutHelp({ shortcuts, open, onClose }: ShortcutHelpProps) {
  // Close on Escape
  useKeyboardShortcut({ key: "Escape" }, onClose, );

  if (!open) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutHelpItem[]>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <Shortcut keys={["Esc"]} />
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{item.description}</span>
                    <Shortcut keys={item.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
