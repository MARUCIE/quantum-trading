"use client";

/**
 * Form Validation Hook
 *
 * Lightweight form validation without external dependencies.
 * Provides field-level and form-level validation.
 */

import { useState, useCallback, useMemo } from "react";

// Common validation rules
export type ValidationRule<T = string> =
  | { type: "required"; message?: string }
  | { type: "minLength"; value: number; message?: string }
  | { type: "maxLength"; value: number; message?: string }
  | { type: "pattern"; value: RegExp; message?: string }
  | { type: "email"; message?: string }
  | { type: "min"; value: number; message?: string }
  | { type: "max"; value: number; message?: string }
  | { type: "custom"; validate: (value: T) => string | undefined };

export interface FieldConfig<T = string> {
  initialValue: T;
  rules?: ValidationRule<T>[];
}

export interface FormConfig {
  [key: string]: FieldConfig;
}

export interface FieldState<T = string> {
  value: T;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
}

export interface FormState {
  [key: string]: FieldState;
}

// Built-in validators
const validators = {
  required: (value: unknown, message?: string): string | undefined => {
    if (value === undefined || value === null || value === "") {
      return message || "This field is required";
    }
    return undefined;
  },

  minLength: (
    value: string,
    min: number,
    message?: string
  ): string | undefined => {
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (
    value: string,
    max: number,
    message?: string
  ): string | undefined => {
    if (value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return undefined;
  },

  pattern: (
    value: string,
    pattern: RegExp,
    message?: string
  ): string | undefined => {
    if (!pattern.test(value)) {
      return message || "Invalid format";
    }
    return undefined;
  },

  email: (value: string, message?: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message || "Invalid email address";
    }
    return undefined;
  },

  min: (value: number, min: number, message?: string): string | undefined => {
    if (value < min) {
      return message || `Must be at least ${min}`;
    }
    return undefined;
  },

  max: (value: number, max: number, message?: string): string | undefined => {
    if (value > max) {
      return message || `Must be no more than ${max}`;
    }
    return undefined;
  },
};

function validateField<T>(value: T, rules?: ValidationRule<T>[]): string | undefined {
  if (!rules) return undefined;

  for (const rule of rules) {
    let error: string | undefined;

    switch (rule.type) {
      case "required":
        error = validators.required(value, rule.message);
        break;
      case "minLength":
        error = validators.minLength(String(value), rule.value, rule.message);
        break;
      case "maxLength":
        error = validators.maxLength(String(value), rule.value, rule.message);
        break;
      case "pattern":
        error = validators.pattern(String(value), rule.value, rule.message);
        break;
      case "email":
        error = validators.email(String(value), rule.message);
        break;
      case "min":
        error = validators.min(Number(value), rule.value, rule.message);
        break;
      case "max":
        error = validators.max(Number(value), rule.value, rule.message);
        break;
      case "custom":
        error = rule.validate(value);
        break;
    }

    if (error) return error;
  }

  return undefined;
}

export function useFormValidation<T extends FormConfig>(config: T) {
  // Initialize state from config
  const initialState = useMemo(() => {
    const state: FormState = {};
    for (const [key, field] of Object.entries(config)) {
      state[key] = {
        value: field.initialValue,
        error: undefined,
        touched: false,
        dirty: false,
      };
    }
    return state;
  }, [config]);

  const [fields, setFields] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get field value
  const getValue = useCallback(
    <K extends keyof T>(name: K): T[K]["initialValue"] => {
      return fields[name as string]?.value;
    },
    [fields]
  );

  // Get field error
  const getError = useCallback(
    (name: keyof T): string | undefined => {
      return fields[name as string]?.error;
    },
    [fields]
  );

  // Check if field is touched
  const isTouched = useCallback(
    (name: keyof T): boolean => {
      return fields[name as string]?.touched || false;
    },
    [fields]
  );

  // Set field value
  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]["initialValue"]) => {
      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name as string],
          value,
          dirty: value !== config[name as string].initialValue,
        },
      }));
    },
    [config]
  );

  // Validate single field
  const validateSingleField = useCallback(
    (name: keyof T): string | undefined => {
      const field = fields[name as string];
      const fieldConfig = config[name as string];
      return validateField(field.value, fieldConfig.rules);
    },
    [fields, config]
  );

  // Touch field (mark as interacted)
  const touchField = useCallback((name: keyof T) => {
    setFields((prev) => ({
      ...prev,
      [name]: {
        ...prev[name as string],
        touched: true,
      },
    }));
  }, []);

  // Blur handler - validate on blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      const error = validateSingleField(name);
      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name as string],
          touched: true,
          error,
        },
      }));
    },
    [validateSingleField]
  );

  // Change handler
  const handleChange = useCallback(
    <K extends keyof T>(
      name: K,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value = e.target.value as T[K]["initialValue"];
      setValue(name, value);

      // Clear error on change if field was touched
      if (fields[name as string]?.touched) {
        const error = validateField(value, config[name as string].rules);
        setFields((prev) => ({
          ...prev,
          [name]: {
            ...prev[name as string],
            value,
            dirty: value !== config[name as string].initialValue,
            error,
          },
        }));
      }
    },
    [setValue, fields, config]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    for (const [name, fieldConfig] of Object.entries(config)) {
      const error = validateField(fields[name].value, fieldConfig.rules);
      newFields[name] = {
        ...newFields[name],
        touched: true,
        error,
      };
      if (error) isValid = false;
    }

    setFields(newFields);
    return isValid;
  }, [fields, config]);

  // Submit handler
  const handleSubmit = useCallback(
    (onSubmit: (values: { [K in keyof T]: T[K]["initialValue"] }) => Promise<void> | void) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;

        setIsSubmitting(true);
        try {
          const values = {} as { [K in keyof T]: T[K]["initialValue"] };
          for (const key of Object.keys(config)) {
            values[key as keyof T] = fields[key].value;
          }
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [validateAll, fields, config]
  );

  // Reset form
  const reset = useCallback(() => {
    setFields(initialState);
  }, [initialState]);

  // Check if form is valid
  const isValid = useMemo(() => {
    for (const [name, fieldConfig] of Object.entries(config)) {
      const error = validateField(fields[name].value, fieldConfig.rules);
      if (error) return false;
    }
    return true;
  }, [fields, config]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return Object.values(fields).some((field) => field.dirty);
  }, [fields]);

  return {
    fields,
    getValue,
    getError,
    isTouched,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset,
    isValid,
    isDirty,
    isSubmitting,
  };
}
