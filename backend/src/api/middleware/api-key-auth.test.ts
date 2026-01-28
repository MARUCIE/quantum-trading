/**
 * API Key Authentication Middleware Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IncomingMessage, ServerResponse } from 'http';
import {
  extractApiKey,
  authenticateRequest,
  checkIpWhitelist,
  createAuthMiddleware,
  authMiddleware,
} from './api-key-auth.js';
import { apiKeyManager, type ApiKeyRecord } from '../../auth/index.js';

// Mock request factory
function createMockRequest(headers: Record<string, string> = {}): IncomingMessage {
  return {
    headers,
  } as IncomingMessage;
}

// Mock response factory
function createMockResponse(): ServerResponse & { body: string; statusCode: number } {
  const res = {
    statusCode: 200,
    body: '',
    writeHead: vi.fn((code: number) => {
      res.statusCode = code;
    }),
    end: vi.fn((body: string) => {
      res.body = body;
    }),
  } as unknown as ServerResponse & { body: string; statusCode: number };
  return res;
}

describe('API Key Authentication Middleware', () => {
  describe('extractApiKey', () => {
    it('should extract key from Authorization Bearer header', () => {
      const req = createMockRequest({
        authorization: 'Bearer qx_live_test123',
      });
      expect(extractApiKey(req)).toBe('qx_live_test123');
    });

    it('should extract key from X-API-Key header', () => {
      const req = createMockRequest({
        'x-api-key': 'qx_live_test456',
      });
      expect(extractApiKey(req)).toBe('qx_live_test456');
    });

    it('should prefer Authorization header over X-API-Key', () => {
      const req = createMockRequest({
        authorization: 'Bearer qx_live_bearer',
        'x-api-key': 'qx_live_header',
      });
      expect(extractApiKey(req)).toBe('qx_live_bearer');
    });

    it('should return null for missing headers', () => {
      const req = createMockRequest({});
      expect(extractApiKey(req)).toBeNull();
    });

    it('should return null for non-Bearer authorization', () => {
      const req = createMockRequest({
        authorization: 'Basic dXNlcjpwYXNz',
      });
      expect(extractApiKey(req)).toBeNull();
    });
  });

  describe('authenticateRequest', () => {
    let testKey: { id: string; key: string };

    beforeEach(() => {
      // Create a test key
      testKey = apiKeyManager.create({
        name: 'Test Auth Key',
        permissions: ['read:account', 'read:positions'],
      });
    });

    it('should authenticate valid API key', () => {
      const req = createMockRequest({
        authorization: `Bearer ${testKey.key}`,
      });
      const result = authenticateRequest(req);
      expect(result.authenticated).toBe(true);
      expect(result.apiKey).toBeDefined();
      expect(result.apiKey?.name).toBe('Test Auth Key');
    });

    it('should fail for missing API key', () => {
      const req = createMockRequest({});
      const result = authenticateRequest(req);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('API key required');
    });

    it('should fail for invalid API key', () => {
      const req = createMockRequest({
        authorization: 'Bearer qx_live_invalid_key_12345',
      });
      const result = authenticateRequest(req);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should check required permission', () => {
      const req = createMockRequest({
        authorization: `Bearer ${testKey.key}`,
      });

      // Should pass for granted permission
      const result1 = authenticateRequest(req, 'read:account');
      expect(result1.authenticated).toBe(true);

      // Should fail for missing permission
      const result2 = authenticateRequest(req, 'write:orders');
      expect(result2.authenticated).toBe(false);
      expect(result2.error).toContain('Missing permission');
    });

    it('should fail for deactivated key', () => {
      apiKeyManager.setActive(testKey.id, false);

      const req = createMockRequest({
        authorization: `Bearer ${testKey.key}`,
      });
      const result = authenticateRequest(req);
      expect(result.authenticated).toBe(false);
      expect(result.error).toBe('API key is deactivated');
    });
  });

  describe('checkIpWhitelist', () => {
    it('should allow all IPs when no whitelist', () => {
      const apiKey = {
        ipWhitelist: null,
      } as unknown as ApiKeyRecord;
      expect(checkIpWhitelist(apiKey, '192.168.1.1')).toBe(true);
    });

    it('should allow all IPs when whitelist is empty', () => {
      const apiKey = {
        ipWhitelist: [],
      } as unknown as ApiKeyRecord;
      expect(checkIpWhitelist(apiKey, '192.168.1.1')).toBe(true);
    });

    it('should allow whitelisted IPs', () => {
      const apiKey = {
        ipWhitelist: ['192.168.1.1', '10.0.0.1'],
      } as unknown as ApiKeyRecord;
      expect(checkIpWhitelist(apiKey, '192.168.1.1')).toBe(true);
      expect(checkIpWhitelist(apiKey, '10.0.0.1')).toBe(true);
    });

    it('should block non-whitelisted IPs', () => {
      const apiKey = {
        ipWhitelist: ['192.168.1.1'],
      } as unknown as ApiKeyRecord;
      expect(checkIpWhitelist(apiKey, '192.168.1.2')).toBe(false);
    });
  });

  describe('createAuthMiddleware', () => {
    let testKey: { id: string; key: string };

    beforeEach(() => {
      testKey = apiKeyManager.create({
        name: 'Middleware Test Key',
        permissions: ['read:account'],
      });
    });

    it('should authenticate and return result', () => {
      const auth = createAuthMiddleware();
      const req = createMockRequest({
        authorization: `Bearer ${testKey.key}`,
      });
      const res = createMockResponse();

      const result = auth(req, res);
      expect(result.authenticated).toBe(true);
      expect(res.writeHead).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid key', () => {
      const auth = createAuthMiddleware();
      const req = createMockRequest({
        authorization: 'Bearer invalid_key',
      });
      const res = createMockResponse();

      const result = auth(req, res);
      expect(result.authenticated).toBe(false);
      expect(res.writeHead).toHaveBeenCalledWith(401, expect.any(Object));
    });

    it('should allow public access when configured', () => {
      const auth = createAuthMiddleware({ allowPublic: true });
      const req = createMockRequest({});
      const res = createMockResponse();

      const result = auth(req, res);
      expect(result.authenticated).toBe(true);
    });

    it('should check permission when required', () => {
      const auth = createAuthMiddleware({ permission: 'write:orders' });
      const req = createMockRequest({
        authorization: `Bearer ${testKey.key}`,
      });
      const res = createMockResponse();

      const result = auth(req, res);
      expect(result.authenticated).toBe(false);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('authMiddleware presets', () => {
    let readKey: { id: string; key: string };
    let adminKey: { id: string; key: string };

    beforeEach(() => {
      readKey = apiKeyManager.create({
        name: 'Read Only Key',
        permissions: ['read:account', 'read:positions'],
      });
      adminKey = apiKeyManager.create({
        name: 'Admin Key',
        permissions: ['admin'],
      });
    });

    it('requireAuth should accept any valid key', () => {
      const req = createMockRequest({
        authorization: `Bearer ${readKey.key}`,
      });
      const res = createMockResponse();
      const result = authMiddleware.requireAuth(req, res);
      expect(result.authenticated).toBe(true);
    });

    it('requireReadAccount should check permission', () => {
      const req = createMockRequest({
        authorization: `Bearer ${readKey.key}`,
      });
      const res = createMockResponse();
      const result = authMiddleware.requireReadAccount(req, res);
      expect(result.authenticated).toBe(true);
    });

    it('requireWriteOrders should reject read-only key', () => {
      const req = createMockRequest({
        authorization: `Bearer ${readKey.key}`,
      });
      const res = createMockResponse();
      const result = authMiddleware.requireWriteOrders(req, res);
      expect(result.authenticated).toBe(false);
    });

    it('requireAdmin should check admin permission', () => {
      const reqAdmin = createMockRequest({
        authorization: `Bearer ${adminKey.key}`,
      });
      const resAdmin = createMockResponse();
      expect(authMiddleware.requireAdmin(reqAdmin, resAdmin).authenticated).toBe(true);

      const reqRead = createMockRequest({
        authorization: `Bearer ${readKey.key}`,
      });
      const resRead = createMockResponse();
      expect(authMiddleware.requireAdmin(reqRead, resRead).authenticated).toBe(false);
    });

    it('optionalAuth should allow unauthenticated requests', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const result = authMiddleware.optionalAuth(req, res);
      expect(result.authenticated).toBe(true);
    });
  });
});
