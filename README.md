# AssetFlow — Backend

Enterprise asset and resource management. FastAPI + PostgreSQL.

---

## 1. Setup (10 minutes, start to finish)

You need Python 3.11+ and PostgreSQL 14+ installed.

### Step 1 — Create the database

```bash
# macOS / Linux
createdb assetflow
psql assetflow -c "CREATE USER assetflow WITH PASSWORD 'assetflow' SUPERUSER;"

# Windows (from the SQL Shell / psql prompt)
CREATE DATABASE assetflow;
CREATE USER assetflow WITH PASSWORD 'assetflow' SUPERUSER;
```

The `SUPERUSER` grant is only so the app can run `CREATE EXTENSION btree_gist`
on first boot. In production you would create the extension once, by hand, and
drop the grant.

### Step 2 — Install the backend

```bash
cd backend
python -m venv venv

source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

### Step 3 — Configure

```bash
cp .env.example .env          # Windows: copy .env.example .env
```

Open `.env` and set `JWT_SECRET` to any long random string.

### Step 4 — Seed and run

```bash
python seed.py                # creates tables, applies the hard rules, loads demo data
uvicorn app.main:app --reload
```

Open **http://localhost:8000/docs** — every endpoint, live, with a Try It button.

### Step 5 — Prove it works

```bash
python judge_test.py
```

29 checks, run against the real database. If they all pass, the backend is
demo-ready.

---

## 2. Logins

All passwords: `Assetflow2026`

| Role | Email | Why they matter in the demo |
|---|---|---|
| Admin | admin@assetflow.io | Owns org setup, roles, audit cycles |
| Asset Manager | manager@assetflow.io | Allocates, approves maintenance |
| Dept Head | head@assetflow.io | Holds the 09:00 booking on Room B2 |
| Employee | priya@assetflow.io | **Holds AF-0114** |
| Employee | raj@assetflow.io | **Try to give him AF-0114** |

---

## 3. The two rules Postgres enforces, not Python

Application-level `if` checks lose races. Two people clicking Confirm in the
same millisecond both pass the check and both write. These two lines of DDL
(in `app/db.py`) make that physically impossible:

```sql
CREATE UNIQUE INDEX one_open_allocation_per_asset
    ON allocations (asset_id) WHERE returned_at IS NULL;

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    asset_id   WITH =,
    tstzrange(start_ts, end_ts, '[)') WITH &&
) WHERE (status IN ('UPCOMING', 'ONGOING'));
```

The `'[)'` bound — inclusive start, exclusive end — is what makes 09:00–10:00
and 10:00–11:00 legal neighbours while rejecting 09:30–10:30. That is the
brief's exact example, satisfied by the range type rather than by hand-written
comparison logic.

Verify them yourself:

```bash
psql assetflow -c "\d bookings"
psql assetflow -c "\d allocations"
```

---

## 4. What makes this different from the other 200 submissions

### Smart Conflict Resolver

Everyone will block the double allocation. A block is a dead end. Every
rejection here ships with a way forward:

```
POST /api/allocations  →  409
{
  "reason": "already_allocated",
  "message": "AF-0114 is currently held by Priya Nair.",
  "held_by": { "id": 4, "name": "Priya Nair" },
  "since": "2026-06-12T09:14:00Z",
  "can_request_transfer": true,
  "alternatives": [
    { "tag": "AF-0115", "name": "ThinkPad X1 Carbon", "condition": "Excellent" },
    { "tag": "AF-0116", "name": "MacBook Air M3",     "condition": "Excellent" }
  ]
}
```

```
POST /api/bookings  →  409
{
  "reason": "overlap",
  "conflict": { "held_by": "Anjali Menon", "from": "09:00", "to": "10:00" },
  "next_free_slots": ["08:00", "10:00", "15:00"],
  "other_resources_free_then": ["Room B3", "Auditorium"]
}
```

The UI renders that payload as a dialog with three buttons. The user is never
stuck.

### Asset Health Score → Retirement Radar

`GET /api/reports/retirement-radar` scores every asset 0–100 from four things
the database already knows:

| Signal | Weight |
|---|---|
| Age against the category's expected life | 35 |
| Maintenance requests in the last 12 months | 30 |
| Last recorded condition | 20 |
| Days idle since last use | 15 |

Nothing is modelled, inferred or guessed — every point lost traces to a row, and
the API returns the sentences, so the UI explains *why*:

```
Epson EB-2250U Projector — 3/100 · RETIRE
  · 6.0 yrs old against a 4-yr expected life
  · 3 repairs raised in the last 12 months
  · last recorded condition: Poor
  · never allocated or booked
```

That single endpoint answers two lines of the brief at once: "assets nearing
retirement" and "most-used vs idle assets".

### It moves on its own

`app/main.py` runs a 30-second ticker. Bookings roll `UPCOMING → ONGOING →
COMPLETED` by themselves, reminders fire 15 minutes before a slot, and overdue
allocations raise alerts with nobody pressing refresh. The brief asks for real,
dynamic data rather than static JSON — this is what makes that literally true.
Leave the dashboard open during judging and it changes while they watch.

### QR labels

`GET /api/assets/{id}/qr` returns a printable PNG. Stick it on the laptop; an
auditor walking the floor scans instead of typing a tag.

---

## 5. API map

| Screen in the brief | Endpoints |
|---|---|
| Login / Signup | `POST /api/auth/signup` · `/login` · `GET /me` |
| Organization Setup | `/api/org/departments` · `/categories` · `/employees` · `PATCH /employees/{id}/role` |
| Asset Registration | `POST /api/assets` · `GET /api/assets?q=&status=&category_id=` · `/{id}` · `/{id}/qr` · `/by-tag/{tag}` |
| Allocation & Transfer | `POST /api/allocations` · `/{id}/return` · `/overdue` · `/transfers` · `/transfers/{id}/decide` |
| Resource Booking | `POST /api/bookings` · `GET /availability/{id}` · `/{id}/cancel` · `/{id}/reschedule` |
| Maintenance | `POST /api/maintenance` · `/{id}/decide` · `/{id}/advance` |
| Audit | `POST /api/audits/cycles` · `/items/{id}/mark` · `/cycles/{id}/discrepancies` · `/cycles/{id}/close` |
| Dashboard | `GET /api/dashboard` |
| Reports | `/api/reports/retirement-radar` · `/utilization` · `/booking-heatmap` · `/export/{report}` |
| Activity & Notifications | `GET /api/activity` · `/api/notifications` |

---

## 6. Where every rule lives

Judges ask "show me where you enforce X". Have these ready:

| Rule | File |
|---|---|
| Signup can never mint an admin | `routers/auth.py` — `SignupIn` has **no role field** |
| Only an admin changes roles | `routers/org.py` — `change_role`, the only place `.role =` is written |
| Double allocation blocked | `db.py` (index) + `routers/allocations.py` (friendly 409) |
| Overlapping booking rejected | `db.py` (EXCLUDE) + `routers/bookings.py` |
| Approval precedes maintenance status | `routers/maintenance.py` — the asset moves in `decide`, not in `raise_request` |
| No illegal workflow jumps | `routers/maintenance.py` — the `NEXT` state map |
| Everything is audited | `services.py` — `log()`, called on every mutation |

---

## 7. Demo script (4 minutes)

1. Log in as **manager**. Dashboard shows an overdue return and a pending repair — it is already alive.
2. Try to allocate **AF-0114** to Raj. Rejected — *"held by Priya Nair"* — with two spare laptops offered and a Transfer button. Click Transfer. Approve it. Watch the history write itself.
3. Book **Room B2**, 09:30–10:30 tomorrow. Rejected, with the next free windows and two other free rooms. Take 10:00–11:00 instead. Accepted.
4. Raise a repair on the van. Note the asset does *not* change status. Approve it. *Now* it does.
5. Open **Reports → Retirement Radar**. The six-year-old projector scores 3/100 and says exactly why.
6. Show `/docs`. Show `\d bookings`. The rules are in the database, not in an if-statement.

---

## 8. Git protocol (the rule that disqualifies teams)

The brief says it plainly: **every member must commit.** One person managing the
repo is called out as insufficient.

```bash
git checkout -b feat/booking-calendar
# ... work ...
git commit -m "Add booking calendar with conflict dialog"
git push -u origin feat/booking-calendar
```

Open a PR. Have a teammate merge it. Do this from the first hour — a repo with
40 commits from one account and 2 from everyone else is a visible fail, and it
cannot be repaired at 4pm.

# assettrack — Enterprise Asset & Resource Management System

A modern ERP system for tracking company assets, maintenance, bookings, and audits.

**Stack:** Next.js 15 · PostgreSQL · Prisma 7 · Auth.js · TailwindCSS · shadcn/ui

---

## Prerequisites

Make sure these are installed on your machine before starting:

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org/download/) |
| npm | 9+ | Comes with Node.js |

---

## Quick Start (New Collaborator)

Follow these steps exactly, in order:

### 1. Clone the repository

```bash
git clone <repo-url>
cd AssetTrack
```

### 2. Install dependencies

```bash
npm install
```

> This also auto-runs `prisma generate` (via the `postinstall` script) to regenerate the Prisma Client.

### 3. Set up your environment file

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Then open `.env` and fill in your local PostgreSQL credentials:

```env
DATABASE_URL="postgresql://assettrack_user:your_password@localhost:5432/assettrack?schema=public"
```

### 4. Create the local database

Connect to PostgreSQL and run:

```sql
-- Create the database
CREATE DATABASE assettrack;

-- Create the app user
CREATE USER assettrack_user WITH PASSWORD 'your_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE assettrack TO assettrack_user;
ALTER USER assettrack_user CREATEDB;

-- Connect and grant schema access
\c assettrack
GRANT ALL ON SCHEMA public TO assettrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO assettrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO assettrack_user;
```

> On Windows, open `psql` from: `C:\Program Files\PostgreSQL\17\bin\psql.exe -U postgres`

### 5. Run migrations

```bash
npx prisma migrate dev
```

This creates all tables in your local database.

### 6. Seed the database

```bash
npm run db:seed
```

This populates the database with:
- 5 default departments (IT, HR, Finance, Operations, Facilities)
- 8 asset categories (Electronics, Furniture, Vehicles, etc.)
- 1 admin user
- 3 demo assets

**Default login:**
```
Email:    admin@assettrack.com
Password: Admin@1234
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Commands

| Command | What it does |
|---|---|
| `npm run db:migrate:dev` | Create and apply a new migration (development) |
| `npm run db:migrate` | Apply pending migrations (production/staging) |
| `npm run db:generate` | Regenerate Prisma Client after schema changes |
| `npm run db:seed` | Seed the database with default data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser at localhost:5555) |
| `npm run db:reset` | ⚠️ Drop + re-migrate + re-seed (dev only, destroys data) |

---

## Project Structure

```
AssetTrack/
├── prisma/
│   ├── schema.prisma       ← Database schema (models, enums, relations)
│   ├── seed.js             ← Shared seed data (committed to git)
│   └── migrations/         ← Migration history (committed to git)
│
├── prisma.config.ts        ← Prisma 7 config (datasource URL, seed command)
│
├── src/
│   ├── app/                ← Next.js App Router pages and API routes
│   ├── lib/
│   │   └── prisma.js       ← Prisma Client singleton (import this everywhere)
│   └── generated/
│       └── prisma/         ← Auto-generated types (do not edit, gitignored)
│
├── .env                    ← Local secrets (gitignored — never commit this)
├── .env.example            ← Template for new collaborators (committed to git)
└── README.md
```

---

## How Collaborators Stay in Sync

The database state is shared through three committed files:

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines all tables, columns, and relationships |
| `prisma/migrations/` | Full SQL history of every database change |
| `prisma/seed.js` | Default data every developer's database should have |

**When a teammate changes the schema and pushes:**

```bash
git pull
npx prisma migrate dev   # applies the new migration to your local DB
```

**Full reset (if your DB is out of sync):**

```bash
npm run db:reset   # drops everything, re-migrates, re-seeds
```

---

## Database Schema

### Tables

| Table | Description |
|---|---|
| `users` | All system users with roles and department assignments |
| `departments` | Organizational structure, supports hierarchy (parent/child) |
| `categories` | Asset categories, supports hierarchy (e.g. Electronics > Laptops) |
| `assets` | All tracked assets with status, location, and JSONB metadata |
| `accounts` | Auth.js OAuth accounts |
| `sessions` | Auth.js user sessions |
| `verification_tokens` | Auth.js email verification |

### Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full system access |
| `ADMIN` | Manage assets, users, departments |
| `MANAGER` | Approve bookings, view reports |
| `TECHNICIAN` | Handle maintenance |
| `EMPLOYEE` | Book assets, view own assignments |
| `AUDITOR` | Read-only audit access |

---

## Using the Prisma Client in Code

Import the singleton — never instantiate `PrismaClient` directly in your components or routes:

```js
import { prisma } from '@/lib/prisma'

// Fetch all active assets with their category and department
const assets = await prisma.asset.findMany({
  where: { deletedAt: null },
  include: {
    category: true,
    department: true,
    assignedTo: { select: { id: true, name: true, email: true } }
  },
  orderBy: { createdAt: 'desc' }
})

// Soft delete an asset (never hard delete in an ERP)
await prisma.asset.update({
  where: { id: assetId },
  data: { deletedAt: new Date() }
})

// Wrap multi-step operations in a transaction
const [updatedAsset, log] = await prisma.$transaction([
  prisma.asset.update({ where: { id }, data: { status: 'ASSIGNED', assignedToId: userId } }),
  prisma.auditLog.create({ data: { assetId: id, action: 'ASSIGNED', performedById: currentUser } })
])
```

---

## Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_your_change`
3. Commit both `schema.prisma` and the new `migrations/` folder
4. Push — teammates run `npx prisma migrate dev` after pulling

---

## Troubleshooting

**`Can't reach database server`**
- Verify PostgreSQL is running: check Services on Windows or `brew services list` on Mac
- Double-check `DATABASE_URL` in your `.env`

**`permission denied to create database`**
- Run: `ALTER USER assettrack_user CREATEDB;` in psql as postgres superuser

**`relation "X" does not exist`**
- Run `npx prisma migrate dev` to apply missing migrations

**Prisma Client out of date after `git pull`**
- Run `npx prisma generate` (or just `npm install` which triggers `postinstall`)