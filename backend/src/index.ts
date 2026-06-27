import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize routers
import authRouter from './routes/auth';
import userRouter from './routes/user';
import uploadRouter from './routes/upload';
import reportRouter from './routes/report';
import dashboardRouter from './routes/dashboard';
import adminRouter from './routes/admin';
import contactRouter from './routes/contact';
import checkoutRouter from './routes/checkout';
import adminSettingsRouter from './routes/adminSettings';
import demoRouter from './routes/demo';
import chatRouter from './routes/chat';
import notificationsRouter from './routes/notifications';
import { requestLogger, logger } from './middleware/logger';
import { authRateLimiter, uploadRateLimiter, contactRateLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import db from './models/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || ''],
    }
  } : false  // Disable CSP in development
}));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());

// CORS — strict origin whitelist
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database is initialized/loaded (for serverless environments)
app.use(async (req, res, next) => {
  try {
    await db.ensureDataLoaded();
  } catch (err) {
    console.error('[Startup] Failed to ensure database is loaded:', err);
  }
  next();
});

// Global structured request logger
app.use(requestLogger);

// Serve uploaded images statically (supporting writable /tmp/uploads and packaged read-only assets)
const UPLOADS_DIR_TMP = path.join('/tmp', 'uploads');
const UPLOADS_DIR_READONLY = path.join(__dirname, '..', 'uploads');

app.use('/uploads', express.static(UPLOADS_DIR_TMP));
app.use('/uploads', express.static(UPLOADS_DIR_READONLY));

app.use('/backend/uploads', express.static(UPLOADS_DIR_TMP));
app.use('/backend/uploads', express.static(UPLOADS_DIR_READONLY));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ThreadCounty API Service',
    description: 'AI-powered fabric structure and density analysis backend',
    status: 'active',
    version: '1.0.0',
    health: '/health'
  });
});

// SEO robots.txt and sitemap.xml endpoints
app.get('/robots.txt', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const API_URL = `${protocol}://${host}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /dashboard/\nSitemap: ${API_URL}/sitemap.xml`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FRONTEND_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// Register api routes (with targeted rate limiting)
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRateLimiter, uploadRouter);
app.use('/api/report', reportRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin/settings', adminSettingsRouter); // MUST be before /api/admin
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/demo', demoRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  logger.error('[Error Handler]', { message: err.message, stack: isDev ? err.stack : undefined });
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'An unexpected error occurred.',
    ...(isDev && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 ThreadCounty Backend Server started on port ${PORT}`);
  console.log(`📂 Serviced uploads path: http://localhost:${PORT}/uploads`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  console.log(`=================================================`);

  // Run initial demo cleanup on startup
  db.cleanupExpiredDemoData().catch(err => {
    console.error('[Startup] Failed to run initial demo cleanup:', err);
  });

  // Start periodic demo cleanup worker (every 10 minutes)
  setInterval(() => {
    db.cleanupExpiredDemoData().catch(err => {
      console.error('[Interval Worker] Failed to run demo cleanup:', err);
    });
  }, 10 * 60 * 1000);
});

export default app;
