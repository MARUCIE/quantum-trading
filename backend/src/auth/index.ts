/**
 * Auth Module
 *
 * Exports authentication and authorization components.
 */

export {
  apiKeyManager,
  ApiKeyManager,
  type ApiKeyPermission,
  type ApiKeyRecord,
  type ApiKeyCreateResult,
  type ApiKeyValidation,
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
} from './api-keys.js';
