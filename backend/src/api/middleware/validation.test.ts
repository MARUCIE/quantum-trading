/**
 * Validation Middleware Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validate,
  validateObject,
  sanitizeString,
  sanitizeQueryParams,
  CommonSchemas,
} from './validation';

describe('validate', () => {
  describe('required rule', () => {
    const schema = { rules: [{ type: 'required' as const }] };

    it('fails for undefined value', () => {
      const result = validate(undefined, schema, 'field');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('field is required');
    });

    it('fails for null value', () => {
      const result = validate(null, schema, 'field');
      expect(result.valid).toBe(false);
    });

    it('passes for any defined value', () => {
      expect(validate('test', schema, 'field').valid).toBe(true);
      expect(validate(0, schema, 'field').valid).toBe(true);
      expect(validate(false, schema, 'field').valid).toBe(true);
    });
  });

  describe('string rule', () => {
    it('fails for non-string value', () => {
      const schema = { rules: [{ type: 'string' as const }] };
      const result = validate(123, schema, 'field');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('field must be a string');
    });

    it('validates minLength', () => {
      const schema = { rules: [{ type: 'string' as const, minLength: 3 }] };
      expect(validate('ab', schema, 'field').valid).toBe(false);
      expect(validate('abc', schema, 'field').valid).toBe(true);
    });

    it('validates maxLength', () => {
      const schema = { rules: [{ type: 'string' as const, maxLength: 5 }] };
      expect(validate('abcdef', schema, 'field').valid).toBe(false);
      expect(validate('abcde', schema, 'field').valid).toBe(true);
    });

    it('validates pattern', () => {
      const schema = { rules: [{ type: 'string' as const, pattern: /^[A-Z]+$/ }] };
      expect(validate('abc', schema, 'field').valid).toBe(false);
      expect(validate('ABC', schema, 'field').valid).toBe(true);
    });
  });

  describe('number rule', () => {
    it('fails for non-number value', () => {
      const schema = { rules: [{ type: 'number' as const }] };
      expect(validate('123', schema, 'field').valid).toBe(false);
      expect(validate(NaN, schema, 'field').valid).toBe(false);
    });

    it('validates min', () => {
      const schema = { rules: [{ type: 'number' as const, min: 10 }] };
      expect(validate(5, schema, 'field').valid).toBe(false);
      expect(validate(10, schema, 'field').valid).toBe(true);
    });

    it('validates max', () => {
      const schema = { rules: [{ type: 'number' as const, max: 100 }] };
      expect(validate(150, schema, 'field').valid).toBe(false);
      expect(validate(100, schema, 'field').valid).toBe(true);
    });

    it('validates integer', () => {
      const schema = { rules: [{ type: 'number' as const, integer: true }] };
      expect(validate(5.5, schema, 'field').valid).toBe(false);
      expect(validate(5, schema, 'field').valid).toBe(true);
    });
  });

  describe('boolean rule', () => {
    it('fails for non-boolean value', () => {
      const schema = { rules: [{ type: 'boolean' as const }] };
      expect(validate(1, schema, 'field').valid).toBe(false);
      expect(validate('true', schema, 'field').valid).toBe(false);
    });

    it('passes for boolean values', () => {
      const schema = { rules: [{ type: 'boolean' as const }] };
      expect(validate(true, schema, 'field').valid).toBe(true);
      expect(validate(false, schema, 'field').valid).toBe(true);
    });
  });

  describe('enum rule', () => {
    const schema = {
      rules: [{ type: 'enum' as const, values: ['buy', 'sell'] }],
    };

    it('fails for value not in enum', () => {
      const result = validate('hold', schema, 'side');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('side must be one of: buy, sell');
    });

    it('passes for value in enum', () => {
      expect(validate('buy', schema, 'side').valid).toBe(true);
      expect(validate('sell', schema, 'side').valid).toBe(true);
    });
  });

  describe('array rule', () => {
    it('fails for non-array value', () => {
      const schema = { rules: [{ type: 'array' as const }] };
      expect(validate('not-array', schema, 'field').valid).toBe(false);
    });

    it('validates minItems', () => {
      const schema = { rules: [{ type: 'array' as const, minItems: 2 }] };
      expect(validate([1], schema, 'field').valid).toBe(false);
      expect(validate([1, 2], schema, 'field').valid).toBe(true);
    });

    it('validates maxItems', () => {
      const schema = { rules: [{ type: 'array' as const, maxItems: 3 }] };
      expect(validate([1, 2, 3, 4], schema, 'field').valid).toBe(false);
      expect(validate([1, 2, 3], schema, 'field').valid).toBe(true);
    });

    it('validates items', () => {
      const schema = {
        rules: [{ type: 'array' as const, items: { type: 'number' as const } }],
      };
      expect(validate([1, 'two', 3], schema, 'field').valid).toBe(false);
      expect(validate([1, 2, 3], schema, 'field').valid).toBe(true);
    });
  });

  describe('optional values', () => {
    it('passes for undefined when optional', () => {
      const schema = { rules: [{ type: 'string' as const }], optional: true };
      expect(validate(undefined, schema, 'field').valid).toBe(true);
    });

    it('fails for undefined when not optional', () => {
      const schema = { rules: [{ type: 'string' as const }] };
      expect(validate(undefined, schema, 'field').valid).toBe(false);
    });
  });
});

describe('validateObject', () => {
  it('validates multiple fields', () => {
    const schemas = {
      name: { rules: [{ type: 'required' as const }, { type: 'string' as const }] },
      age: { rules: [{ type: 'number' as const, min: 0 }] },
    };

    const validResult = validateObject({ name: 'John', age: 25 }, schemas);
    expect(validResult.valid).toBe(true);

    const invalidResult = validateObject({ name: '', age: -5 }, schemas);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});

describe('sanitizeString', () => {
  it('removes angle brackets', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes event handlers', () => {
    expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
    expect(sanitizeString('onmouseover=hack()')).toBe('hack()');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('preserves safe content', () => {
    expect(sanitizeString('Hello World 123!')).toBe('Hello World 123!');
  });
});

describe('sanitizeQueryParams', () => {
  it('preserves valid parameters', () => {
    const params = new URLSearchParams('symbol=BTCUSDT&limit=100');
    const sanitized = sanitizeQueryParams(params);
    expect(sanitized.get('symbol')).toBe('BTCUSDT');
    expect(sanitized.get('limit')).toBe('100');
  });

  it('sanitizes malicious values', () => {
    const params = new URLSearchParams('symbol=<script>');
    const sanitized = sanitizeQueryParams(params);
    expect(sanitized.get('symbol')).toBe('script');
  });
});

describe('CommonSchemas', () => {
  it('validates symbol correctly', () => {
    expect(validate('BTC/USDT', CommonSchemas.symbol, 'symbol').valid).toBe(true);
    expect(validate('', CommonSchemas.symbol, 'symbol').valid).toBe(false);
    expect(validate('btc_usdt', CommonSchemas.symbol, 'symbol').valid).toBe(false);
  });

  it('validates quantity correctly', () => {
    expect(validate(1.5, CommonSchemas.quantity, 'quantity').valid).toBe(true);
    expect(validate(-1, CommonSchemas.quantity, 'quantity').valid).toBe(false);
  });

  it('validates side correctly', () => {
    expect(validate('buy', CommonSchemas.side, 'side').valid).toBe(true);
    expect(validate('sell', CommonSchemas.side, 'side').valid).toBe(true);
    expect(validate('hold', CommonSchemas.side, 'side').valid).toBe(false);
  });
});
