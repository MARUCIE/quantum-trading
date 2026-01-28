/**
 * API Key Authentication Middleware
 *
 * Validates API keys from request headers and enforces permissions.
 * Supports both Bearer token and X-API-Key header formats.
 */

import { IncomingMessage, ServerResponse } from 'http';
import {
  apiKeyManager,
  type ApiKeyPermission,
  type ApiKeyRecord,
} from '../../auth/index.js';

/** Authentication result */
export interface AuthResult {
  authenticated: boolean;
  apiKey?: ApiKeyRecord;
  error?: string;
}

/** Route protection options */
export interface ProtectedRouteOptions {
  /** Required permission for the route */
  permission?: ApiKeyPermission;
  /** Allow unauthenticated access (for public routes) */
  allowPublic?: boolean;
  /** Custom error handler */
  onError?: (res: ServerResponse, error: string) => void;
}

/**
 * Extract API key from request headers
 *
 * Supports:
 * - Authorization: Bearer <key>
 * - X-API-Key: <key>
 */
export function extractApiKey(req: IncomingMessage): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (typeof apiKeyHeader === 'string') {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Authenticate a request using API key
 */
export function authenticateRequest(
  req: IncomingMessage,
  requiredPermission?: ApiKeyPermission
): AuthResult {
  const key = extractApiKey(req);

  if (!key) {
    return {
      authenticated: false,
      error: 'API key required. Use Authorization: Bearer <key> or X-API-Key header.',
    };
  }

  const validation = apiKeyManager.validate(key, requiredPermission);

  if (!validation.valid) {
    return {
      authenticated: false,
      error: validation.error || 'Invalid API key',
    };
  }

  return {
    authenticated: true,
    apiKey: validation.record,
  };
}

/**
 * Check if client IP is whitelisted for the API key
 */
export function checkIpWhitelist(
  apiKey: ApiKeyRecord,
  clientIp: string
): boolean {
  // No whitelist means all IPs allowed
  if (!apiKey.ipWhitelist || apiKey.ipWhitelist.length === 0) {
    return true;
  }

  // Check if IP is in whitelist
  return apiKey.ipWhitelist.includes(clientIp);
}

/**
 * Default error handler for authentication failures
 */
function defaultErrorHandler(res: ServerResponse, error: string): void {
  res.writeHead(401, {
    'Content-Type': 'application/json',
    'WWW-Authenticate': 'Bearer realm="api"',
  });
  res.end(JSON.stringify({ error }));
}

/**
 * Create authentication middleware for a protected route
 *
 * Usage:
 * ```typescript
 * const auth = createAuthMiddleware({ permission: 'write:orders' });
 *
 * server.post('/api/orders', async (req, res, params, query) => {
 *   const authResult = auth(req, res);
 *   if (!authResult.authenticated) return;
 *
 *   // Proceed with authenticated request
 *   // authResult.apiKey contains the validated API key record
 * });
 * ```
 */
export function createAuthMiddleware(options: ProtectedRouteOptions = {}) {
  const { permission, allowPublic = false, onError = defaultErrorHandler } = options;

  return (
    req: IncomingMessage,
    res: ServerResponse,
    clientIp?: string
  ): AuthResult => {
    // Allow public access if configured
    if (allowPublic && !extractApiKey(req)) {
      return { authenticated: true };
    }

    // Authenticate the request
    const result = authenticateRequest(req, permission);

    if (!result.authenticated) {
      onError(res, result.error || 'Authentication failed');
      return result;
    }

    // Check IP whitelist if API key has restrictions
    if (result.apiKey && clientIp) {
      if (!checkIpWhitelist(result.apiKey, clientIp)) {
        const error = 'IP address not in whitelist';
        onError(res, error);
        return { authenticated: false, error };
      }
    }

    return result;
  };
}

/**
 * Middleware factory for common permission levels
 */
export const authMiddleware = {
  /** Require any valid API key */
  requireAuth: createAuthMiddleware(),

  /** Require read:account permission */
  requireReadAccount: createAuthMiddleware({ permission: 'read:account' }),

  /** Require read:positions permission */
  requireReadPositions: createAuthMiddleware({ permission: 'read:positions' }),

  /** Require read:orders permission */
  requireReadOrders: createAuthMiddleware({ permission: 'read:orders' }),

  /** Require write:orders permission */
  requireWriteOrders: createAuthMiddleware({ permission: 'write:orders' }),

  /** Require read:strategies permission */
  requireReadStrategies: createAuthMiddleware({ permission: 'read:strategies' }),

  /** Require write:strategies permission */
  requireWriteStrategies: createAuthMiddleware({ permission: 'write:strategies' }),

  /** Require read:backtest permission */
  requireReadBacktest: createAuthMiddleware({ permission: 'read:backtest' }),

  /** Require write:backtest permission */
  requireWriteBacktest: createAuthMiddleware({ permission: 'write:backtest' }),

  /** Require admin permission */
  requireAdmin: createAuthMiddleware({ permission: 'admin' }),

  /** Allow public access but authenticate if key provided */
  optionalAuth: createAuthMiddleware({ allowPublic: true }),
};

/**
 * Wrap a route handler with authentication
 *
 * This is a higher-order function that wraps a route handler
 * with authentication logic.
 *
 * Usage:
 * ```typescript
 * server.get('/api/account', withAuth(
 *   { permission: 'read:account' },
 *   async (req, res, params, query, apiKey) => {
 *     // apiKey is the validated API key record
 *   }
 * ));
 * ```
 */
export function withAuth<T extends (...args: unknown[]) => unknown>(
  options: ProtectedRouteOptions,
  handler: (
    req: IncomingMessage,
    res: ServerResponse,
    params: Record<string, string>,
    query: URLSearchParams,
    apiKey?: ApiKeyRecord
  ) => ReturnType<T>
) {
  const auth = createAuthMiddleware(options);

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    params: Record<string, string>,
    query: URLSearchParams
  ) => {
    const result = auth(req, res);
    if (!result.authenticated) {
      return;
    }

    return handler(req, res, params, query, result.apiKey);
  };
}

// Export default instance
export const apiKeyAuth = {
  extractApiKey,
  authenticateRequest,
  checkIpWhitelist,
  createAuthMiddleware,
  authMiddleware,
  withAuth,
};
