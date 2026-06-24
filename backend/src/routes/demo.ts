import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';

const router = Router();

// Apply authentication middleware
router.use(authenticateToken as any);

// @route   POST /api/demo/generate
// @desc    Generate/Regenerate realistic demo data for the current user (24-hour expiration)
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log(`[Demo API] Generating fresh demo data for user: ${userId}`);

    // Call database seeding function
    await db.generateDemoDataForUser(userId);

    // Welcome notice
    await db.createNotification(
      userId,
      'Demo Seeding Completed 💡',
      'Realistic analysis records, reports, and activity logs have been seeded. They will expire in 24 hours.'
    );

    res.json({
      success: true,
      message: 'Fresh demo data successfully generated. Enjoy the test drive!'
    });
  } catch (error: any) {
    console.error('[Demo API] Error generating demo data:', error);
    res.status(500).json({ error: 'Failed to generate demo data. Please try again.' });
  }
});

// @route   POST /api/demo/clear
// @desc    Manually clear all demo data for the current user
router.post('/clear', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log(`[Demo API] Clearing all demo data for user: ${userId}`);

    if (db.getMode() === 'local') {
      // Accessing localData directly since it's local mode
      const localDb = (db as any).localData;
      
      // 1. Unlink disk files first
      const demoUploads = localDb.uploads.filter((u: any) => u.user_id === userId && u.is_demo);
      const fs = require('fs');
      const path = require('path');
      for (const u of demoUploads) {
        if (u.filename && !u.filename.startsWith('sample_')) {
          try {
            const absolutePath = path.resolve(u.file_path);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          } catch (e) {}
        }
      }

      // 2. Filter local arrays
      localDb.uploads = localDb.uploads.filter((u: any) => !(u.user_id === userId && u.is_demo));
      localDb.reports = localDb.reports.filter((r: any) => !(r.user_id === userId && r.is_demo));
      localDb.notifications = localDb.notifications.filter((n: any) => !(n.user_id === userId && n.is_demo));
      
      // 3. Recalculate storage
      const pIdx = localDb.profiles.findIndex((p: any) => p.id === userId);
      if (pIdx !== -1) {
        localDb.profiles[pIdx].storage_used = localDb.uploads
          .filter((u: any) => u.user_id === userId)
          .reduce((sum: number, u: any) => sum + u.file_size, 0);
      }

      (db as any).saveLocalDb();
    } else {
      const supabase = (db as any).supabase;
      await supabase.from('reports').delete().eq('user_id', userId).eq('is_demo', true);
      await supabase.from('uploads').delete().eq('user_id', userId).eq('is_demo', true);
      await supabase.from('notifications').delete().eq('user_id', userId).eq('is_demo', true);

      const uploads = await db.getUploadsByUser(userId);
      const newStorageUsed = uploads.reduce((sum, u) => sum + u.file_size, 0);
      await supabase
        .from('profiles')
        .update({ storage_used: newStorageUsed })
        .eq('id', userId);
    }

    res.json({
      success: true,
      message: 'All temporary demo data has been cleared.'
    });
  } catch (error: any) {
    console.error('[Demo API] Error clearing demo data:', error);
    res.status(500).json({ error: 'Failed to clear demo data.' });
  }
});

export default router;
