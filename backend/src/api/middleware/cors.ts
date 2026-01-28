/**
 * CORS Middleware
 *
 * Configurable Cross-Origin Resource Sharing.
 */

import { ServerResponse } from 'http';

export interface CorsConfig {
  /** Allowed origins (can be string, array, or '*' for all) */
  origins: string | string[];
  /** Allowed HTTP methods */
  methods: string[];
  /** Allowed headers */
  headers: string[];
  /** Whether to allow credentials */
  credentials: boolean;
  /** Max age for preflight cache (seconds) */
  maxAge: number;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  origins: process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400, // 24 hours
};

export class CorsHandler {
  private config: CorsConfig;

  constructor(config: Partial<CorsConfig> = {}) {
    this.config = { ...DEFAULT_CORS_CONFIG, ...config };
  }

  /**
   * Check if origin is allowed
   */
  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return true; // Same-origin requests
    if (this.config.origins === '*') return true;

    const allowedOrigins = Array.isArray(this.config.origins)
      ? this.config.origins
      : [this.config.origins];

    return allowedOrigins.includes(origin);
  }

  /**
   * Apply CORS headers to response
   */
  applyHeaders(res: ServerResponse, origin: string | undefined): void {
    // Determine Access-Control-Allow-Origin
    if (this.config.origins === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origin && this.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    // Other CORS headers
    res.setHeader('Access-Control-Allow-Methods', this.config.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', this.config.headers.join(', '));
    res.setHeader('Access-Control-Max-Age', String(this.config.maxAge));

    if (this.config.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  /**
   * Handle preflight OPTIONS request
   */
  handlePreflight(res: ServerResponse, origin: string | undefined): void {
    this.applyHeaders(res, origin);
    res.writeHead(204);
    res.end();
  }
}

// Default CORS handler instance
export const defaultCorsHandler = new CorsHandler();
