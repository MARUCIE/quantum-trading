/**
 * Input Validation Middleware
 *
 * Schema-based validation for API inputs.
 */

export type ValidationRule =
  | { type: 'required' }
  | { type: 'string'; minLength?: number; maxLength?: number; pattern?: RegExp }
  | { type: 'number'; min?: number; max?: number; integer?: boolean }
  | { type: 'boolean' }
  | { type: 'enum'; values: (string | number)[] }
  | { type: 'array'; items?: ValidationRule; minItems?: number; maxItems?: number }
  | { type: 'object'; properties?: Record<string, ValidationSchema> };

export interface ValidationSchema {
  rules: ValidationRule[];
  optional?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a value against a schema
 */
export function validate(
  value: unknown,
  schema: ValidationSchema,
  path: string = ''
): ValidationResult {
  const errors: string[] = [];

  // Check if value is present
  if (value === undefined || value === null) {
    if (!schema.optional) {
      errors.push(`${path || 'Value'} is required`);
    }
    return { valid: errors.length === 0, errors };
  }

  // Apply each rule
  for (const rule of schema.rules) {
    const ruleErrors = validateRule(value, rule, path);
    errors.push(...ruleErrors);
  }

  return { valid: errors.length === 0, errors };
}

function validateRule(value: unknown, rule: ValidationRule, path: string): string[] {
  const errors: string[] = [];
  const fieldName = path || 'Value';

  switch (rule.type) {
    case 'required':
      if (value === undefined || value === null || value === '') {
        errors.push(`${fieldName} is required`);
      }
      break;

    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
      } else {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(`${fieldName} must be at most ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${fieldName} has invalid format`);
        }
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a number`);
      } else {
        if (rule.integer && !Number.isInteger(value)) {
          errors.push(`${fieldName} must be an integer`);
        }
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${fieldName} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${fieldName} must be at most ${rule.max}`);
        }
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} must be a boolean`);
      }
      break;

    case 'enum':
      if (!rule.values.includes(value as string | number)) {
        errors.push(`${fieldName} must be one of: ${rule.values.join(', ')}`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`);
      } else {
        if (rule.minItems !== undefined && value.length < rule.minItems) {
          errors.push(`${fieldName} must have at least ${rule.minItems} items`);
        }
        if (rule.maxItems !== undefined && value.length > rule.maxItems) {
          errors.push(`${fieldName} must have at most ${rule.maxItems} items`);
        }
        if (rule.items) {
          value.forEach((item, index) => {
            const itemResult = validateRule(item, rule.items!, `${fieldName}[${index}]`);
            errors.push(...itemResult);
          });
        }
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${fieldName} must be an object`);
      } else if (rule.properties) {
        for (const [key, propSchema] of Object.entries(rule.properties)) {
          const propValue = (value as Record<string, unknown>)[key];
          const propResult = validate(propValue, propSchema, `${fieldName}.${key}`);
          errors.push(...propResult.errors);
        }
      }
      break;
  }

  return errors;
}

/**
 * Validate object against a schema map
 */
export function validateObject(
  obj: Record<string, unknown>,
  schemas: Record<string, ValidationSchema>
): ValidationResult {
  const errors: string[] = [];

  for (const [key, schema] of Object.entries(schemas)) {
    const result = validate(obj[key], schema, key);
    errors.push(...result.errors);
  }

  return { valid: errors.length === 0, errors };
}

// Common validation schemas
export const CommonSchemas = {
  symbol: {
    rules: [
      { type: 'required' as const },
      { type: 'string' as const, minLength: 1, maxLength: 20, pattern: /^[A-Z0-9/]+$/ },
    ],
  },
  quantity: {
    rules: [
      { type: 'required' as const },
      { type: 'number' as const, min: 0 },
    ],
  },
  price: {
    rules: [
      { type: 'number' as const, min: 0 },
    ],
    optional: true,
  },
  side: {
    rules: [
      { type: 'required' as const },
      { type: 'enum' as const, values: ['buy', 'sell'] },
    ],
  },
  orderType: {
    rules: [
      { type: 'required' as const },
      { type: 'enum' as const, values: ['market', 'limit', 'stop'] },
    ],
  },
  strategyStatus: {
    rules: [
      { type: 'required' as const },
      { type: 'enum' as const, values: ['active', 'paused', 'stopped'] },
    ],
  },
  interval: {
    rules: [
      { type: 'enum' as const, values: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'] },
    ],
    optional: true,
  },
  limit: {
    rules: [
      { type: 'number' as const, min: 1, max: 1000, integer: true },
    ],
    optional: true,
  },
};

/**
 * Sanitize string input (prevent injection)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize query parameters
 */
export function sanitizeQueryParams(params: URLSearchParams): Map<string, string> {
  const sanitized = new Map<string, string>();

  for (const [key, value] of params) {
    // Sanitize key and value
    const cleanKey = sanitizeString(key);
    const cleanValue = sanitizeString(value);

    // Only include if both are valid
    if (cleanKey && cleanKey === key) {
      sanitized.set(cleanKey, cleanValue);
    }
  }

  return sanitized;
}
