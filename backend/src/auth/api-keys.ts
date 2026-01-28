/**
 * API Key Management
 *
 * Secure API key generation, storage, and validation.
 * Keys are stored with only the hash; full key is shown once at creation.
 */

import { createHash, randomBytes } from 'crypto';

/** API key permissions */
export type ApiKeyPermission =
  | 'read:account'
  | 'read:positions'
  | 'read:orders'
  | 'read:trades'
  | 'write:orders'
  | 'write:positions'
  | 'read:strategies'
  | 'write:strategies'
  | 'read:backtest'
  | 'write:backtest'
  | 'admin';

/** All available permissions */
export const ALL_PERMISSIONS: ApiKeyPermission[] = [
  'read:account',
  'read:positions',
  'read:orders',
  'read:trades',
  'write:orders',
  'write:positions',
  'read:strategies',
  'write:strategies',
  'read:backtest',
  'write:backtest',
  'admin',
];

/** Permission groups for easier assignment */
export const PERMISSION_GROUPS = {
  readonly: [
    'read:account',
    'read:positions',
    'read:orders',
    'read:trades',
    'read:strategies',
    'read:backtest',
  ] as ApiKeyPermission[],
  trading: [
    'read:account',
    'read:positions',
    'read:orders',
    'read:trades',
    'write:orders',
    'write:positions',
  ] as ApiKeyPermission[],
  full: ALL_PERMISSIONS.filter((p) => p !== 'admin') as ApiKeyPermission[],
  admin: ALL_PERMISSIONS,
};

/** Stored API key record */
export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string; // First 8 chars for display
  keyHash: string; // SHA-256 hash for validation
  permissions: ApiKeyPermission[];
  createdAt: number;
  lastUsedAt: number | null;
  expiresAt: number | null;
  isActive: boolean;
  ipWhitelist: string[] | null;
  rateLimit: number; // requests per minute
  usageCount: number;
}

/** API key creation result (includes full key, shown once) */
export interface ApiKeyCreateResult {
  id: string;
  name: string;
  key: string; // Full key - only returned at creation
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  createdAt: number;
  expiresAt: number | null;
}

/** API key validation result */
export interface ApiKeyValidation {
  valid: boolean;
  record?: ApiKeyRecord;
  error?: string;
}

/**
 * API Key Manager
 *
 * Handles creation, validation, and lifecycle of API keys.
 */
export class ApiKeyManager {
  private keys: Map<string, ApiKeyRecord> = new Map();
  private keyHashIndex: Map<string, string> = new Map(); // hash -> id

  /**
   * Generate a secure API key
   */
  private generateKey(): string {
    // Format: qx_live_<32 random bytes as hex>
    const prefix = 'qx_live_';
    const randomPart = randomBytes(32).toString('hex');
    return `${prefix}${randomPart}`;
  }

  /**
   * Hash a key for storage
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `key_${Date.now()}_${randomBytes(4).toString('hex')}`;
  }

  /**
   * Create a new API key
   */
  create(options: {
    name: string;
    permissions: ApiKeyPermission[];
    expiresAt?: number | null;
    ipWhitelist?: string[] | null;
    rateLimit?: number;
  }): ApiKeyCreateResult {
    const id = this.generateId();
    const key = this.generateKey();
    const keyHash = this.hashKey(key);
    const keyPrefix = key.substring(0, 16); // qx_live_XXXXXXXX

    const record: ApiKeyRecord = {
      id,
      name: options.name,
      keyPrefix,
      keyHash,
      permissions: options.permissions,
      createdAt: Date.now(),
      lastUsedAt: null,
      expiresAt: options.expiresAt ?? null,
      isActive: true,
      ipWhitelist: options.ipWhitelist ?? null,
      rateLimit: options.rateLimit ?? 60,
      usageCount: 0,
    };

    this.keys.set(id, record);
    this.keyHashIndex.set(keyHash, id);

    return {
      id,
      name: record.name,
      key, // Full key - only returned here
      keyPrefix,
      permissions: record.permissions,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    };
  }

  /**
   * Validate an API key
   */
  validate(key: string, requiredPermission?: ApiKeyPermission): ApiKeyValidation {
    const keyHash = this.hashKey(key);
    const keyId = this.keyHashIndex.get(keyHash);

    if (!keyId) {
      return { valid: false, error: 'Invalid API key' };
    }

    const record = this.keys.get(keyId);
    if (!record) {
      return { valid: false, error: 'API key not found' };
    }

    if (!record.isActive) {
      return { valid: false, error: 'API key is deactivated' };
    }

    if (record.expiresAt && record.expiresAt < Date.now()) {
      return { valid: false, error: 'API key has expired' };
    }

    if (requiredPermission && !record.permissions.includes(requiredPermission)) {
      return { valid: false, error: `Missing permission: ${requiredPermission}` };
    }

    // Update usage stats
    record.lastUsedAt = Date.now();
    record.usageCount++;

    return { valid: true, record };
  }

  /**
   * Get API key by ID (without sensitive data)
   */
  get(id: string): ApiKeyRecord | undefined {
    return this.keys.get(id);
  }

  /**
   * List all API keys (without sensitive data)
   */
  list(): ApiKeyRecord[] {
    return Array.from(this.keys.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Update API key settings
   */
  update(
    id: string,
    updates: Partial<{
      name: string;
      permissions: ApiKeyPermission[];
      expiresAt: number | null;
      ipWhitelist: string[] | null;
      rateLimit: number;
    }>
  ): ApiKeyRecord | null {
    const record = this.keys.get(id);
    if (!record) return null;

    if (updates.name !== undefined) record.name = updates.name;
    if (updates.permissions !== undefined) record.permissions = updates.permissions;
    if (updates.expiresAt !== undefined) record.expiresAt = updates.expiresAt;
    if (updates.ipWhitelist !== undefined) record.ipWhitelist = updates.ipWhitelist;
    if (updates.rateLimit !== undefined) record.rateLimit = updates.rateLimit;

    return record;
  }

  /**
   * Activate/deactivate an API key
   */
  setActive(id: string, isActive: boolean): ApiKeyRecord | null {
    const record = this.keys.get(id);
    if (!record) return null;

    record.isActive = isActive;
    return record;
  }

  /**
   * Revoke (permanently delete) an API key
   */
  revoke(id: string): boolean {
    const record = this.keys.get(id);
    if (!record) return false;

    this.keyHashIndex.delete(record.keyHash);
    this.keys.delete(id);
    return true;
  }

  /**
   * Get usage statistics
   */
  getStats(): {
    total: number;
    active: number;
    expired: number;
    revoked: number;
    totalUsage: number;
  } {
    const keys = Array.from(this.keys.values());
    const now = Date.now();

    return {
      total: keys.length,
      active: keys.filter((k) => k.isActive && (!k.expiresAt || k.expiresAt > now)).length,
      expired: keys.filter((k) => k.expiresAt && k.expiresAt <= now).length,
      revoked: 0, // Revoked keys are deleted
      totalUsage: keys.reduce((sum, k) => sum + k.usageCount, 0),
    };
  }
}

// Singleton instance
export const apiKeyManager = new ApiKeyManager();

// Create some demo keys for development
if (process.env.NODE_ENV !== 'production') {
  const demoKey1 = apiKeyManager.create({
    name: 'Development Key',
    permissions: PERMISSION_GROUPS.full,
    rateLimit: 1000,
  });
  console.log(`[API Keys] Demo key created: ${demoKey1.keyPrefix}...`);

  const demoKey2 = apiKeyManager.create({
    name: 'Read-Only Dashboard',
    permissions: PERMISSION_GROUPS.readonly,
    rateLimit: 100,
  });
  console.log(`[API Keys] Demo key created: ${demoKey2.keyPrefix}...`);

  const demoKey3 = apiKeyManager.create({
    name: 'Trading Bot',
    permissions: PERMISSION_GROUPS.trading,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    rateLimit: 300,
  });
  console.log(`[API Keys] Demo key created: ${demoKey3.keyPrefix}...`);
}
