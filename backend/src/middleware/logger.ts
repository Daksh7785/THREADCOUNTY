import { Request, Response, NextFunction } from 'express';

// ─── Structured Logger ────────────────────────────────────────────────────────

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};

// ─── Request Logging Middleware ───────────────────────────────────────────────

/**
 * Attaches to every route — logs method + path + user ID (if available) on
 * request, then intercepts res.json to log status + duration on response.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, ip } = req;
  const userId = (req as any).user?.id || 'unauthenticated';

  logger.info('Request received', { method, path, userId, ip });

  // Patch res.json to capture status code + duration after the handler runs
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    if (status >= 400) {
      logger.warn('Request failed', { method, path, userId, status, duration, error: body?.error });
    } else {
      logger.info('Request success', { method, path, userId, status, duration });
    }
    return originalJson(body);
  };

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
