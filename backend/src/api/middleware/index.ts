/**
 * API Middleware
 *
 * Security and utility middleware for the API server.
 */

export { RateLimiter, defaultRateLimiter } from './rate-limiter.js';
export type { RateLimitConfig } from './rate-limiter.js';

export { CorsHandler, defaultCorsHandler } from './cors.js';
export type { CorsConfig } from './cors.js';

export { SecurityHeaders, defaultSecurityHeaders } from './security-headers.js';
export type { SecurityHeadersConfig } from './security-headers.js';

export {
  validate,
  validateObject,
  sanitizeString,
  sanitizeQueryParams,
  CommonSchemas,
} from './validation.js';
export type { ValidationRule, ValidationSchema, ValidationResult } from './validation.js';

export {
  apiKeyAuth,
  extractApiKey,
  authenticateRequest,
  checkIpWhitelist,
  createAuthMiddleware,
  authMiddleware,
  withAuth,
} from './api-key-auth.js';
export type { AuthResult, ProtectedRouteOptions } from './api-key-auth.js';
