# ThreadCounty - Complete Full-Stack Implementation Guide
## Production-Ready Development Roadmap

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Complete Tech Stack](#complete-tech-stack)
3. [Project Architecture](#project-architecture)
4. [Database Schema & Supabase Setup](#database-schema)
5. [Backend API Development](#backend-api-development)
6. [Frontend Completion & Integration](#frontend-completion)
7. [Authentication & Security](#authentication--security)
8. [Deployment Guide](#deployment-guide)
9. [Testing & Quality Assurance](#testing--qa)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Analytics](#monitoring--analytics)

---

## PROJECT OVERVIEW

### ThreadCounty: AI-Powered Textile Technology Platform

**Purpose**: Enable textile manufacturers, students, researchers, and QC professionals to analyze fabric structures using AI and Computer Vision.

**MVP Features**:
- Professional SaaS landing page
- Secure authentication system
- User dashboard
- Image upload & analysis
- AI-powered reports
- Subscription management
- Admin panel
- Responsive design

**Target Launch Date**: Production-ready within hackathon deadline

---

## COMPLETE TECH STACK

### Frontend Stack
```
- Framework: Next.js 14+ (React 18+)
- Language: TypeScript
- Styling: Tailwind CSS 3.4+
- UI Components: ShadCN UI
- Animations: Framer Motion
- State Management: Zustand or React Context
- HTTP Client: Axios/Fetch with interceptors
- Form Management: React Hook Form
- Validation: Zod or Yup
- Icons: Lucide React or Heroicons
- Image Optimization: Next.js Image component
- Charts: Recharts or Chart.js
- PDF Export: jsPDF or React-PDF
- File Upload: react-dropzone
- Authentication: Supabase Auth + JWT
- Deployment: Vercel
```

### Backend Stack
```
- Runtime: Node.js 18+
- Framework: Express.js 4.18+
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth + JWT verification
- File Storage: Supabase Storage
- Email Service: Nodemailer or SendGrid
- API Documentation: Swagger/OpenAPI
- Middleware: CORS, Helmet, Rate Limiting
- Validation: Express Validator or Joi
- Logging: Winston or Pino
- Error Handling: Custom error classes
- Testing: Jest + Supertest
- Deployment: Render, Railway, or AWS
```

### Database
```
- Primary: Supabase (PostgreSQL)
- Real-time: Supabase Realtime
- Auth: Supabase Auth
- Storage: Supabase Storage
- Caching: Redis (optional, for scaling)
```

### DevOps & Tools
```
- Version Control: Git + GitHub
- Environment: .env files
- Package Manager: npm/yarn
- Task Runner: npm scripts
- Code Quality: ESLint + Prettier
- Pre-commit: Husky
- CI/CD: GitHub Actions
- Monitoring: Sentry (error tracking)
- Analytics: Vercel Analytics + Google Analytics
```

---

## PROJECT ARCHITECTURE

### Folder Structure

```
threadcounty-platform/
├── frontend/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── verify-email/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── upload/page.tsx
│   │   │   │   ├── history/page.tsx
│   │   │   │   ├── reports/[id]/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx (landing)
│   │   │   │   ├── about/page.tsx
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   ├── contact/page.tsx
│   │   │   │   ├── faq/page.tsx
│   │   │   │   └── blog/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── images/page.tsx
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── subscriptions/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── proxy/[...path]/route.ts (API proxy)
│   │   │   │   └── webhooks/route.ts
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── ActivityTimeline.tsx
│   │   │   │   ├── StorageChart.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── upload/
│   │   │   │   ├── DropZone.tsx
│   │   │   │   ├── ImagePreview.tsx
│   │   │   │   ├── UploadProgress.tsx
│   │   │   │   └── ValidationError.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportViewer.tsx
│   │   │   │   ├── AIAnalysis.tsx
│   │   │   │   ├── ReportDownload.tsx
│   │   │   │   └── ReportShare.tsx
│   │   │   ├── admin/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── AnalyticsCard.tsx
│   │   │   │   └── ImageGallery.tsx
│   │   │   └── landing/
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── Testimonials.tsx
│   │   │       ├── Pricing.tsx
│   │   │       ├── FAQ.tsx
│   │   │       └── CTA.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useUpload.ts
│   │   │   ├── useReports.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts (Axios instance)
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── subscription.service.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── storage.ts
│   │   ├── types/
│   │   │   ├── index.ts (global types)
│   │   │   ├── auth.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── upload.types.ts
│   │   │   └── report.types.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.css
│   │   └── middleware.ts (Next.js middleware)
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── .env.local
│   ├── .env.example
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── README.md
│
├── backend/                       # Express.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── supabase.ts
│   │   │   ├── environment.ts
│   │   │   └── constants.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── uploadController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── subscriptionController.ts
│   │   │   ├── adminController.ts
│   │   │   └── contactController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── uploadRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   ├── subscriptionRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── cors.ts
│   │   │   └── logging.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── uploadService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── subscriptionService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── storageService.ts
│   │   │   └── aiService.ts (mock or real)
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── helpers.ts
│   │   │   ├── formatters.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── logger.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── express.d.ts (extend Express)
│   │   │   └── database.types.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── index.ts (app entry point)
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── user.test.ts
│   │   └── upload.test.ts
│   ├── .env.example
│   ├── .env
│   ├── tsconfig.json
│   ├── package.json
│   ├── jest.config.js
│   └── README.md
│
├── database/
│   ├── schema.sql
│   ├── migrations/
│   ├── seeds/
│   └── backup/
│
├── docs/
│   ├── API-DOCUMENTATION.md
│   ├── DATABASE-SCHEMA.md
│   ├── DEPLOYMENT.md
│   ├── SETUP.md
│   └── ARCHITECTURE.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-frontend.yml
│   │   └── deploy-backend.yml
│   └── ISSUE_TEMPLATE/
│
├── .gitignore
├── README.md
└── package.json (root)
```

---

## DATABASE SCHEMA

### Complete Supabase Setup

#### 1. Users Table (Managed by Supabase Auth)
```sql
-- Note: Supabase Auth creates 'auth.users' automatically
-- We create a public users profile table

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  organization VARCHAR(255),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);
```

#### 2. User Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  zip_code VARCHAR(20),
  company_name VARCHAR(255),
  job_title VARCHAR(100),
  industry VARCHAR(100),
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  preferences JSONB DEFAULT '{
    "theme": "light",
    "notifications": true,
    "email_marketing": false,
    "language": "en"
  }'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
```

#### 3. Subscriptions Table
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  plan ENUM('free', 'student', 'professional', 'enterprise') DEFAULT 'free',
  status ENUM('active', 'cancelled', 'expired', 'pending') DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  renewal_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  features JSONB DEFAULT '{
    "uploads_per_month": 10,
    "storage_gb": 5,
    "api_calls": 100,
    "advanced_analytics": false,
    "priority_support": false
  }'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
```

#### 4. Uploads Table
```sql
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  bucket_name VARCHAR(100) DEFAULT 'uploads',
  image_width INTEGER,
  image_height INTEGER,
  mime_type VARCHAR(100),
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_status ON public.uploads(status);
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at DESC);
CREATE INDEX idx_uploads_deleted_at ON public.uploads(deleted_at);
```

#### 5. Reports Table
```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50),
  
  -- Thread Analysis Data
  thread_density JSONB DEFAULT '{
    "warp": {"value": 0, "unit": "threads/cm"},
    "weft": {"value": 0, "unit": "threads/cm"},
    "confidence": 0
  }'::JSONB,
  warp_count INTEGER,
  weft_count INTEGER,
  fabric_type VARCHAR(100),
  
  -- AI Analysis
  ai_insights TEXT,
  confidence_score DECIMAL(5, 2),
  analysis_metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Processing
  processing_time_ms INTEGER,
  model_version VARCHAR(50),
  
  -- Report Details
  report_title VARCHAR(255),
  report_summary TEXT,
  recommendations TEXT,
  quality_score DECIMAL(5, 2),
  
  -- Sharing & Download
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(100) UNIQUE,
  share_expires_at TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  
  -- Status
  status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
  error_details TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_upload_id ON public.reports(upload_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_share_token ON public.reports(share_token);
```

#### 6. Contact Messages Table
```sql
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status ENUM('new', 'read', 'responded') DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMP,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contact_email ON public.contact_messages(email);
CREATE INDEX idx_contact_status ON public.contact_messages(status);
CREATE INDEX idx_contact_created_at ON public.contact_messages(created_at DESC);
```

#### 7. Notifications Table
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
```

#### 8. Activity Log Table
```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_action ON public.activity_logs(action);
CREATE INDEX idx_activity_created_at ON public.activity_logs(created_at DESC);
```

#### 9. Analytics Table
```sql
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL,
  metric_value BIGINT,
  details JSONB DEFAULT '{}'::JSONB,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_metric_type ON public.analytics(metric_type);
CREATE INDEX idx_analytics_date ON public.analytics(date);
```

#### 10. Admin Audit Log Table
```sql
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changes JSONB DEFAULT '{}'::JSONB,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_audit_created_at ON public.admin_audit_logs(created_at DESC);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

-- Public reports can be viewed by anyone (with share_token)
CREATE POLICY "Public reports viewable by share token" ON public.reports
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## BACKEND API DEVELOPMENT

### 1. Authentication API

#### Setup Files

**`backend/src/services/authService.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
}

interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  // Register new user
  async signUp(payload: SignUpPayload) {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.full_name,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: payload.email,
          full_name: payload.full_name,
        });

      if (profileError) throw profileError;

      // Create subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: data.user?.id,
          plan: 'free',
          status: 'active',
        });

      if (subError) throw subError;

      return {
        success: true,
        message: 'Signup successful. Please verify your email.',
        user: data.user,
      };
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  },

  // Login user
  async login(payload: LoginPayload) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (error) throw error;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date() })
        .eq('id', data.user?.id);

      // Generate custom JWT if needed
      const token = jwt.sign(
        {
          sub: data.user?.id,
          email: data.user?.email,
          iat: Date.now(),
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        user: data.user,
        session: data.session,
        customToken: token,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  // Logout user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  },

  // Forgot password
  async forgotPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset link sent to email',
      };
    } catch (error) {
      throw new Error(`Reset password failed: ${error.message}`);
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new Error(`Password update failed: ${error.message}`);
    }
  },

  // Verify email
  async verifyEmail(token: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  },

  // Verify token
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },
};
```

**`backend/src/controllers/authController.ts`**
```typescript
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validators';

export const authController = {
  // Sign up handler
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      // Validation
      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message:
            'Password must be at least 8 characters with uppercase, lowercase, and number',
        });
      }

      const result = await authService.signUp({
        email,
        password,
        full_name,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Login handler
  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password required',
        });
      }

      const result = await authService.login({ email, password, rememberMe });

      // Set secure HTTP-only cookie
      if (rememberMe) {
        res.cookie('authToken', result.customToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Logout handler
  async logout(req: Request, res: Response) {
    try {
      const result = await authService.logout();
      res.clearCookie('authToken');
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Forgot password handler
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Reset password handler
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password required',
        });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            'Password must be at least 8 characters with uppercase, lowercase, and number',
        });
      }

      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Verify email handler
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token required',
        });
      }

      const result = await authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Refresh token handler
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Verify and refresh
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw error;

      res.status(200).json({
        success: true,
        session: data.session,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
};
```

**`backend/src/routes/authRoutes.ts`**
```typescript
import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);

export default router;
```

### 2. Upload API

**`backend/src/services/uploadService.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface UploadFilePayload {
  userId: string;
  file: Express.Multer.File;
  bucketName?: string;
}

export const uploadService = {
  async uploadFile(payload: UploadFilePayload) {
    try {
      const { userId, file, bucketName = 'uploads' } = payload;

      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new Error('Only JPG, JPEG, PNG files are allowed');
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 50MB limit');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = uuidv4();
      const ext = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${randomId}.${ext}`;
      const filePath = `${userId}/${fileName}`;

      // Generate thumbnail
      const thumbnail = await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .toBuffer();

      // Upload main file
      const { error: uploadError, data: uploadData } =
        await supabase.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
          });

      if (uploadError) throw uploadError;

      // Upload thumbnail
      const { data: thumbData } = await supabase.storage
        .from(bucketName)
        .upload(`${userId}/thumbnails/${fileName}`, thumbnail, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      // Get public URLs
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const { data: thumbUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`${userId}/thumbnails/${fileName}`);

      // Get image dimensions
      const metadata = await sharp(file.buffer).metadata();

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: userId,
          filename: fileName,
          original_filename: file.originalname,
          file_size: file.size,
          file_type: file.mimetype,
          file_path: filePath,
          bucket_name: bucketName,
          mime_type: file.mimetype,
          image_width: metadata.width,
          image_height: metadata.height,
          storage_url: urlData.publicUrl,
          thumbnail_url: thumbUrlData.publicUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        success: true,
        data: dbData,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  async deleteFile(uploadId: string, userId: string) {
    try {
      // Get file info
      const { data: fileData, error: fetchError } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !fileData) {
        throw new Error('File not found');
      }

      // Delete from storage
      await supabase.storage
        .from(fileData.bucket_name)
        .remove([fileData.file_path]);

      await supabase.storage
        .from(fileData.bucket_name)
        .remove([`${userId}/thumbnails/${fileData.filename}`]);

      // Soft delete from database
      const { error: deleteError } = await supabase
        .from('uploads')
        .update({ deleted_at: new Date() })
        .eq('id', uploadId);

      if (deleteError) throw deleteError;

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  async getUploadsByUser(userId: string, limit = 20, offset = 0) {
    try {
      const { data, count, error } = await supabase
        .from('uploads')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      throw new Error(`Fetch failed: ${error.message}`);
    }
  },
};
```

**`backend/src/controllers/uploadController.ts`**
```typescript
import { Request, Response } from 'express';
import { uploadService } from '../services/uploadService';

export const uploadController = {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      const result = await uploadService.uploadFile({
        userId: req.user!.id,
        file: req.file,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async deleteUpload(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;

      const result = await uploadService.deleteFile(uploadId, req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUploads(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await uploadService.getUploadsByUser(
        req.user!.id,
        limit,
        offset
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
```

### 3. Report & AI Analysis API

**`backend/src/services/reportService.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface AnalysisPayload {
  uploadId: string;
  userId: string;
}

// Mock AI Analysis (replace with real model)
async function performAIAnalysis(imagePath: string) {
  // Simulate AI processing
  return {
    thread_density: {
      warp: {
        value: Math.floor(Math.random() * 40) + 10,
        unit: 'threads/cm',
      },
      weft: {
        value: Math.floor(Math.random() * 40) + 10,
        unit: 'threads/cm',
      },
      confidence: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
    },
    warp_count: Math.floor(Math.random() * 500) + 100,
    weft_count: Math.floor(Math.random() * 500) + 100,
    fabric_type: ['Cotton', 'Wool', 'Silk', 'Polyester'][
      Math.floor(Math.random() * 4)
    ],
    quality_score: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
    ai_insights:
      'High-quality fabric with excellent thread density. Recommended for premium applications.',
    processing_time_ms: Math.floor(Math.random() * 5000) + 1000,
    model_version: 'v1.0',
  };
}

export const reportService = {
  async analyzeImage(payload: AnalysisPayload) {
    try {
      const { uploadId, userId } = payload;

      // Get upload details
      const { data: uploadData, error: uploadError } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('user_id', userId)
        .single();

      if (uploadError || !uploadData) {
        throw new Error('Upload not found');
      }

      // Perform analysis
      const analysisResult = await performAIAnalysis(uploadData.storage_url);

      // Save report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          upload_id: uploadId,
          thread_density: analysisResult.thread_density,
          warp_count: analysisResult.warp_count,
          weft_count: analysisResult.weft_count,
          fabric_type: analysisResult.fabric_type,
          ai_insights: analysisResult.ai_insights,
          confidence_score: analysisResult.thread_density.confidence,
          quality_score: analysisResult.quality_score,
          processing_time_ms: analysisResult.processing_time_ms,
          model_version: analysisResult.model_version,
          report_title: `Analysis Report - ${uploadData.original_filename}`,
          status: 'completed',
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Update upload status
      await supabase
        .from('uploads')
        .update({ status: 'completed' })
        .eq('id', uploadId);

      return {
        success: true,
        data: reportData,
        message: 'Analysis completed successfully',
      };
    } catch (error) {
      // Update upload status to failed
      await supabase
        .from('uploads')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', payload.uploadId);

      throw new Error(`Analysis failed: ${error.message}`);
    }
  },

  async getReportById(reportId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(
          `
        *,
        uploads:upload_id(*)
      `
        )
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new Error(`Fetch failed: ${error.message}`);
    }
  },

  async getReportsByUser(userId: string, limit = 20, offset = 0) {
    try {
      const { data, count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    } catch (error) {
      throw new Error(`Fetch failed: ${error.message}`);
    }
  },

  async generatePDFReport(reportId: string, userId: string) {
    try {
      // Get report data
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select(
          `
        *,
        uploads:upload_id(*)
      `
        )
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (reportError || !reportData) {
        throw new Error('Report not found');
      }

      // Generate PDF (using node-pdf-generator or similar)
      // This is a placeholder - implement with actual PDF library
      const pdfContent = `
        THREADCOUNTY ANALYSIS REPORT
        =============================
        Date: ${new Date().toLocaleDateString()}
        Report ID: ${reportId}
        
        ANALYSIS RESULTS:
        Warp Count: ${reportData.warp_count}
        Weft Count: ${reportData.weft_count}
        Fabric Type: ${reportData.fabric_type}
        Quality Score: ${reportData.quality_score}
        
        AI INSIGHTS:
        ${reportData.ai_insights}
      `;

      return {
        success: true,
        data: pdfContent,
        message: 'PDF generated successfully',
      };
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  },

  async shareReport(reportId: string, userId: string) {
    try {
      const shareToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data, error } = await supabase
        .from('reports')
        .update({
          is_public: true,
          share_token: shareToken,
          share_expires_at: expiresAt,
        })
        .eq('id', reportId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        shareUrl: `${process.env.FRONTEND_URL}/reports/shared/${shareToken}`,
      };
    } catch (error) {
      throw new Error(`Share failed: ${error.message}`);
    }
  },

  async viewSharedReport(shareToken: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .gt('share_expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      // Increment download count
      await supabase
        .from('reports')
        .update({
          download_count: (data.download_count || 0) + 1,
        })
        .eq('id', data.id);

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new Error(`View shared report failed: ${error.message}`);
    }
  },
};
```

### 4. User Management API

**`backend/src/services/userService.ts`** (Key parts)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
        *,
        profiles(*),
        subscriptions(*)
      `
        )
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new Error(`Fetch profile failed: ${error.message}`);
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
          updated_at: new Date(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  },

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      // Upload to Supabase Storage
      const fileName = `${userId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user
      const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        avatarUrl: urlData.publicUrl,
      };
    } catch (error) {
      throw new Error(`Upload avatar failed: ${error.message}`);
    }
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // Verify old password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: '', // Get email from user
        password: oldPassword,
      });

      if (signInError) {
        throw new Error('Old password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  },

  async deleteAccount(userId: string) {
    try {
      // Soft delete - mark as suspended
      const { error } = await supabase
        .from('users')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      throw new Error(`Delete account failed: ${error.message}`);
    }
  },

  async getActivityLog(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new Error(`Fetch activity log failed: ${error.message}`);
    }
  },

  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      throw new Error(`Fetch notifications failed: ${error.message}`);
    }
  },

  async markNotificationsAsRead(userId: string, notificationIds: string[]) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date() })
        .eq('user_id', userId)
        .in('id', notificationIds);

      if (error) throw error;

      return {
        success: true,
        message: 'Notifications marked as read',
      };
    } catch (error) {
      throw new Error(`Mark as read failed: ${error.message}`);
    }
  },
};
```

### 5. Authentication Middleware

**`backend/src/middleware/auth.middleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from headers
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Get user role from database
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email || '',
      role: userData?.role || 'user',
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
};

// Admin middleware
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies.authToken;

    if (token) {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', user.id)
          .single();

        req.user = {
          id: user.id,
          email: user.email || '',
          role: userData?.role || 'user',
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
```

### 6. Complete Express App Setup

**`backend/src/index.ts`**
```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import reportRoutes from './routes/reportRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import adminRoutes from './routes/adminRoutes';
import contactRoutes from './routes/contactRoutes';

import { authMiddleware, adminMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import swaggerSpec from './config/swagger';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/uploads', authMiddleware, uploadRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
});

export default app;
```

---

## FRONTEND COMPLETION

### 1. Authentication Pages Setup

**`frontend/src/app/(auth)/login/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password, data.rememberMe);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to ThreadCounty
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <Checkbox {...register('rememberMe')} />
                <span className="ml-2 text-sm">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <LoadingSpinner /> : 'Sign In'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-600 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**`frontend/src/app/(dashboard)/upload/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/hooks/useUpload';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { UploadProgress } from '@/components/upload/UploadProgress';

export default function UploadPage() {
  const { uploadFile, isLoading, progress } = useUpload();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: async (acceptedFiles) => {
      try {
        setError(null);
        const file = acceptedFiles[0];

        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        const result = await uploadFile(file);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = `/reports/${result.id}`;
        }, 2000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Upload failed'
        );
      }
    },
    onDropReject: () => {
      setError('Only JPG, JPEG, PNG files up to 50MB are allowed');
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Upload Fabric Image</h1>

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-8">
          Upload successful! Redirecting to analysis...
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-8">
              {error}
            </div>
          )}

          <div
            {...getRootProps()}
            className="border-4 border-dashed border-indigo-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 transition"
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl font-semibold mb-2">
              Drag and drop your fabric image
            </p>
            <p className="text-gray-600 mb-4">
              or click to select file (JPG, PNG up to 50MB)
            </p>
          </div>

          {preview && <ImagePreview src={preview} />}

          {isLoading && <UploadProgress progress={progress} />}

          {preview && !isLoading && (
            <Button
              onClick={() => setPreview(null)}
              variant="outline"
              className="mt-4"
            >
              Clear Preview
            </Button>
          )}
        </>
      )}
    </div>
  );
}
```

**`frontend/src/app/(dashboard)/dashboard/page.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { StorageChart } from '@/components/dashboard/StorageChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, stats, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Welcome, {user?.full_name}!</h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your fabric analysis
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Uploads"
          value={stats?.totalUploads || 0}
          icon="📁"
          trend="+12%"
        />
        <StatCard
          title="Reports Generated"
          value={stats?.totalReports || 0}
          icon="📊"
          trend="+8%"
        />
        <StatCard
          title="Storage Used"
          value={`${stats?.storageUsed || 0} MB`}
          icon="💾"
          trend={`${stats?.storagePercent || 0}%`}
        />
        <StatCard
          title="API Calls"
          value={stats?.apiCalls || 0}
          icon="⚡"
          trend="Current month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StorageChart data={stats?.storageData} />
        <ActivityTimeline activities={stats?.activities} />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Reports</h2>
        {stats?.recentReports && stats.recentReports.length > 0 ? (
          <div className="space-y-4">
            {stats.recentReports.map((report: any) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold">{report.report_title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/reports/${report.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reports yet</p>
        )}
      </div>
    </div>
  );
}
```

### 2. Key Components

**`frontend/src/hooks/useAuth.ts`**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const router = useRouter();
  const { setUser, setToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/login', {
          email,
          password,
          rememberMe,
        });

        const { user, customToken } = response.data;

        setUser(user);
        setToken(customToken);

        localStorage.setItem('authToken', customToken);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        return user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setToken]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post('/auth/signup', {
          email,
          password,
          full_name: fullName,
        });

        return response.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Signup failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [setUser, setToken, router]);

  return {
    login,
    signup,
    logout,
    isLoading,
    error,
  };
}
```

**`frontend/src/context/AuthContext.tsx`**
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsHydrated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        isAuthenticated: !!token && !!user,
      }}
    >
      {isHydrated && children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

**`frontend/src/services/api.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## AUTHENTICATION & SECURITY

### 1. JWT Implementation
```typescript
// JWT Token Structure
{
  sub: "user-id",
  email: "user@example.com",
  role: "user" | "admin",
  iat: 1234567890,
  exp: 1234671490,
  refresh_token: "refresh-token-hash"
}
```

### 2. Password Security
```typescript
// Use bcrypt for password hashing
import bcrypt from 'bcrypt';

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 3. CORS Configuration
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### 4. Rate Limiting
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  skip: (req) => req.user?.role === 'admin',
});
```

---

## DEPLOYMENT GUIDE

### Frontend (Vercel)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Vercel Setup**
```bash
npm i -g vercel
vercel --prod
```

3. **Environment Variables in Vercel**
```
NEXT_PUBLIC_API_URL=https://threadcounty-api.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Render)

1. **Create Render Account** and connect GitHub

2. **Create New Web Service**
   - Select repository
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Add Environment Variables**
```
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key
JWT_SECRET=your-secret
NODE_ENV=production
FRONTEND_URL=https://threadcounty.vercel.app
```

4. **Deploy**
```bash
git push origin main
```

### Database (Supabase)

1. **Create Project** on Supabase
2. **Run Schema** in SQL Editor
3. **Set up Row Level Security**
4. **Configure Storage Buckets**

---

## TESTING & QA

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```typescript
// Example test
describe('Auth API', () => {
  it('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## MONITORING & ANALYTICS

### Error Tracking (Sentry)
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics (Google Analytics)
```typescript
// In _document.tsx
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
/>
```

---

## PERFORMANCE OPTIMIZATION

### Frontend
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Caching strategies
- CDN for static assets

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Redis caching for frequently accessed data

---

## COMPLETE SETUP INSTRUCTIONS

### 1. Clone & Setup
```bash
git clone <repo>
cd threadcounty-platform

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Backend (new terminal)
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Database Setup
- Create Supabase account
- Create project
- Run all SQL queries from schema
- Set up storage buckets

### 3. Environment Variables Setup

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

---

## CHECKLIST FOR COMPLETION

### Backend
- [ ] All API endpoints implemented
- [ ] Authentication & Authorization
- [ ] Database schema with RLS
- [ ] Error handling & validation
- [ ] API documentation
- [ ] Testing setup

### Frontend
- [ ] All pages created
- [ ] Responsive design
- [ ] Authentication flows
- [ ] Dashboard complete
- [ ] Upload functionality
- [ ] Report generation & download
- [ ] Dark mode support

### DevOps
- [ ] GitHub repository setup
- [ ] CI/CD pipeline
- [ ] Environment configuration
- [ ] Database migrations
- [ ] Deployment to Vercel/Render

### Documentation
- [ ] README.md
- [ ] API Documentation
- [ ] Database Schema
- [ ] Deployment Guide
- [ ] Architecture Diagram

---

## FINAL DEPLOYMENT CHECKLIST

Before launching to production:

```markdown
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Frontend tested in production build
- [ ] SSL certificates configured
- [ ] Backups scheduled
- [ ] Error monitoring setup
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] GDPR compliance checked
- [ ] Privacy policy added
- [ ] Terms of service added
```

---

## ADDITIONAL RESOURCES

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Guide**: https://expressjs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**CORS Error**
- Check backend CORS configuration
- Verify FRONTEND_URL environment variable

**Database Connection**
- Verify SUPABASE_URL and KEY
- Check database is running
- Review RLS policies

**Authentication Failing**
- Verify JWT_SECRET is set
- Check token expiration
- Review Supabase Auth settings

---

**This guide provides everything needed to build a production-ready ThreadCounty platform. Follow each section systematically for successful implementation.**

Generated: 2024
Version: 1.0
