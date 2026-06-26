import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import winstonLogger from '../config/logger';

// ─── Structured Logger (Winston-backed) ──────────────────────────────────────
export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => winstonLogger.info(msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => winstonLogger.warn(msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => winstonLogger.error(msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => winstonLogger.debug(msg, meta),
};

// ─── Request Logging Middleware ───────────────────────────────────────────────

/**
 * Attaches to every route — logs method + path + requestId + userId on request,
 * then logs status + duration on response finish.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const start = Date.now();
  const { method, path: reqPath, ip } = req;
  const userId = (req as any).user?.id || 'unauthenticated';

  (req as any).id = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const meta = { requestId, method, path: reqPath, status, duration: `${duration}ms`, userId, ip };

    if (status >= 500) {
      winstonLogger.error('Request error', meta);
    } else if (status >= 400) {
      winstonLogger.warn('Request failed', meta);
    } else {
      winstonLogger.info('Request completed', meta);
    }
  });

  next();
}

// ─── Sanitizer ────────────────────────────────────────────────────────────────

/**
 * Strips HTML/script tags from a string before storing to prevent stored XSS.
 * Lightweight: no external dependency.
 */
export function sanitize(input: string): string {
  if (!input || typeof input !== 'string') return input;
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
