# Pehalwan Karahi & DeraGhar — Full-Stack Restaurant CMS

A high-performance, production-grade restaurant web platform and dynamic Content Management System (CMS) built for **Pehalwan Karahi & DeraGhar** (Faisalabad, Pakistan).

Designed specifically for **Hostinger Node.js + MySQL hosting**, featuring zero disk storage dependencies, client-side WebP image compression, in-database BLOB media storage, server-authoritative order pricing, and complete real-time admin control.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router, Webpack), React 19, Tailwind CSS v4, Lucide Icons |
| **Backend** | Express 4 + TypeScript, executed via `tsx` in development, compiled to `dist/index.js` in production |
| **Database** | MySQL 5.7 / 8.0+ or MariaDB 10.x, queried via `mysql2/promise` connection pool (strictly parameterized, zero ORM) |
| **Auth & Security** | JWT authentication with versioned token invalidation (`token_version`), `bcryptjs`, `helmet`, `express-rate-limit`, `zod` input validation |
| **Media Pipeline** | Canvas-based client-side WebP compression, `multer` memory storage, magic-byte header inspection, SHA-256 deduplication, MySQL `LONGBLOB` storage with immutable HTTP caching (ETags, 304 Not Modified) |
| **Package Manager** | `pnpm` (Single root workspace) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js**: v18.18+ or v20+
- **pnpm**: v9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **MySQL Server**: v5.7, v8.0, or MariaDB running locally on port `3306` (or Docker)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/pehalwan-karahi.git
cd pehalwan-karahi
pnpm install
```

### 2. Configure Environment Variables

Create `.env` in the root directory (for Next.js):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `server/.env` in the `server` directory (for Express & MySQL):
```env
PORT=5000
NODE_ENV=development
TRUST_PROXY=1
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=pehalwan_karahi
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_12345
ADMIN_USERNAME=admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
CORS_ORIGIN=http://localhost:3000
```

### 3. Initialize MySQL Database

Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS pehalwan_karahi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run schema migrations:
```bash
pnpm db:migrate
```
*(Note: Schema migrations also run automatically whenever the Express server starts up.)*

*(Optional)* Seed initial sample dishes and settings:
```bash
# You can import database/seed.sql directly into MySQL:
mysql -u root -p pehalwan_karahi < database/seed.sql
```

### 4. Start Development Servers

Run both the Next.js frontend and Express backend concurrently:
```bash
pnpm dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Login with your configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`)*

---

## 🌐 Hostinger Deployment Guide

Hostinger Cloud & Business hosting provides native Node.js application hosting with MySQL databases managed in hPanel. Follow these steps for deployment:

### Step 1: Create MySQL Database in hPanel

1. Log in to **Hostinger hPanel**.
2. Navigate to **Databases** → **Management**.
3. Create a **New MySQL Database**:
   - **Database Name**: e.g., `u123456789_pkdb`
   - **Username**: e.g., `u123456789_pkuser`
   - **Password**: Generate a strong password (save this securely)
4. Note that on Hostinger, the database host is always `localhost` and port is `3306`.
5. *(Optional)* Click **Enter phpMyAdmin** next to the newly created database, go to the **Import** tab, and import `database/seed.sql` to populate default categories, dishes, and initial settings.

### Step 2: Set Up Node.js Application in hPanel

1. In hPanel, navigate to **Websites** → **Manage** → **Node.js**.
2. Click **Create Application** (or manage existing):
   - **Node.js Version**: Select **20.x** (or **18.x**)
   - **Application Mode**: `Production`
   - **Application Root**: Path to your project (e.g., `/home/u123456789/domains/pehalwankarahi.com/public_html`)
   - **Application Startup File**: `server/dist/index.js`
3. Under **Environment Variables**, add the following:

| Variable | Recommended Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | Or port assigned by Hostinger reverse proxy |
| `DB_HOST` | `localhost` | Hostinger local MySQL socket |
| `DB_PORT` | `3306` | Standard MySQL port |
| `DB_NAME` | `u123456789_pkdb` | Your hPanel DB name |
| `DB_USER` | `u123456789_pkuser` | Your hPanel DB user |
| `DB_PASSWORD` | `your_db_password` | Your hPanel DB password |
| `JWT_SECRET` | `generate_a_random_32+_char_string` | Secret for admin authentication |
| `ADMIN_USERNAME` | `admin` | Initial admin login username |
| `ADMIN_EMAIL` | `admin@pehalwankarahi.com` | Initial admin email |
| `ADMIN_PASSWORD` | `YourSecurePassword2026!` | Used to seed initial admin account on first boot |
| `CORS_ORIGIN` | `https://yourdomain.com` | Allowed origin for API requests |
| `TRUST_PROXY` | `1` | Enable reverse proxy trust behind Hostinger (ensures accurate client IP logging & rate limits) |
| `NEXT_PUBLIC_API_URL` | `/api` | Root relative path (or `https://yourdomain.com/api`) |

### Step 3: Build & Start on Hostinger

Connect via SSH to your Hostinger server or use the built-in Terminal in hPanel:

```bash
cd /home/u123456789/domains/yourdomain.com/public_html

# Install dependencies using pnpm
pnpm install --frozen-lockfile

# Build Next.js frontend (output in .next/)
pnpm run build

# Build Express backend (compiles TS to server/dist/ and copies migrations)
pnpm run build:server
```

In hPanel, click **Restart Application**.

The server will automatically:
1. Acquire MySQL advisory migration lock `pk_migrate`.
2. Execute any pending `.sql` files in `server/migrations/`.
3. Seed the master admin account if `admin_users` is empty.
4. Start accepting requests on the configured port.

---

## 🗄️ Database Architecture & Migrations

All tables are strictly engine `InnoDB`, character set `utf8mb4`, and collation `utf8mb4_unicode_ci` for full emoji and international character support.

```
schema_migrations      ── Tracks executed migration versions (001, 002, ...)
admin_users            ── Admin credentials (bcrypt), role, last_login, token_version
categories             ── Menu categories with slugs and sort order
dishes                 ── Menu items linked to categories, media IDs, availability
media_files            ── Uploaded images stored as LONGBLOB with sha256 deduplication
site_slots             ── 13 fixed homepage hero/bento image slots with fallback URLs
settings               ── Restaurant helplines, WhatsApp, timings, delivery rules, accounts
orders                 ── Customer orders, payment status, subtotal, discount, total
order_items            ── Snapshot of purchased dishes and price at time of order
reservations           ── Table booking requests with guest count and time slot
loyalty_passes         ── VIP passes with telephone number uniqueness and discount %
```

### Running Migrations Manually
```bash
pnpm db:migrate
```

### Exporting Current Database to Seed SQL
```bash
pnpm db:export-seed
```

---

## 🖼️ Media Pipeline (Zero Disk Storage)

Because shared hosting environments often wipe ephemeral disk storage or enforce restrictive file permissions, **no uploaded images are saved to disk**.

1. **Client-Side Compression**: When an admin selects an image in `ImagePicker.tsx`, the browser draws it to an HTML5 canvas, resizes it to a maximum of 1600px width/height, and encodes it to WebP at 0.82 quality.
2. **Server Inspection**: Express receives the buffer into memory via `multer` memoryStorage (max 2MB limit) and verifies the binary magic bytes (`RIFF....WEBP`, `\xFF\xD8\xFF`, or `\x89PNG`).
3. **Deduplication**: A SHA-256 hash of the buffer is computed. If an identical file already exists in `media_files`, the existing record ID is returned immediately.
4. **Serving & Caching**: Media is served from `/api/media/:id` with:
   - `Content-Type: image/webp`
   - `Cache-Control: public, max-age=31536000, immutable`
   - HTTP `ETag` and `304 Not Modified` conditional headers
   - `Cross-Origin-Resource-Policy: cross-origin`
5. **Orphan Cleanup**: An automatic maintenance routine runs every 24 hours (and can be manually triggered via `POST /api/admin/media/cleanup`) to purge unreferenced images older than 24 hours.

---

## 🛡️ Admin CMS Capabilities (`/admin`)

Access the management dashboard at `/admin`.

- **Overview Tab**: Real-time sales statistics, revenue, order count, reservation volume, and top-selling dishes.
- **Menu Tab**: Add, edit, reorder dishes. Instant toggle switch for dish availability. Category management modal with drag/button reordering and deletion protection (cannot delete categories containing active dishes).
- **Orders Tab**: Real-time order monitoring, status transitions (`preparing` → `cooking_in_wok` → `out_for_delivery` → `delivered` / `cancelled`), payment status, customer delivery addresses.
- **Reservations Tab**: Table booking management with seating preferences and confirmation toggles.
- **Site Images Tab**: Direct control of the 13 fixed homepage presentation image slots (Hero plates, Bento grid showcases, Featured strip, Dawat section, Video modal). Easily link any slot directly to a menu dish or upload a custom image.
- **Address & Settings Tab**:
  - Live configuration of restaurant branding, tagline, and description.
  - Emergency toggle for online order acceptance (`isAcceptingOrders`).
  - Operating hours and daily timings.
  - Active branch locations manager.
  - Minimum order amount (`minOrder`) and delivery fee rules with free delivery threshold.
  - Customer helpline numbers, WhatsApp booking links, and landline desk.
  - Official Easypaisa and JazzCash account titles and mobile transfer numbers.
  - Sticky announcement banner with flame badge and toggle switch.
  - Factory default reset button with confirmation modal.
  - Master admin credential and password updates.

---

## 🔒 Server-Authoritative Checkout & Security

- **Tamper-Proof Pricing**: The client cart submits only dish IDs and quantities. The Express backend resolves all prices directly from MySQL, recalculates subtotal, queries customer VIP loyalty discount, enforces `minOrder`, checks `isAcceptingOrders`, and sets the authoritative total bill.
- **Token Invalidation**: Admin password changes increment the user's `token_version` in MySQL, instantly invalidating all previously issued JWT tokens across all devices.
- **Rate Limiting**:
  - Global API limiter: 120 requests per 15 minutes per IP.
  - Strict auth limiter: 10 login attempts per 15 minutes per IP.
  - Strict order limiter: 15 order placements per hour per IP.
- **CORS & Helmet**: Helmet headers enabled with custom Cross-Origin policies for media loading.

---

## 📜 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Starts Next.js and Express concurrently in development mode |
| `pnpm run dev:frontend` | Starts only the Next.js development server |
| `pnpm run dev:server` | Starts only the Express development server with live reload |
| `pnpm run build` | Builds the Next.js production bundle |
| `pnpm run build:server` | Compiles Express TypeScript to `server/dist/` and syncs migrations |
| `pnpm run build:all` | Builds both frontend and backend for production |
| `pnpm start` | Starts Next.js production server |
| `pnpm run start:server` | Starts compiled Express backend from `server/dist/index.js` |
| `pnpm run db:migrate` | Runs all pending database migrations in `server/migrations/` |
| `pnpm run db:export-seed` | Dumps current MySQL menu and settings to `database/seed.sql` |
| `pnpm run lint` | Runs ESLint across the repository |

---

## 📄 License & Heritage

© 2026 Pehalwan Karahi & DeraGhar. Authentic Pakistani Karahi House. All rights reserved.
