# ThreadCounty - Quick Start Guide
## Get Started in 30 Minutes

---

## PHASE 1: PROJECT INITIALIZATION (5 minutes)

### 1. Create Project Structure
```bash
mkdir threadcounty-platform
cd threadcounty-platform

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Create directories
mkdir frontend backend database docs
```

### 2. Setup Frontend (Next.js)
```bash
cd frontend

# Create Next.js project
npx create-next-app@latest . --typescript --tailwind

# Install additional dependencies
npm install axios react-dropzone react-hook-form zod @hookform/resolvers
npm install framer-motion lucide-react @radix-ui/react-dialog
npm install zustand js-cookie next-auth @supabase/supabase-js

cd ..
```

### 3. Setup Backend (Express)
```bash
cd backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors helmet dotenv bcrypt jsonwebtoken
npm install @supabase/supabase-js cookie-parser express-rate-limit
npm install nodemailer winston multer sharp uuid
npm install --save-dev @types/express @types/node typescript ts-node
npm install --save-dev jest @types/jest supertest

# Create TypeScript config
npx tsc --init

cd ..
```

---

## PHASE 2: ENVIRONMENT SETUP (5 minutes)

### 1. Create .env Files

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=ThreadCounty
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**backend/.env**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/threadcounty

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

NODE_ENV=development
LOG_LEVEL=debug
```

### 2. Create Supabase Project
```bash
# Go to https://supabase.com
# Create new project
# Get credentials and add to .env files
```

---

## PHASE 3: DATABASE SETUP (10 minutes)

### 1. Supabase Console
```sql
-- Open Supabase SQL Editor and paste schema from main guide

-- Create all tables:
-- 1. users
-- 2. profiles
-- 3. subscriptions
-- 4. uploads
-- 5. reports
-- 6. contact_messages
-- 7. notifications
-- 8. activity_logs
-- 9. analytics
-- 10. admin_audit_logs

-- Set up Row Level Security (RLS)
-- Create Storage buckets:
-- - uploads (public)
-- - avatars (public)
-- - reports (private)
```

### 2. Supabase Storage Buckets
```bash
# In Supabase Console:
# Create buckets:
1. uploads
   - Public: Yes
   - File size limit: 50MB
   
2. avatars
   - Public: Yes
   - File size limit: 10MB
   
3. reports
   - Public: No
   - File size limit: 50MB
```

---

## PHASE 4: BACKEND CORE SETUP (10 minutes)

### 1. Create Project Structure
```bash
backend/src/
├── config/
│   ├── database.ts
│   ├── supabase.ts
│   └── environment.ts
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── uploadController.ts
│   └── reportController.ts
├── routes/
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── uploadRoutes.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── errorHandler.ts
├── services/
│   ├── authService.ts
│   ├── uploadService.ts
│   └── reportService.ts
├── utils/
│   ├── validators.ts
│   ├── logger.ts
│   └── helpers.ts
└── index.ts
```

### 2. Create index.ts (Entry Point)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Routes (add as you build)
// app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### 3. Update package.json Scripts
```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

### 4. Test Backend
```bash
cd backend
npm run dev

# Should output: Server running on port 5000
# Test: curl http://localhost:5000/health
```

---

## PHASE 5: FRONTEND CORE SETUP (5 minutes)

### 1. Update next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project.supabase.co',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Create Core Hooks
```typescript
// hooks/useAuth.ts - Basic structure
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // API call
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  return { user, login, loading };
}
```

### 3. Create Layout
```typescript
// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Test Frontend
```bash
cd frontend
npm run dev

# Should run on http://localhost:3000
```

---

## PHASE 6: IMPLEMENTATION CHECKLIST

### Backend Endpoints to Build
```
Authentication
POST   /api/auth/signup         - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
POST   /api/auth/refresh-token   - Refresh JWT token

Users
GET    /api/users/profile        - Get user profile
PUT    /api/users/profile        - Update profile
POST   /api/users/avatar         - Upload avatar
POST   /api/users/password       - Change password
DELETE /api/users/account        - Delete account
GET    /api/users/activity       - Get activity log
GET    /api/users/notifications  - Get notifications

Uploads
POST   /api/uploads              - Upload image
GET    /api/uploads              - Get user uploads
DELETE /api/uploads/:id          - Delete upload
GET    /api/uploads/:id/details  - Get upload details

Reports
POST   /api/reports/:uploadId/analyze  - Analyze image
GET    /api/reports/:id                - Get report
GET    /api/reports                    - Get user reports
DELETE /api/reports/:id                - Delete report
POST   /api/reports/:id/share          - Share report
GET    /api/reports/shared/:token      - View shared report
GET    /api/reports/:id/pdf            - Download PDF

Admin
GET    /api/admin/users          - List all users
GET    /api/admin/uploads        - List all uploads
GET    /api/admin/analytics      - Get platform analytics
GET    /api/admin/subscriptions  - Manage subscriptions
```

### Frontend Pages to Build
```
Public Pages
/                    - Landing page
/about              - About page
/pricing            - Pricing page
/faq                - FAQ page
/contact            - Contact page
/blog               - Blog page

Authentication Pages
/login              - Login form
/signup             - Registration form
/forgot-password    - Password recovery
/reset-password     - Set new password
/verify-email       - Email verification

Dashboard Pages
/dashboard          - Main dashboard
/upload             - Upload new image
/history            - View all uploads
/reports/:id        - View report details
/reports/shared/:token - View shared report
/profile            - User profile
/settings           - Settings page
/subscription       - Manage subscription

Admin Pages
/admin/dashboard    - Admin dashboard
/admin/users        - Manage users
/admin/uploads      - Manage uploads
/admin/analytics    - View analytics
/admin/subscriptions - Manage subscriptions
```

---

## PHASE 7: GIT SETUP

### 1. Create .gitignore
```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
.next/
out/
.DS_Store
*.pem
.vercel
.output
.cache/
*.log
.vscode/
.idea/
```

### 2. Initial Commit
```bash
git add .
git commit -m "Initial project setup with Next.js and Express"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/threadcounty-platform
git push -u origin main
```

---

## PHASE 8: DAILY DEVELOPMENT WORKFLOW

### Morning Startup
```bash
# Frontend Terminal 1
cd frontend
npm run dev
# Runs on http://localhost:3000

# Backend Terminal 2
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Common Development Commands
```bash
# Restart services
Ctrl+C (stop)
npm run dev (restart)

# Check linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm start
```

### Git Workflow (Daily)
```bash
# Check status
git status

# Add changes
git add .
git commit -m "Feature: Add login functionality"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main
```

---

## PHASE 9: TESTING CHECKLIST

### Manual Testing
- [ ] Backend health check: `curl http://localhost:5000/health`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] API calls work with Postman
- [ ] Database queries execute
- [ ] Authentication flows work
- [ ] File uploads succeed
- [ ] Reports generate
- [ ] Admin dashboard functions

### Automated Testing
```bash
# Run tests
npm test

# Generate coverage
npm test -- --coverage
```

---

## PHASE 10: MONITORING TOOLS

### Useful Tools for Development
```bash
# API Testing
npm install -g postman  # or use Postman desktop app

# Database Management
# Use Supabase dashboard

# Error Tracking
# Setup Sentry account

# Performance Monitoring
# Use Google PageSpeed Insights

# Code Quality
npm install -g eslint prettier
```

---

## TROUBLESHOOTING

### Port Already in Use
```bash
# Frontend port 3000
lsof -i :3000
kill -9 <PID>

# Backend port 5000
lsof -i :5000
kill -9 <PID>
```

### Database Connection Issues
```
1. Verify SUPABASE_URL is correct
2. Check SUPABASE_SERVICE_KEY
3. Ensure internet connection
4. Test in Supabase console first
```

### API Connection Issues
```
1. Check NEXT_PUBLIC_API_URL matches backend URL
2. Verify CORS is configured
3. Check network tab in browser dev tools
4. Verify JWT token is being sent
```

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## NEXT STEPS

1. **Complete Backend APIs** (3-4 hours)
   - Follow backend section in main guide
   - Test each endpoint with Postman

2. **Build Frontend Pages** (4-5 hours)
   - Create all pages listed above
   - Integrate with backend APIs

3. **Database & Security** (2-3 hours)
   - Set up RLS policies
   - Test authentication flows
   - Verify data privacy

4. **Testing & QA** (2 hours)
   - Test all features
   - Cross-browser testing
   - Mobile responsiveness

5. **Deployment** (1-2 hours)
   - Deploy frontend to Vercel
   - Deploy backend to Render
   - Configure production environment

---

**Total Estimated Time: 20-25 hours for complete implementation**

Good Luck! 🚀
