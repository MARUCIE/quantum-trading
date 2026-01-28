/**
 * Security Headers Middleware
 *
 * Applies security-related HTTP headers to responses.
 */

import { ServerResponse } from 'http';

export interface SecurityHeadersConfig {
  /** Content-Security-Policy header */
  contentSecurityPolicy: string | false;
  /** X-Content-Type-Options header */
  noSniff: boolean;
  /** X-Frame-Options header */
  frameOptions: 'DENY' | 'SAMEORIGIN' | false;
  /** X-XSS-Protection header (deprecated but still useful) */
  xssProtection: boolean;
  /** Referrer-Policy header */
  referrerPolicy: string;
  /** Strict-Transport-Security (HSTS) */
  hsts: { maxAge: number; includeSubDomains: boolean } | false;
  /** Permissions-Policy header */
  permissionsPolicy: string | false;
}

const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  contentSecurityPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  noSniff: true,
  frameOptions: 'DENY',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};

export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * Apply security headers to response
   */
  apply(res: ServerResponse): void {
    // Content-Security-Policy
    if (this.config.contentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', this.config.contentSecurityPolicy);
    }

    // X-Content-Type-Options
    if (this.config.noSniff) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      res.setHeader('X-Frame-Options', this.config.frameOptions);
    }

    // X-XSS-Protection (deprecated but adds defense in depth)
    if (this.config.xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      res.setHeader('Referrer-Policy', this.config.referrerPolicy);
    }

    // Strict-Transport-Security (HSTS)
    if (this.config.hsts) {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      res.setHeader('Strict-Transport-Security', hstsValue);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      res.setHeader('Permissions-Policy', this.config.permissionsPolicy);
    }

    // Additional security headers
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  }
}

// Default security headers instance
export const defaultSecurityHeaders = new SecurityHeaders();
