"use client";

/**
 * Toast Notification Component
 *
 * Lightweight toast notifications for real-time events.
 */

import * as React from "react";
import { createContext, useContext, useCallback, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast styling by type
const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  },
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const style = toastStyles[toast.type];

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onClose, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300",
        style.bg
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{style.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Convenience functions
export function toast(options: Omit<Toast, "id">) {
  // This is a placeholder - the actual implementation uses useToast hook
  console.warn("Use useToast() hook instead of toast() function");
}

// Export hook for convenience
export { ToastContext };
