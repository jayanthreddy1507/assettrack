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
