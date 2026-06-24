# ThreadCounty REST API Reference

All requests must be directed to the base URL: `http://localhost:5000/api`. Secure routes require a `Bearer <token>` string passed in the `Authorization` request header.

---

## 1. Authentication Service (`/auth`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/signup` | None | `{ name, email, password, company? }` | Create new user profile |
| `POST` | `/login` | None | `{ email, password, rememberMe? }` | Authenticate and issue JWT token |
| `POST` | `/forgot-password` | None | `{ email }` | Request reset code (fixed test OTP is `528491`) |
| `POST` | `/reset-password` | None | `{ email, code, newPassword }` | Verify OTP code and save new password |
| `POST` | `/verify-email` | None | `{ email, code }` | Validate email address registration |

---

## 2. User Service (`/user`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/profile` | User | None | Fetch current profile metadata |
| `PUT` | `/profile` | User | `{ name, company?, avatar_url? }` | Update user metadata |
| `PUT` | `/change-password` | User | `{ currentPassword, newPassword }` | Change password securely |
| `DELETE` | `/delete-account` | User | None | Wipes user and all upload/report rows |

---

## 3. Upload Service (`/upload`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | User | `multipart/form-data` (key: `file`) | Upload fabric swatch image (Max 5MB, JPG/PNG/JPEG) |

---

## 4. Report & Simulation Service (`/report`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/analyze` | User | `{ uploadId }` | Triggers AI weave parsing and density counting |
| `GET` | `/list` | User | None | Lists reports for current user, sorted by date |
| `GET` | `/:id` | User | None | Fetch single report details (warp, weft, suggestions) |
| `DELETE` | `/:id` | User | None | Deletes report and deletes file from disk storage |
| `GET` | `/:id/download` | User | Query: `?format=json` or `?format=pdf` | Export analysis reports as JSON file or print view |

---

## 5. Dashboard Service (`/dashboard`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/stats` | User | None | Fetch upload counts, quota percentages, and timeline log |
| `PUT` | `/notifications/:id/read` | User | None | Mark notification read |

---

## 6. Contact Support Service (`/contact`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | None | `{ name, email, subject, message }` | Submit support/pricing inquiry |
| `GET` | `/` | Admin | None | List all submitted contact messages |

---

## 7. Administrative Services (`/admin`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin | None | Aggregate users counts, upload storage, and plan splits |
| `GET` | `/users` | Admin | None | Fetch detailed user directory |
| `PUT` | `/users/:id/role` | Admin | `{ role }` | Promote or demote user (role: `user` or `admin`) |
| `PUT` | `/users/:id/plan` | Admin | `{ plan }` | Override subscription tier (`Free`, `Student`, etc.) |
| `DELETE` | `/users/:id` | Admin | None | Force remove user account and data |
