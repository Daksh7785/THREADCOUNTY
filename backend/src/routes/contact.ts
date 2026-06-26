import { Router, Response } from 'express';
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth';
import db from '../models/db';
import { contactRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { schemas } from '../config/validationSchemas';

const router = Router();

// @route   POST /api/contact
// @desc    Submit a contact/inquiry message
router.post('/', contactRateLimiter as any, validateRequest(schemas.contact) as any, async (req: any, res: Response) => {
  try {
    const { name, email, subject, message } = req.validated;

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
