import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import db from '../models/db';

// Plan feature limits
const PLAN_LIMITS: Record<string, { uploadsPerMonth: number | null; storageGB: number | null }> = {
  Free:         { uploadsPerMonth: 10,   storageGB: 0.1 },
  Student:      { uploadsPerMonth: 50,   storageGB: 1 },
  Professional: { uploadsPerMonth: null, storageGB: 10 },
  Enterprise:   { uploadsPerMonth: null, storageGB: null },
};

/**
 * Middleware: reject upload if user has exceeded their monthly upload limit.
 */
export const checkUploadLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await db.getProfileById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS['Free'];

    if (limits.uploadsPerMonth === null) {
      // Unlimited
      return next();
    }

    // Count uploads this calendar month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const uploads = await db.getUploadsByUser(req.user!.id);
    const monthlyCount = uploads.filter(
      (u) => !u.is_demo && new Date(u.created_at) >= monthStart
    ).length;

    if (monthlyCount >= limits.uploadsPerMonth) {
      res.status(429).json({
        error: 'Monthly upload limit reached.',
        message: `Your ${user.plan} plan allows ${limits.uploadsPerMonth} uploads per month. Upgrade to upload more.`,
        uploadCount: monthlyCount,
        limit: limits.uploadsPerMonth,
      });
      return;
    }

    next();
  } catch {
    // Non-blocking — allow upload if check fails
    next();
  }
};

/**
 * Middleware: reject upload if user has exceeded their storage quota.
 */
export const checkStorageLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await db.getProfileById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS['Free'];

    if (limits.storageGB === null) {
      return next();
    }

    const storageLimit = limits.storageGB * 1024 * 1024 * 1024; // bytes
    if (user.storage_used >= storageLimit) {
      res.status(429).json({
        error: 'Storage limit exceeded.',
        message: `Your ${user.plan} plan includes ${limits.storageGB}GB of storage. Upgrade for more space.`,
        storageUsed: user.storage_used,
        storageLimit,
      });
      return;
    }

    next();
  } catch {
    next();
  }
};
