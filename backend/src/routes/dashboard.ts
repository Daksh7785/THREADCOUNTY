import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';

const router = Router();

router.use(authenticateToken as any);

const STORAGE_LIMITS = {
  Free: 10 * 1024 * 1024,         // 10 MB
  Student: 50 * 1024 * 1024,      // 50 MB
  Professional: 250 * 1024 * 1024, // 250 MB
  Enterprise: 2 * 1024 * 1024 * 1024 // 2 GB
};

// @route   GET /api/dashboard/stats
// @desc    Get dashboard metrics & timeline for the user
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch user profile to check storage and plan limits
    const profile = await db.getProfileById(userId);
    if (!profile) {
       res.status(404).json({ error: 'User profile not found.' });
       return;
    }

    const uploads = await db.getUploadsByUser(userId);
    const reports = await db.getReportsByUser(userId);
    const notifications = await db.getNotificationsByUser(userId);

    // Sort notifications, reports, and uploads
    const sortedNotifs = notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const recentReports = reports
      .map(r => {
        const u = uploads.find(up => up.id === r.upload_id);
        return { ...r, upload: u || null };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Build storage metrics
    const plan = profile.plan || 'Free';
    const storageLimit = STORAGE_LIMITS[plan as keyof typeof STORAGE_LIMITS] || STORAGE_LIMITS.Free;

    // Compile timeline events
    const timeline: any[] = [];

    // Add upload events to timeline
    uploads.forEach(u => {
      timeline.push({
        id: `t-up-${u.id}`,
        type: 'upload',
        title: 'Fabric Uploaded',
        description: `Uploaded file ${u.original_name} (${(u.file_size / 1024).toFixed(1)} KB)`,
        timestamp: u.created_at
      });
    });

    // Add report events to timeline
    reports.forEach(r => {
      const u = uploads.find(up => up.id === r.upload_id);
      timeline.push({
        id: `t-rep-${r.id}`,
        type: 'analysis',
        title: 'Analysis Generated',
        description: `Completed analysis for ${u ? u.original_name : 'fabric image'}. Detected: ${r.fabric_type} (${(r.confidence * 100).toFixed(0)}% confidence).`,
        timestamp: r.created_at
      });
    });

    // Add registration event to timeline
    timeline.push({
      id: `t-reg-${profile.id}`,
      type: 'account',
      title: 'Account Joined',
      description: `Welcome to ThreadCounty, ${profile.name}! Account registered successfully.`,
      timestamp: profile.created_at
    });

    // Sort timeline: newest first
    const sortedTimeline = timeline
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Generate trends: average thread density for the last 7 days
    let trendsData = [];
    if (reports.length === 0) {
      // Mock baseline trends so onboarding dashboard looks nice
      trendsData = [
        { day: 'Mon', density: 80, count: 0 },
        { day: 'Tue', density: 95, count: 0 },
        { day: 'Wed', density: 70, count: 0 },
        { day: 'Thu', density: 110, count: 0 },
        { day: 'Fri', density: 130, count: 0 },
        { day: 'Sat', density: 85, count: 0 },
        { day: 'Sun', density: 105, count: 0 }
      ];
    } else {
      const trends = [];
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = daysOfWeek[d.getDay()];
        
        const dayReports = reports.filter(r => r.created_at.startsWith(dateStr));
        const count = dayReports.length;
        const density = count > 0 
          ? Math.round(dayReports.reduce((sum, r) => sum + r.thread_density, 0) / count)
          : 0;
          
        trends.push({
          day: dayLabel,
          density,
          count
        });
      }
      trendsData = trends;
    }

    res.json({
      summary: {
        totalUploads: uploads.length,
        totalReports: reports.length,
        storageUsed: profile.storage_used,
        storageLimit,
        plan
      },
      recentReports,
      notifications: sortedNotifs.slice(0, 10), // Limit notifications to top 10
      timeline: sortedTimeline,
      trends: trendsData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard analytics.' });
  }
});

// @route   PUT /api/dashboard/notifications/:id/read
// @desc    Mark a notification as read
router.put('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const success = await db.markNotificationRead(req.params.id, req.user!.id);
    if (success) {
      res.json({ message: 'Notification marked as read.' });
    } else {
      res.status(404).json({ error: 'Notification not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification status.' });
  }
});

export default router;
