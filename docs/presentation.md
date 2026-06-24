# ThreadCounty — Presentation Deck (10 Slides)

> Canva / Google Slides / PowerPoint content guide.
> Brand palette: Indigo `#4F46E5` · Violet `#7C3AED` · Slate dark `#0F172A` · White `#FFFFFF`
> Font: **Inter** (headings extra-bold, body regular)

---

## Slide 1 — Title

**Layout:** Full bleed dark background (`#0F172A`), centered content, subtle animated scanning grid pattern as background texture.

**Content:**
- Logo (🧵 + "ThreadCounty" wordmark in indigo)
- **Tagline:** "Fabric Intelligence, Instantly."
- Team name / Hackathon name
- Date

**Visual:** Animated fabric scan overlay (reuse the app hero animation screenshot)

---

## Slide 2 — The Problem

**Layout:** Split: dark left panel (problem stat) + right panel (graphic)

**Content:**
> _"Manual textile inspection is slow, subjective, and leaves no digital record."_

Pain points (3 bullet icons):
- 🔍 Thread counting takes 15–30 min per sample by hand
- 📋 No standardized digital trail for QC decisions
- ❌ Human error rate in manual counting: up to 12%

**Visual:** Photo of a quality control technician with a magnifying glass on a fabric loom (royalty-free), with a red X overlay

---

## Slide 3 — The Solution

**Layout:** Clean white/light card, centered 3-step flow

**Content:**
- **One sentence:** "ThreadCounty uses AI and Computer Vision to analyze fabric structure in seconds."
- 3 icons in a row with connecting arrows:
  1. 📤 **Upload** — drag-and-drop your fabric swatch
  2. 🤖 **Analyze** — AI counts warp/weft threads, identifies weave type
  3. 📄 **Report** — Download a PDF report + share a link

---

## Slide 4 — Live Product Screenshots

**Layout:** 3-panel mosaic, dark frame

**Panels (use real app screenshots):**
1. **Landing Page** — hero with scanning animation
2. **Analysis Result Page** — metrics dashboard with thread count stats
3. **Admin Dashboard** — analytics charts + user management table

**Caption:** "Production-ready UI · Responsive · Dark Mode"

---

## Slide 5 — Key Features

**Layout:** 2×3 icon grid, light background

**Feature cards:**
| Icon | Feature |
|---|---|
| 🤖 | AI Thread Density Analysis |
| 📜 | PDF Report Generation |
| 🔗 | Shareable Report Links |
| 📊 | Fabric Comparison Tool |
| 🛡️ | Role-Based Admin Panel |
| 💳 | Multi-Tier Subscription Plans |

---

## Slide 6 — Tech Stack

**Layout:** Logo grid on dark background, grouped by layer

**Groups:**
- **Frontend:** React.js · TypeScript · Vite · Tailwind CSS
- **Backend:** Node.js · Express.js · JWT Auth · Multer
- **Database:** Supabase (PostgreSQL + Storage) + Local JSON fallback
- **Hosting:** Vercel (frontend) · Railway/Render (backend)
- **Dev Tools:** ESLint · Prettier · ts-node

**Visuals:** Actual technology logos arranged in a clean grid

---

## Slide 7 — Architecture Diagram

**Layout:** Clean boxes-and-arrows diagram on white background

```
[Browser / React App]
        |
        | HTTPS REST API
        ↓
[Express.js API Server]
  ├── /api/auth     → JWT Auth Middleware
  ├── /api/upload   → Multer → Mock AI Engine → Report DB
  ├── /api/report   → CRUD + PDF Generator
  ├── /api/admin    → Admin-Only Routes
  └── /api/checkout → Mock Payment → Subscription Update
        |
        ↓
[Database Layer]
  ├── Local JSON (dev)
  └── Supabase PostgreSQL (prod)
        |
        ↓
[Storage: uploads/ directory → Supabase Storage (prod)]
```

---

## Slide 8 — Database Schema

**Layout:** ER Diagram, 7 tables connected with relationship lines

**Tables:**
| Table | Key Columns |
|---|---|
| `profiles` | id, email, name, role, plan, avatar_url |
| `uploads` | id, user_id, file_path, original_name, file_size |
| `reports` | id, upload_id, user_id, fabric_type, warp_count, weft_count, thread_density, confidence, suggestions |
| `notifications` | id, user_id, title, message, is_read |
| `contact_messages` | id, name, email, subject, message, is_read |
| `subscriptions` | id, user_id, plan, status, started_at |
| `plan_limits` | plan, max_uploads, max_size_mb, storage_cap_gb |

---

## Slide 9 — Production-Ready Highlights

**Layout:** Checklist-style, indigo accent on each item

**Checklist:**
- ✅ JWT Authentication + Bcrypt password hashing
- ✅ Role-based access control (user / admin)
- ✅ Rate limiting on auth, upload, and contact routes
- ✅ Structured request/response logging on all API routes
- ✅ Input sanitization (XSS protection on all free-text fields)
- ✅ Fully responsive (mobile-first + dark mode)
- ✅ SEO meta tags + Open Graph + Twitter Card
- ✅ MIT Licensed · Clean commit history · .gitignore enforced

---

## Slide 10 — Roadmap & Close

**Layout:** Two-column: left roadmap, right CTA

**Left — What's Next:**
- 🔬 Real AI model (replace mock with TensorFlow.js or Python microservice)
- 💳 Real Stripe payment integration (test keys available)
- 📱 React Native mobile app
- 🌐 Multi-language support (Hindi, Arabic)
- 🏭 Factory camera integration for live stream analysis

**Right — Links:**
- 🌐 Live App: `https://threadcounty.vercel.app`
- 📦 GitHub: `https://github.com/[your-username]/threadcounty`
- 📧 Contact: `team@threadcounty.app`

**Closing line:** _"ThreadCounty — Where every thread tells a story."_

---

## Demo Video Shot List (3–5 Minutes)

| Timestamp | Scene |
|---|---|
| 0:00–0:20 | Hook + Landing Page hero scan animation |
| 0:20–0:50 | Landing page scroll (Features → How It Works → Pricing) |
| 0:50–1:20 | Signup → email verify state → Dashboard landing |
| 1:20–2:30 | Upload fabric → 3-stage progress → Result page → PDF download → Share link |
| 2:30–3:00 | History page: search filter + Compare Fabrics tool |
| 3:00–3:40 | Admin dashboard: analytics charts + user management |
| 3:40–4:10 | Polish: dark mode toggle + mobile responsive view |
| 4:10–4:30 | Tech stack slide + repo link + closing |

> Record at 1080p minimum. Use Loom, OBS, or Screenpal. Trim loading dead time.
