import { Request, Response, NextFunction } from 'express';

// ─── In-Memory Token Bucket Rate Limiter ─────────────────────────────────────
// No external dependencies required. Each bucket key maps to an array of
// request timestamps. On each request we prune expired timestamps and check
// against the limit. Returns 429 when the limit is exceeded.

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Human-readable description for error messages */
  description?: string;
}

// Shared store: key → array of request timestamps
const store = new Map<string, number[]>();

/**
 * Returns the bucket key for a request.
 * For user-specific limits: uses the authenticated user's ID.
 * For IP-based limits: uses the client IP.
 */
function getKey(req: Request, byUser: boolean): string {
  if (byUser) {
    const userId = (req as any).user?.id;
    if (userId) return `user:${userId}:${req.path}`;
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}:${req.path}`;
}

function createLimiter(options: RateLimitOptions, byUser = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getKey(req, byUser);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get existing timestamps, prune expired ones
    let timestamps = store.get(key) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= options.limit) {
      const retryAfter = Math.ceil((timestamps[0] + options.windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: `Too many requests${options.description ? ' — ' + options.description : ''}. Please try again in ${retryAfter} second(s).`
      });
      return;
    }

    // Record this request
    timestamps.push(now);
    store.set(key, timestamps);
    next();
  };
}

// ─── Named limiters for specific route groups ────────────────────────────────

/** Auth routes: 10 attempts per 15 minutes per IP (prevents brute-force login) */
export const authRateLimiter = createLimiter({
  limit: 10,
  windowMs: 15 * 60 * 1000,
  description: 'max 10 auth requests per 15 minutes per IP'
}, false);

/** Upload route: 20 uploads per hour per IP (prevents storage abuse) */
export const uploadRateLimiter = createLimiter({
  limit: 20,
  windowMs: 60 * 60 * 1000,
  description: 'max 20 uploads per hour per IP'
}, false);

/** Contact form: 5 submissions per hour per IP (prevents spam) */
export const contactRateLimiter = createLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  description: 'max 5 contact messages per hour per IP'
}, false);
