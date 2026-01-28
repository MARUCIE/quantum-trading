"use client";

/**
 * Clipboard Hook
 *
 * Copy text to clipboard with feedback.
 * Essential for copy buttons and sharing functionality.
 */

import { useState, useCallback } from "react";

interface UseClipboardOptions {
  /**
   * Duration to show "copied" state in milliseconds
   * @default 2000
   */
  timeout?: number;
  /**
   * Callback when copy succeeds
   */
  onSuccess?: (text: string) => void;
  /**
   * Callback when copy fails
   */
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  /**
   * Copy text to clipboard
   */
  copy: (text: string) => Promise<boolean>;
  /**
   * Whether text was recently copied
   */
  copied: boolean;
  /**
   * Last copied text
   */
  value: string | null;
  /**
   * Error if copy failed
   */
  error: Error | null;
  /**
   * Reset the copied state
   */
  reset: () => void;
}

/**
 * Copy text to clipboard with feedback state
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;

  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Check if clipboard API is available
      if (!navigator?.clipboard) {
        const error = new Error("Clipboard API not available");
        setError(error);
        onError?.(error);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setValue(text);
        setCopied(true);
        setError(null);
        onSuccess?.(text);

        // Reset copied state after timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to copy");
        setError(error);
        setCopied(false);
        onError?.(error);
        return false;
      }
    },
    [timeout, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setValue(null);
    setError(null);
  }, []);

  return { copy, copied, value, error, reset };
}

/**
 * Read text from clipboard
 */
export function useClipboardRead(): {
  read: () => Promise<string | null>;
  value: string | null;
  error: Error | null;
} {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      setError(new Error("Clipboard API not available"));
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      setError(null);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to read clipboard");
      setError(error);
      return null;
    }
  }, []);

  return { read, value, error };
}
