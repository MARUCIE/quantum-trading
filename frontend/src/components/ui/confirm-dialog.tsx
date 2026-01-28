"use client";

/**
 * Confirm Dialog Component
 *
 * Reusable confirmation dialog for destructive actions.
 */

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Trash2,
  LogOut,
  XCircle,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DialogVariant = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: DialogVariant;
  icon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

const variantConfig: Record<
  DialogVariant,
  { icon: typeof AlertTriangle; color: string; bgColor: string }
> = {
  danger: {
    icon: Trash2,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  info: {
    icon: HelpCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  icon,
  loading = false,
  children,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="rounded-lg border bg-card p-6 shadow-lg">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={cn("rounded-full p-3", config.bgColor)}>
              {icon || <IconComponent className={cn("h-6 w-6", config.color)} />}
            </div>
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold text-center mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              id="confirm-dialog-description"
              className="text-sm text-muted-foreground text-center mb-4"
            >
              {description}
            </p>
          )}

          {/* Custom content */}
          {children && <div className="mb-4">{children}</div>}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading || loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isLoading || loading}
            >
              {(isLoading || loading) && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: DialogVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    variant: "danger",
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description?: string;
    variant?: DialogVariant;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || "danger",
        onConfirm: () => resolve(true),
      });
    });
  };

  const close = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      title={dialogState.title}
      description={dialogState.description}
      variant={dialogState.variant}
      onConfirm={dialogState.onConfirm}
    />
  );

  return { confirm, close, ConfirmDialog: ConfirmDialogComponent };
}

// Pre-built confirmation dialogs
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemName}?`}
      description="This action cannot be undone. This will permanently delete the item and all associated data."
      confirmLabel="Delete"
      variant="danger"
      onConfirm={onConfirm}
    />
  );
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out?"
      description="You'll need to sign in again to access your account."
      confirmLabel="Sign Out"
      variant="warning"
      icon={<LogOut className="h-6 w-6 text-yellow-500" />}
      onConfirm={onConfirm}
    />
  );
}
