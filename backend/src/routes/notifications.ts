import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';
import { validateRequest } from '../middleware/validation';
import { schemas } from '../config/validationSchemas';

const router = Router();

// @route   GET /api/notifications
// @desc    Get user notifications (all or unread only)
router.get('/', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await db.getNotifications(req.user!.id, unreadOnly);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await db.markNotificationRead(req.params.id, req.user!.id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }
    res.json({ success: true, notification });
  } catch {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all user notifications as read
router.put('/read-all', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    await db.markAllNotificationsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// @route   GET /api/notifications/preferences
// @desc    Get notification email preferences
router.get('/preferences', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await db.getNotificationPreferences(req.user!.id);
    res.json({ success: true, preferences: prefs });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notification preferences.' });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification email preferences
router.put(
  '/preferences',
  authenticateToken as any,
  validateRequest(schemas.notificationPreferences) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const updated = await db.updateNotificationPreferences(req.user!.id, req.body);
      res.json({ success: true, preferences: updated });
    } catch {
      res.status(500).json({ error: 'Failed to update notification preferences.' });
    }
  }
);

export default router;
