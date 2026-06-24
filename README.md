# ThreadCounty - AI-Powered Textile Technology Platform

ThreadCounty is a full-stack, SaaS-like web application designed for textile manufacturers, quality control managers, students, and researchers to automate fabric density analysis. By uploading fabric swatches, users receive instant calculations of warp and weft threads per inch (TPI), weave classifications, and AI-driven quality recommendations.

---

## 🚀 Key Features

* **Landing Page:** Interactive sliding scan preview showing density, stats, testimonials, FAQ, contact form, and about modules.
* **Authentication:** Signup, Login (with Remember Me support), Email Verification, and Forgot Password (OTP-based) views.
* **User Dashboard:** Quota consumption tracking (storage capacity), activity logs, system notifications, and a table of recent reports.
* **Drag-and-Drop Image Upload:** Drag-and-drop fabric swatch JPEG/JPG/PNG uploads, file type/size validation, and scanning progress animations.
* **AI Report Inspection:** Interactive scan overlays, warp/weft densities, weave classification, manufacturing suggestions, and PDF print exports.
* **History Log:** Search, weave filtering, sorting, report downloads, and record deletion.
* **Subscription Management:** Choose plans (Free, Student, Pro, Enterprise) and trigger celebration upgrade animations (powered by canvas-confetti).
* **Admin Dashboard:** Total system statistics, user management (promote role, override plan, delete account), and visitor inquiry logs.
* **Fabric Comparison Tool:** Side-by-side comparison of any two analysis reports — dual swatch scan previews, bar chart metric comparison (warp, weft, density, confidence), delta indicators, weave classification summary, and AI recommendations for each fabric.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite + TypeScript), Tailwind CSS v4, Lucide Icons, Framer Motion, Canvas Confetti.
* **Backend:** Node.js, Express.js, Multer (image uploads), JWT Auth, Bcrypt.js, TypeScript.
* **Database:** Supabase integration + Local JSON database fallback.

---

## 📦 Installation & Getting Started

### 📋 Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (v9 or higher)

### ⚡ One-Click Startup (Windows)
In the root directory, double-click **`run-app.bat`**. This script will start both the Express backend and the Vite frontend concurrently in separate terminal windows.

### 🔧 Manual Startup (Terminal)

#### 1. Setup Backend:
Open a terminal in the root directory:
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

#### 2. Setup Frontend:
Open a second terminal in the root directory:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The Vite development server will run on `http://localhost:5173`.

---

## 🔑 Default Testing Credentials

To test the application immediately without registration, the local database sandbox is seeded with these accounts:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Regular User** | `user@threadcounty.com` | `user123` |
| **Administrator** | `admin@threadcounty.com` | `admin123` |

---

## 🔌 Supabase Database Integration

ThreadCounty features a **dual-mode database adapter**. By default, it operates in **Local Sandbox Mode** storing data in `backend/data/db.json` and upload images in `backend/uploads/`.

To connect to a live Supabase database instance:

1. Run the database setup script in [docs/schema.sql](file:///c:/Users/ASUS/Desktop/THREADCOUNTY/THREADCOUNTY/docs/schema.sql) in your Supabase SQL Editor.
2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   JWT_SECRET=your-custom-jwt-secret-key-string
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-public-key
   ```
3. Restart the backend. It will detect the variables and route all operations directly to Supabase.

---

## 📁 Repository Directory Structure

```text
THREADCOUNTY/
├── frontend/                 # React SPA (Vite + TS + Tailwind v4)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, DashboardLayout
│   │   ├── pages/            # LandingPage, Login, Upload, Result, Admin, etc.
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── App.tsx           # Application router & Protected routes
│   │   └── main.tsx          # React mounting
│   └── vite.config.ts        # Vite config with Tailwind plugin
├── backend/                  # Node.js + Express.js API server
│   ├── src/
│   │   ├── controllers/      # Express route controllers
│   │   ├── middleware/       # JWT auth & Multer image validation
│   │   ├── models/           # DB Client & local JSON fallback db
│   │   ├── routes/           # REST endpoints
│   │   └── index.ts          # Server listener (Port 5000)
│   ├── data/                 # Local sandbox storage (db.json)
│   └── uploads/              # Stored fabric swatches
├── docs/                     # Documentation files
│   ├── schema.sql            # Supabase SQL script
│   ├── api_docs.md           # API Reference documentation
│   └── presentation.md       # PPT Pitch Deck outline
├── run-app.bat               # Concurrently runs frontend & backend
├── LICENSE                   # MIT License
└── README.md                 # Main instructions guide
```

---

## 🔑 Demo Accounts (for Judges)

Use these pre-seeded credentials to test the platform without signing up. All accounts share the same demo password.

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@threadcounty.app | Demo@1234 |
| **Free User** | demo.free@threadcounty.app | Demo@1234 |
| **Student User** | demo.student@threadcounty.app | Demo@1234 |
| **Pro User** | demo.pro@threadcounty.app | Demo@1234 |
| **Enterprise** | demo.enterprise@threadcounty.app | Demo@1234 |

> ⚠️ These are **demo-only credentials** — never reuse these passwords in a real production environment.

---

## ⚡ New in Addendum Update (Phase 12–21)

### Auth & Legal
- **Remember Me** — functional session persistence (sessionStorage vs localStorage)
- **Privacy Policy** (`/privacy`) — full prose, sticky table-of-contents
- **Terms of Service** (`/terms`) — full prose, sticky table-of-contents
- **Cookie Consent Banner** — slide-in on first visit, localStorage persistence

### Payments
- **Mock Checkout Flow** (`/checkout/:plan`) — realistic card form, 2s processing spinner, confetti burst, invoice generation
- **Invoice Download** — print-ready HTML invoice per checkout transaction
- **Pricing page** — "Subscribe" now navigates to full checkout flow

### Admin
- **Upload Inbox tab** — raw uploads table, thumbnail modal, status filter, delete
- **Platform Settings tab** — plan limits editor, maintenance mode toggle, feature flags, email template previews

### Profile
- **Activity Tab** — full chronological notification history with type-based filtering

### Backend Hardening
- **Structured logging** (`middleware/logger.ts`) — every API request/response logged with method, path, user ID, duration, status
- **Rate limiting** (`middleware/rateLimiter.ts`) — in-memory token-bucket limiter on auth (10/5min), upload (15/min), contact (5/hr)
- **Input sanitization** — strips HTML/script tags from all free-text fields before storage

### SEO & Performance
- `index.html` — full meta tags, Open Graph, Twitter Card, theme-color, preconnect hints
- `.env.example` — all environment variable keys documented

### Bonus Features Built
- **Voice Search** on History page (Web Speech API, gracefully hidden in unsupported browsers)
- **Fabric Comparison** tool at `/compare` (built in earlier session)

---

## 📋 GitHub Hygiene Checklist

Before submission verify:
- [ ] Repository is **Public**
- [ ] `.env.local` / `.env` files are in `.gitignore` and never committed
- [ ] `.env.example` is committed (keys only, no real values)
- [ ] `README.md` setup steps work on a clean clone
- [ ] `LICENSE` file present (MIT)
- [ ] No API keys or secrets in commit history
