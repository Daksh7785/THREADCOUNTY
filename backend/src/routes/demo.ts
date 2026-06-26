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

router.post('/clear', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log(`[Demo API] Clearing all demo data for user: ${userId}`);

    await db.clearDemoDataForUser(userId);

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
