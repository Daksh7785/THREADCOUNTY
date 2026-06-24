import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../models/db';
import { JWT_SECRET } from '../middleware/auth';

const router = Router();

// Initialise Google OAuth client (reads GOOGLE_CLIENT_ID from .env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────
// @route   POST /api/auth/google
// @desc    Verify Google ID token → create or login user
// ─────────────────────────────────────────────
router.post('/google', async (req, res: Response) => {
  try {
    const { credential, googleUser } = req.body;

    if (!credential && !googleUser) {
      res.status(400).json({ error: 'Google credential token or user info is required.' });
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id_here.apps.googleusercontent.com') {
      res.status(503).json({
        error: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID in backend/.env and restart the server.'
      });
      return;
    }

    let email: string;
    let name: string | undefined;
    let picture: string | undefined;
    let googleId: string;

    if (googleUser) {
      // Received direct user info from frontend implicit flow
      email = googleUser.email;
      name = googleUser.name;
      picture = googleUser.picture;
      googleId = googleUser.sub;
    } else {
      // ID token verification path
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(401).json({ error: 'Invalid Google token payload.' });
        return;
      }
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required from Google account.' });
      return;
    }

    // Find existing user or create new one
    let user = await db.getProfileByEmail(email);

    if (!user) {
      // Create a new user — no password needed for OAuth users (use googleId as a marker)
      const oauthPlaceholder = `google_oauth_${googleId}`;
      user = await db.createUser(email, oauthPlaceholder, name || email.split('@')[0]);

      // Update avatar if available
      if (picture) {
        await db.updateProfile(user.id, { avatar_url: picture });
        user.avatar_url = picture;
      }

      // Welcome notification
      await db.createNotification(
        user.id,
        'Welcome to ThreadCounty! 🎉',
        'Your account was created via Google. Explore AI-powered fabric analysis now!'
      );
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' } // Google logins default to 30-day sessions
    );

    res.json({
      message: 'Google login successful.',
      token,
      user
    });
  } catch (error: any) {
    console.error('[Auth] Google OAuth error:', error.message);
    if (error.message?.includes('Invalid token signature') || error.message?.includes('Token used too late')) {
      res.status(401).json({ error: 'Google token is invalid or expired. Please try again.' });
    } else {
      res.status(500).json({ error: 'Google authentication failed. Please try email login instead.' });
    }
  }
});

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res: Response) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
       res.status(400).json({ error: 'Name, email, and password are required.' });
       return;
    }

    const existingUser = await db.getProfileByEmail(email);
    if (existingUser) {
       res.status(400).json({ error: 'A user with this email address already exists.' });
       return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await db.createUser(email, passwordHash, name, company);

    // Create notifications for welcome
    await db.createNotification(user.id, 'Welcome to ThreadCounty!', 'Your account has been created successfully. Explore our textile analysis tools!');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Signup successful! Welcome to ThreadCounty.',
      token,
      user
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
       res.status(400).json({ error: 'Email and password are required.' });
       return;
    }

    const user = await db.getProfileByEmail(email);
    if (!user) {
       res.status(401).json({ error: 'Invalid email or password.' });
       return;
    }

    const passwordHash = await db.getUserPasswordHash(user.id);
    if (!passwordHash) {
       res.status(401).json({ error: 'Invalid email or password.' });
       return;
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
       res.status(401).json({ error: 'Invalid email or password.' });
       return;
    }

    // Set token expiry based on rememberMe
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Login successful.',
      token,
      user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP/Link
router.post('/forgot-password', async (req, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
       res.status(400).json({ error: 'Email is required.' });
       return;
    }

    const user = await db.getProfileByEmail(email);
    if (!user) {
      // Return 200 to prevent user enumeration, but simulate sending link
       res.json({ message: 'If the email exists, a password reset link has been sent.' });
       return;
    }

    // Generate a quick mock token or code (e.g. 123456)
    res.json({
      message: 'Password reset code sent to email.',
      resetToken: 'rst-' + Math.random().toString(36).substr(2, 9),
      code: '528491' // fixed mock code for offline/sandbox testing
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token/code
router.post('/reset-password', async (req, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
       res.status(400).json({ error: 'Email, verification code, and new password are required.' });
       return;
    }

    const user = await db.getProfileByEmail(email);
    if (!user) {
       res.status(404).json({ error: 'User not found.' });
       return;
    }

    if (code !== '528491') {
       res.status(400).json({ error: 'Invalid or expired verification code.' });
       return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.updatePassword(user.id, passwordHash);

    await db.createNotification(user.id, 'Password Changed', 'Your account password has been successfully reset.');

    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during password reset.' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Simulate email verification
router.post('/verify-email', async (req, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
       res.status(400).json({ error: 'Email and verification code are required.' });
       return;
    }

    if (code !== '123456') {
       res.status(400).json({ error: 'Invalid verification code.' });
       return;
    }

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
