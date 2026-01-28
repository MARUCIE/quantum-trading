/**
 * Rate Limiter Middleware
 *
 * Simple in-memory rate limiting for API protection.
 */

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Message when limit exceeded */
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private clients: Map<string, ClientRecord> = new Map();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: config.windowMs ?? 60000, // 1 minute default
      maxRequests: config.maxRequests ?? 100,
      message: config.message ?? 'Too many requests, please try again later',
    };

    // Clean up expired records periodically
    setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /**
   * Check if a client IP is rate limited
   * Returns null if allowed, or error message if blocked
   */
  check(clientIp: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let record = this.clients.get(clientIp);

    // If no record or window expired, create new record
    if (!record || now >= record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      this.clients.set(clientIp, record);
    }

    record.count++;

    const remaining = Math.max(0, this.config.maxRequests - record.count);
    const allowed = record.count <= this.config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
    };
  }

  /**
   * Get rate limit headers for response
   */
  getHeaders(result: { remaining: number; resetTime: number }): Record<string, string> {
    return {
      'X-RateLimit-Limit': String(this.config.maxRequests),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    };
  }

  /**
   * Get error message
   */
  getMessage(): string {
    return this.config.message!;
  }

  /**
   * Remove expired client records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.clients) {
      if (now >= record.resetTime) {
        this.clients.delete(ip);
      }
    }
  }

  /**
   * Reset rate limit for a client (for testing or manual override)
   */
  reset(clientIp: string): void {
    this.clients.delete(clientIp);
  }

  /**
   * Get current stats
   */
  getStats(): { clientCount: number } {
    return {
      clientCount: this.clients.size,
    };
  }
}

// Default rate limiter instance
export const defaultRateLimiter = new RateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
});
