import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../models/db';
import { JWT_SECRET } from '../middleware/auth';
import { sendPasswordResetOTP, sendWelcomeEmail } from '../middleware/emailService';
import { validateRequest } from '../middleware/validation';
import { schemas } from '../config/validationSchemas';

const router = Router();

// Initialise Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ── In-memory OTP store (keyed by email, clears on use or expiry) ────────────
// In production this would be Redis or a DB table.
interface OTPRecord {
  otp: string;
  expiresAt: number; // Unix ms
  attempts: number;
}
const otpStore = new Map<string, OTPRecord>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function isOTPValid(record: OTPRecord, otp: string): boolean {
  if (Date.now() > record.expiresAt) return false;
  if (record.attempts >= 5) return false;
  return record.otp === otp;
}

// ─────────────────────────────────────────────
// @route   POST /api/auth/google
// @desc    Verify Google access token → create or login user
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
        error: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID in backend/.env and restart.'
      });
      return;
    }

    let email: string;
    let name: string | undefined;
    let picture: string | undefined;
    let googleId: string;

    if (googleUser) {
      // Implicit flow: frontend fetched userinfo from Google and sent it directly
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
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const oauthPlaceholder = `google_oauth_${googleId}`;
      user = await db.createUser(email, oauthPlaceholder, name || email.split('@')[0]);

      if (picture) {
        await db.updateProfile(user.id, { avatar_url: picture });
        user.avatar_url = picture;
      }

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, user.name).catch(err =>
        console.error('[Auth] Failed to send welcome email:', err)
      );

      await db.createNotification(
        user.id,
        'Welcome to ThreadCounty! 🎉',
        'Your account was created via Google. Explore AI-powered fabric analysis now!'
      );

      await db.generateDemoDataForUser(user.id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: isNewUser ? 'Account created via Google.' : 'Google login successful.',
      token,
      user,
      isNewUser
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

// ─────────────────────────────────────────────
// @route   POST /api/auth/signup
// @desc    Register a new user
// ─────────────────────────────────────────────
router.post('/signup', validateRequest(schemas.signup) as any, async (req: any, res: Response) => {
  try {
    const { name, email, password, company } = req.validated;

    const existingUser = await db.getProfileByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await db.createUser(email, passwordHash, name, company);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(err =>
      console.error('[Auth] Failed to send welcome email:', err)
    );

    await db.createNotification(
      user.id,
      'Welcome to ThreadCounty!',
      'Your account has been created successfully. Explore our textile analysis tools!'
    );
    await db.generateDemoDataForUser(user.id);

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

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// ─────────────────────────────────────────────
router.post('/login', validateRequest(schemas.login) as any, async (req: any, res: Response) => {
  try {
    const { email, password, rememberMe } = req.validated;

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

    // Block Google OAuth accounts from password login
    if (passwordHash.startsWith('google_oauth_')) {
      res.status(400).json({
        error: 'This account uses Google Sign-In. Please click "Continue with Google" to login.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({ message: 'Login successful.', token, user });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ─────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Send a real 6-digit OTP to the user's email via Resend
// ─────────────────────────────────────────────
router.post('/forgot-password', validateRequest(schemas.forgotPassword) as any, async (req: any, res: Response) => {
  try {
    const { email } = req.validated;

    const user = await db.getProfileByEmail(email);
    if (!user) {
      // Prevent user enumeration — always return 200
      res.json({ message: 'If that email exists, a reset code has been sent.' });
      return;
    }

    // Block Google OAuth accounts
    const passwordHash = await db.getUserPasswordHash(user.id);
    if (passwordHash?.startsWith('google_oauth_')) {
      res.status(400).json({
        error: 'This account uses Google Sign-In and does not have a password to reset.'
      });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

    // Send the OTP via Resend
    const sent = await sendPasswordResetOTP(email, user.name, otp);

    if (!sent) {
      // OTP was generated but email failed — send OTP in response for dev fallback
      console.warn('[Auth] Email sending failed. OTP for dev:', otp);
      res.json({
        message: 'Reset code generated (email delivery failed — check server logs for OTP in dev mode).',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
      return;
    }

    res.json({ message: 'A 6-digit reset code has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─────────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @desc    Reset password using the real OTP
// ─────────────────────────────────────────────
router.post('/reset-password', validateRequest(schemas.resetPassword) as any, async (req: any, res: Response) => {
  try {
    const { email, code, newPassword } = req.validated;

    const key = email.toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
      res.status(400).json({ error: 'No reset code found for this email. Please request a new one.' });
      return;
    }

    // Increment attempts before checking
    record.attempts += 1;

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
      return;
    }

    if (record.attempts > 5) {
      otpStore.delete(key);
      res.status(429).json({ error: 'Too many incorrect attempts. Please request a new reset code.' });
      return;
    }

    if (record.otp !== code.trim()) {
      res.status(400).json({
        error: `Invalid verification code. ${5 - record.attempts} attempt(s) remaining.`
      });
      return;
    }

    // OTP verified — delete it immediately (one-time use)
    otpStore.delete(key);

    const user = await db.getProfileByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.updatePassword(user.id, passwordHash);

    await db.createNotification(
      user.id,
      'Password Changed',
      'Your account password has been successfully reset. If this wasn\'t you, contact support immediately.'
    );

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error during password reset.' });
  }
});

// ─────────────────────────────────────────────
// @route   POST /api/auth/verify-email
// @desc    Verify OTP is still valid (used by frontend to check before showing reset form)
// ─────────────────────────────────────────────
router.post('/verify-otp', async (req, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required.' });
      return;
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record || Date.now() > record.expiresAt || record.otp !== code.trim()) {
      res.status(400).json({ valid: false, error: 'Invalid or expired code.' });
      return;
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─────────────────────────────────────────────
// @route   POST /api/auth/verify-email
// @desc    Legacy email verification endpoint (kept for compatibility)
// ─────────────────────────────────────────────
router.post('/verify-email', async (req, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: 'Email and verification code are required.' });
      return;
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record || !isOTPValid(record, code)) {
      res.status(400).json({ error: 'Invalid or expired verification code.' });
      return;
    }

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
