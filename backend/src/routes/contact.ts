import { Router, Response } from 'express';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';
import db from '../models/db';
import { contactRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// @route   POST /api/contact
// @desc    Submit a contact/inquiry message
router.post('/', contactRateLimiter as any, async (req, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
       res.status(400).json({ error: 'All fields are required.' });
       return;
    }

    const savedMessage = await db.createContactMessage(name, email, subject, message);

    res.status(201).json({
      message: 'Your inquiry has been submitted. Our support team will reach out shortly.',
      contactMessage: savedMessage
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact message.' });
  }
});

// @route   GET /api/contact
// @desc    List all submitted contact messages (Admin Only)
router.get('/', authenticateToken as any, isAdmin as any, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await db.getAllContactMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inquiries.' });
  }
});

export default router;
