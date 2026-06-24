import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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
import { requestLogger } from './middleware/logger';
import { authRateLimiter, uploadRateLimiter, contactRateLimiter } from './middleware/rateLimiter';
import db from './models/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For hackathon purposes, allow all connections
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global structured request logger
app.use(requestLogger);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/backend/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /dashboard/\nSitemap: http://localhost:5000/sitemap.xml`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:5173/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://localhost:5173/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://localhost:5173/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://localhost:5173/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>http://localhost:5173/contact</loc>
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
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/demo', demoRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
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
