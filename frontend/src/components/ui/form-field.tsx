"use client";

/**
 * Form Field Component
 *
 * Combines label, input, description, and error message
 * with proper accessibility linking.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";
import { Label } from "./label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormFieldProps extends Omit<InputProps, "id" | "error"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  id,
  label,
  description,
  error,
  success,
  required,
  className,
  ...inputProps
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const successId = success && !error ? `${id}-success` : undefined;

  const ariaDescribedBy = [descriptionId, errorId, successId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <Input
        id={id}
        error={!!error}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        {...inputProps}
      />

      {description && !error && !success && (
        <p
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {success && !error && (
        <p
          id={successId}
          className="flex items-center gap-1.5 text-sm text-profit"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {success}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea Field Component
 */
export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  className?: string;
}

export function TextareaField({
  id,
  label,
  description,
  error,
  success,
  required,
  className,
  ...textareaProps
}: TextareaFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const ariaDescribedBy = [descriptionId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <textarea
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          error
            ? "border-destructive focus-visible:ring-destructive/50"
            : "border-input focus-visible:ring-ring"
        )}
        {...textareaProps}
      />

      {description && !error && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {success && !error && (
        <p className="flex items-center gap-1.5 text-sm text-profit">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {success}
        </p>
      )}
    </div>
  );
}
