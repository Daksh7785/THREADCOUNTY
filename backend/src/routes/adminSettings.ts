import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../middleware/logger';

const router = Router();

// In-memory platform settings store (persists for the server session)
let platformSettings = {
  planLimits: {
    Free:         { maxUploads: 3,    maxSizeMb: 5,   storageCap: 0.5  },
    Student:      { maxUploads: 25,   maxSizeMb: 20,  storageCap: 5    },
    Professional: { maxUploads: 200,  maxSizeMb: 50,  storageCap: 50   },
    Enterprise:   { maxUploads: 9999, maxSizeMb: 200, storageCap: 1000 }
  },
  maintenanceMode: false,
  featureFlags: {
    aiChatbot:    true,
    voiceSearch:  true,
    forumEnabled: false,
    blogEnabled:  false
  }
};

// Middleware: admin only
const adminOnly = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
};

// @route  GET /api/admin/settings
// @desc   Get current platform settings
// @access Admin
router.get('/', authenticateToken as any, adminOnly, (req: AuthRequest, res: Response) => {
  logger.info('Admin settings read', { userId: req.user!.id });
  res.json(platformSettings);
});

// @route  PUT /api/admin/settings
// @desc   Update platform settings
// @access Admin
router.put('/', authenticateToken as any, adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    // Merge updates (shallow merge at top level + per-section)
    if (updates.planLimits) {
      platformSettings.planLimits = { ...platformSettings.planLimits, ...updates.planLimits };
    }
    if (typeof updates.maintenanceMode === 'boolean') {
      platformSettings.maintenanceMode = updates.maintenanceMode;
    }
    if (updates.featureFlags) {
      platformSettings.featureFlags = { ...platformSettings.featureFlags, ...updates.featureFlags };
    }
    logger.info('Admin settings updated', { userId: req.user!.id, changes: Object.keys(updates) });
    res.json({ message: 'Settings saved.', settings: platformSettings });
  } catch (err: any) {
    logger.error('Admin settings update failed', { error: err.message });
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// @route  GET /api/admin/settings/public
// @desc   Get feature flags for all users (no auth required)
// @access Public
router.get('/public', (req, res) => {
  res.json({ featureFlags: platformSettings.featureFlags, maintenanceMode: platformSettings.maintenanceMode });
});

export default router;

// Export current settings for use by other routes (e.g., upload limit enforcement)
export const getSettings = () => platformSettings;
