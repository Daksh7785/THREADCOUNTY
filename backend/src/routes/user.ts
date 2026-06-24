import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../models/db';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticateToken as any);

// @route   GET /api/user/profile
// @desc    Get current user profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await db.getProfileById(req.user!.id);
    if (!profile) {
       res.status(404).json({ error: 'User profile not found.' });
       return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, avatar_url } = req.body;
    if (!name) {
       res.status(400).json({ error: 'Name is required.' });
       return;
    }

    const updatedProfile = await db.updateProfile(req.user!.id, {
      name,
      company: company || '',
      avatar_url: avatar_url || ''
    });

    res.json({
      message: 'Profile updated successfully.',
      user: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
router.put('/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
       res.status(400).json({ error: 'Current password and new password are required.' });
       return;
    }

    const passwordHash = await db.getUserPasswordHash(req.user!.id);
    if (!passwordHash) {
       res.status(404).json({ error: 'User auth not found.' });
       return;
    }

    const isMatch = await bcrypt.compare(currentPassword, passwordHash);
    if (!isMatch) {
       res.status(400).json({ error: 'Current password is incorrect.' });
       return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await db.updatePassword(req.user!.id, newHash);

    await db.createNotification(req.user!.id, 'Password Changed', 'Your password was changed from the profile panel.');

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// @route   DELETE /api/user/delete-account
// @desc    Delete user account
router.delete('/delete-account', async (req: AuthRequest, res: Response) => {
  try {
    const success = await db.deleteUserAccount(req.user!.id);
    if (success) {
      res.json({ message: 'Account deleted successfully.' });
    } else {
      res.status(400).json({ error: 'Failed to delete account.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

export default router;
