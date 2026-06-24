import { Router, Response } from 'express';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';
import db from '../models/db';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authenticateToken as any);
router.use(isAdmin as any);

// @route   GET /api/admin/stats
// @desc    Get aggregate platform metrics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve administrative analytics.' });
  }
});

// @route   GET /api/admin/users
// @desc    List all platform users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const profiles = await db.getAllProfilesAdmin();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user directory.' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user access role (user vs admin)
router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') {
       res.status(400).json({ error: 'Invalid role assignment. Must be user or admin.' });
       return;
    }

    if (req.params.id === req.user!.id) {
       res.status(400).json({ error: 'Cannot modify your own administrative role.' });
       return;
    }

    const updated = await db.updateProfile(req.params.id, { role });
    res.json({ message: `User role updated to ${role}.`, user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// @route   PUT /api/admin/users/:id/plan
// @desc    Manage/override subscription tier for user
router.put('/users/:id/plan', async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const validPlans = ['Free', 'Student', 'Professional', 'Enterprise'];
    if (!validPlans.includes(plan)) {
       res.status(400).json({ error: 'Invalid subscription plan tier.' });
       return;
    }

    const updated = await db.updateProfile(req.params.id, { plan });
    // Alert the user via notification
    await db.createNotification(
      req.params.id,
      'Subscription Updated',
      `Your subscription plan has been updated to ${plan} by an administrator.`
    );

    res.json({ message: `User subscription updated to ${plan}.`, user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription plan.' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user!.id) {
       res.status(400).json({ error: 'Cannot delete your own administrative account.' });
       return;
    }

    const success = await db.deleteUserAccount(req.params.id);
    if (success) {
      res.json({ message: 'User account and associated records deleted.' });
    } else {
      res.status(400).json({ error: 'Failed to delete user.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports with upload & user profile metadata
router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const reports = await db.getAllReportsAdmin();
    const uploads = await db.getAllUploadsAdmin();
    const profiles = await db.getAllProfilesAdmin();

    const enriched = reports.map(r => {
      const upload = uploads.find(u => u.id === r.upload_id);
      const user = profiles.find(p => p.id === r.user_id);
      return {
        ...r,
        upload: upload ? {
          original_name: upload.original_name,
          file_size: upload.file_size,
          file_path: upload.file_path
        } : null,
        user: user ? {
          name: user.name,
          email: user.email
        } : null
      };
    });

    res.json({ reports: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve admin reports inbox.' });
  }
});

// @route   DELETE /api/admin/reports/:id
// @desc    Delete report and raw image files
router.delete('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const success = await db.deleteReport(req.params.id, req.user!.id, true);
    if (success) {
      res.json({ message: 'Report and image file deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Report not found or authorization failed.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

export default router;
