import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import db from '../models/db';
import { getSettings } from '../routes/adminSettings';

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

    const settings = getSettings();
    const limits = settings.planLimits[user.plan as keyof typeof settings.planLimits] ?? settings.planLimits['Free'];

    if (limits.maxUploads === null || limits.maxUploads === undefined) {
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

    if (monthlyCount >= limits.maxUploads) {
      res.status(429).json({
        error: 'Monthly upload limit reached.',
        message: `Your ${user.plan} plan allows ${limits.maxUploads} uploads per month. Upgrade to upload more.`,
        uploadCount: monthlyCount,
        limit: limits.maxUploads,
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

    const settings = getSettings();
    const limits = settings.planLimits[user.plan as keyof typeof settings.planLimits] ?? settings.planLimits['Free'];

    if (limits.storageCap === null || limits.storageCap === undefined) {
      return next();
    }

    const storageLimit = limits.storageCap * 1024 * 1024 * 1024; // bytes
    if (user.storage_used >= storageLimit) {
      res.status(429).json({
        error: 'Storage limit exceeded.',
        message: `Your ${user.plan} plan includes ${limits.storageCap}GB of storage. Upgrade for more space.`,
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

