# AssetFlow

Enterprise asset, booking, maintenance, audit, and reporting platform built for the Odoo Hackathon.

AssetFlow helps organizations track physical assets from registration to retirement. It replaces spreadsheet-based asset operations with a role-aware web application backed by PostgreSQL, Prisma, Auth.js, and a production-ready Next.js 15 architecture.

---

## At a Glance

| Area           | Details                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| Project        | AssetFlow                                                                             |
| Category       | Enterprise asset and resource management                                              |
| Frontend       | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style UI components |
| Backend        | Next.js Route Handlers, server-side services, Prisma repositories                     |
| Database       | PostgreSQL with Prisma 7                                                              |
| Authentication | Auth.js, credentials login, OAuth-ready providers, JWT-compatible custom routes       |
| Quality        | ESLint, Prettier, TypeScript, Husky, lint-staged                                      |
| Deployment     | Docker and Docker Compose                                                             |

---

## Demo Credentials

The seed script creates a default administrator account.

| Role        | Email                   | Password     |
| ----------- | ----------------------- | ------------ |
| Super Admin | `admin@assetflow.local` | `Admin@1234` |

The password can be changed before seeding with `SEED_ADMIN_PASSWORD` in `.env`.

---

## Problem Statement

Organizations often lose time and money because asset data is scattered across spreadsheets, emails, and manual approval chains. Common issues include duplicate asset allocation, unclear ownership, poor maintenance visibility, booking conflicts, and missing audit trails.

AssetFlow solves this by creating one operational system for:

- Asset registration and lifecycle tracking
- Employee, department, and category management
- Asset allocation and return workflows
- Resource booking and availability planning
- Maintenance request tracking
- Audit cycle management
- Notifications and operational reporting
- Role-based access control

---

## Solution Overview

```text
+----------------+
| User logs in   |
+-------+--------+
        |
        v
+-------------------------+
| Role and permission     |
| checks                  |
+-----------+-------------+
            |
            v
+-------------------------+
| Dashboard overview      |
+-----------+-------------+
            |
            +--------------------+--------------------+--------------------+
            |                    |                    |                    |
            v                    v                    v                    v
   +----------------+   +----------------+   +----------------+   +----------------+
   | Asset registry |   | Organization   |   | Allocation     |   | Booking        |
   +-------+--------+   +-------+--------+   +-------+--------+   +-------+--------+
           |                    |                    |                    |
           v                    v                    v                    v
   +----------------+   +----------------+   +----------------+   +----------------+
   | Assets API     |   | Org APIs       |   | Allocation API |   | Booking API    |
   +-------+--------+   +-------+--------+   +-------+--------+   +-------+--------+
           |                    |                    |                    |
           +--------------------+---------+----------+--------------------+
                                      |
                                      v
                              +---------------+
                              | PostgreSQL    |
                              +-------+-------+
                                      |
                                      v
                              +---------------+
                              | Notifications |
                              | Activity log  |
                              +-------+-------+
                                      |
                                      v
                              +---------------+
                              | Dashboard     |
                              +---------------+

Additional dashboard modules follow the same API-backed path:
Maintenance -> Maintenance API -> PostgreSQL
Audit       -> Audit API       -> PostgreSQL
Reports     -> Reporting API   -> PostgreSQL
```

AssetFlow keeps the user experience in the Next.js app while placing business rules behind API routes and server-side repositories. Prisma owns database access, PostgreSQL stores normalized operational data, and Zod protects request boundaries.

---

## Core Features

### Dashboard

- Overview metrics for assets, bookings, maintenance, and overdue activity
- Quick actions for common operational tasks
- Recent activity and overdue return visibility

### Asset Registry

- Register and manage assets
- Track asset tag, serial number, category, department, status, condition, location, purchase data, vendor, and warranty
- Soft-delete support through `deletedAt`
- Filterable asset table and asset details drawer

### Organization Management

- Manage departments
- Manage categories
- Manage employees
- Support department hierarchy and department heads

### Allocation

- Allocate assets to employees
- Track expected return dates
- Record return condition and return notes
- View allocation history and transfer requests

### Bookings

- Book bookable assets and shared resources
- Track booking status and time windows
- Calendar-focused workspace for resource planning

### Maintenance

- Raise maintenance requests
- Track priority, approval, assignment, progress, and resolution
- Preserve maintenance history per asset

### Audits

- Create audit cycles
- Assign auditors
- Track audit item results such as found, missing, damaged, and misplaced

### Notifications

- Display system notifications for allocation, returns, maintenance, booking, transfer, audit, and system events

### Reports

- Utilization and operational report views
- Booking heatmap and chart components
- Reporting workspace prepared for deeper analytics

---

## Architecture

```text
+----------------------------------------------------------------------------------+
| Browser                                                                          |
+--------------------------------------+-------------------------------------------+
                                       |
                                       v
+----------------------------------------------------------------------------------+
| Next.js 15 App Router                                                            |
| src/app                                                                          |
+----------------------+--------------------------+--------------------------------+
                       |                          |
                       v                          v
+-----------------------------------+   +------------------------------------------+
| Frontend Layer                    |   | Backend Layer                            |
|                                   |   |                                          |
| - Route pages                     |   | - Route handlers in src/app/api          |
| - Feature components              |   | - Auth.js and custom auth routes         |
| - Reusable UI components          |   | - Role and permission guards             |
| - React Hook Form                 |   | - Zod request validation                 |
| - TanStack Query                  |   | - Standard API responses and errors      |
+----------------------+------------+   +----------------------+-------------------+
                       |                                   |
                       | HTTP / fetch                      |
                       +---------------------------------->|
                                                           v
                                      +--------------------------------------------+
                                      | Data Access Layer                          |
                                      |                                            |
                                      | - Repository modules                       |
                                      | - Generated Prisma Client                  |
                                      | - Prisma migrations                        |
                                      | - Seed data                                |
                                      +---------------------+----------------------+
                                                            |
                                                            v
                                      +--------------------------------------------+
                                      | Infrastructure                             |
                                      |                                            |
                                      | - PostgreSQL                               |
                                      | - Docker / Docker Compose                  |
                                      | - Pino logging                             |
                                      +--------------------------------------------+
```

### Frontend

The frontend uses the Next.js App Router with TypeScript and reusable feature components under `src/components`. Pages live in `src/app`, while domain-specific components are grouped by feature: assets, allocation, booking, maintenance, audits, organization, reports, notifications, auth, and dashboard.

### Backend

The backend is implemented through Next.js Route Handlers under `src/app/api`. Server-only auth and permission utilities live under `src/server`. Repository files under `src/repositories` isolate database access from route handling.

### Database

PostgreSQL is the source of truth. Prisma defines models, enums, relations, and migrations in `prisma/schema.prisma` and `prisma/migrations`.

### Authentication

Auth.js is configured in `src/auth.ts` with Prisma adapter support. The app also includes custom login, logout, register, and current-user API routes for credentials-based flows.

### Validation

Zod schemas live under `src/schemas`. API handlers and forms use these schemas to keep frontend and backend validation consistent.

---

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 15                                      |
| Language      | TypeScript                                      |
| UI            | React 19, Tailwind CSS, shadcn-style components |
| Forms         | React Hook Form                                 |
| Validation    | Zod                                             |
| Data Fetching | TanStack Query                                  |
| ORM           | Prisma 7                                        |
| Database      | PostgreSQL                                      |
| Auth          | Auth.js / next-auth v5 beta                     |
| Logging       | Pino                                            |
| Tooling       | ESLint, Prettier, Husky, lint-staged            |
| Runtime       | Node.js                                         |
| Containers    | Docker, Docker Compose                          |

---

## Repository Structure

```text
assettrack/
|-- .github/
|   `-- workflows/
|-- .husky/
|-- .vscode/
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.ts
|-- public/
|-- src/
|   |-- app/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- allocation/
|   |   |-- audits/
|   |   |-- auth/
|   |   |-- bookings/
|   |   |-- dashboard/
|   |   |-- maintenance/
|   |   |-- notifications/
|   |   |-- organization/
|   |   |-- reports/
|   |   |-- globals.css
|   |   `-- layout.tsx
|   |-- components/
|   |   |-- assets/
|   |   |-- allocation/
|   |   |-- audit/
|   |   |-- auth/
|   |   |-- booking/
|   |   |-- dashboard/
|   |   |-- layout/
|   |   |-- maintenance/
|   |   |-- notifications/
|   |   |-- organization/
|   |   |-- reports/
|   |   `-- ui/
|   |-- config/
|   |-- constants/
|   |-- lib/
|   |-- providers/
|   |-- repositories/
|   |-- schemas/
|   |-- server/
|   |-- types/
|   `-- utils/
|-- Dockerfile
|-- docker-compose.yml
|-- next.config.mjs
|-- package.json
|-- prisma.config.ts
|-- tailwind.config.ts
`-- tsconfig.json
```

---

## Database Model

```text
+------------------+          +------------------+          +------------------+
| users            | 1      0..1 employees       | many   1 | departments      |
|------------------|----------|------------------|----------|------------------|
| id PK            |          | id PK            |          | id PK            |
| email UK         |          | employee_code UK |          | name UK          |
| password         |          | user_id FK       |          | code UK          |
| role             |          | department_id FK |          | parent_id FK     |
| is_active        |          | manager_id FK    |          | head_id FK       |
+--------+---------+          +---+----------+---+          +--------+---------+
         |                        |          |                       |
         |                        |          |                       |
         | 1                      |          |                       | 1
         v many                   |          |                       v many
+------------------+              |          |              +------------------+
| accounts         |              |          |              | assets           |
| sessions         |              |          |              |------------------|
+------------------+              |          |              | id PK            |
                                  |          |              | asset_tag UK     |
                                  |          |              | category_id FK   |
                                  |          |              | department_id FK |
                                  |          |              | status           |
                                  |          |              | condition        |
                                  |          |              +---+---+---+---+--+
                                  |          |                  |   |   |   |
                                  |          |                  |   |   |   |
                                  |          |                  |   |   |   |
                                  |          |                  |   |   |   |
                                  |          |                  v   v   v   v
                                  |          |       +----------------+ +----------------+
                                  |          |       | allocations    | | bookings       |
                                  |          |       | asset_id FK    | | asset_id FK    |
                                  |          |       | employee_id FK | | employee_id FK |
                                  |          |       | status         | | status         |
                                  |          |       +----------------+ +----------------+
                                  |          |
                                  |          |       +----------------------+ +----------------+
                                  |          +------>| transfer_requests    | | maintenance    |
                                  |                  | asset_id FK          | | requests       |
                                  |                  | from_employee_id FK  | | asset_id FK    |
                                  |                  | to_employee_id FK    | | reported_by FK |
                                  |                  | status               | | status         |
                                  |                  +----------------------+ +-------+--------+
                                  |                                                   |
                                  |                                                   v
                                  |                                          +------------------+
                                  |                                          | maintenance      |
                                  |                                          | updates          |
                                  |                                          | request_id FK    |
                                  |                                          +------------------+
                                  |
                                  v
                         +------------------+
                         | notifications    |
                         | employee_id FK   |
                         | type             |
                         | is_read          |
                         +------------------+

+------------------+          +------------------+          +------------------+
| categories       | 1      many assets          | 1      many activity_logs    |
|------------------|---------- above -----------|----------|------------------|
| id PK            |                                | id PK            |
| name UK          |                                | user_id FK       |
| parent_id FK     |                                | asset_id FK      |
+------------------+                                | module/action    |
                                                    +------------------+

+------------------+          +------------------+          +------------------+
| audit_cycles     | 1      many audit_items     | many   1 | assets           |
|------------------|----------|------------------|----------|------------------|
| id PK            |          | id PK            |          | id PK            |
| title            |          | cycle_id FK      |          | asset_tag UK     |
| start_date       |          | asset_id FK      |          +------------------+
| end_date         |          | auditor_id FK    |
| status           |          | result           |
+--------+---------+          +------------------+
         |
         | 1
         v many
+------------------+          +------------------+
| audit_assignments| many   1 | employees        |
| cycle_id FK      |----------| id PK            |
| auditor_id FK    |          +------------------+
+------------------+
```

Important domain tables:

| Table                  | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `users`                | Authentication identity and global role |
| `employees`            | Organization employee profile           |
| `departments`          | Department structure and ownership      |
| `categories`           | Asset classification                    |
| `assets`               | Asset registry and lifecycle state      |
| `asset_allocations`    | Active and historical asset assignments |
| `resource_bookings`    | Bookable resource reservations          |
| `maintenance_requests` | Maintenance workflow state              |
| `maintenance_updates`  | Timeline updates for maintenance work   |
| `transfer_requests`    | Asset transfer approval workflow        |
| `audit_cycles`         | Audit campaign header                   |
| `audit_assignments`    | Auditor assignment per cycle            |
| `audit_items`          | Per-asset audit results                 |
| `notifications`        | Employee-facing notifications           |
| `activity_logs`        | Operational audit trail                 |
| `accounts`             | Auth.js OAuth account records           |
| `sessions`             | Auth.js session records                 |

---

## API Surface

Current API routes include:

| Area        | Route                     |
| ----------- | ------------------------- |
| Health      | `GET /api/health`         |
| Auth        | `POST /api/auth/login`    |
| Auth        | `POST /api/auth/logout`   |
| Auth        | `GET /api/auth/me`        |
| Auth        | `POST /api/auth/register` |
| Auth.js     | `/api/auth/[...nextauth]` |
| Assets      | `GET /api/assets`         |
| Assets      | `POST /api/assets`        |
| Assets      | `GET /api/assets/:id`     |
| Assets      | `PATCH /api/assets/:id`   |
| Assets      | `DELETE /api/assets/:id`  |
| Departments | `GET /api/departments`    |
| Departments | `POST /api/departments`   |
| Categories  | `GET /api/categories`     |
| Categories  | `POST /api/categories`    |
| Employees   | `GET /api/employees`      |
| Employees   | `POST /api/employees`     |

Additional feature workspaces are already structured for allocation, booking, maintenance, audits, reports, and notifications.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd assettrack
```

### 2. Install Dependencies

```bash
npm install
```

This installs the application dependencies and runs `prisma generate` through the `postinstall` script.

### 3. Configure Environment Variables

```bash
copy .env.example .env
```

For macOS or Linux:

```bash
cp .env.example .env
```

Update `.env` with your local secrets and database connection.

Minimum required values:

```env
DATABASE_URL="postgresql://assetflow_user:assetflow_password@localhost:5432/assetflow?schema=public"
AUTH_SECRET="replace-with-a-strong-base64-secret"
JWT_SECRET="replace-with-a-strong-base64-secret"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate secure secrets with:

```bash
openssl rand -base64 32
```

### 4. Start PostgreSQL with Docker

```bash
docker compose up -d postgres
```

This starts a PostgreSQL 17 container using the credentials from `.env`.

### 5. Run Migrations

```bash
npm run db:migrate:dev
```

This applies the Prisma migration history and creates the local database schema.

### 6. Seed Demo Data

```bash
npm run db:seed
```

The seed creates departments, categories, an admin user, and starter assets.

### 7. Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker Setup

Run the complete stack:

```bash
docker compose up --build
```

Services:

| Service    | Description                                     |
| ---------- | ----------------------------------------------- |
| `postgres` | PostgreSQL database                             |
| `migrate`  | Applies Prisma migrations before the app starts |
| `app`      | Production Next.js container                    |

Local URLs:

| Service    | URL                                            |
| ---------- | ---------------------------------------------- |
| Web App    | [http://localhost:3000](http://localhost:3000) |
| PostgreSQL | `localhost:5432`                               |

---

## Package Scripts

| Script                   | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | Start Next.js with Turbopack                                     |
| `npm run build`          | Build the production app                                         |
| `npm run start`          | Start the production server                                      |
| `npm run lint`           | Run ESLint                                                       |
| `npm run lint:fix`       | Fix ESLint issues where possible                                 |
| `npm run format`         | Format files with Prettier                                       |
| `npm run format:check`   | Check formatting without writing changes                         |
| `npm run typecheck`      | Run TypeScript type checking                                     |
| `npm run validate`       | Generate Prisma client, lint, typecheck, format-check, and build |
| `npm run db:migrate`     | Apply migrations in production or CI                             |
| `npm run db:migrate:dev` | Create/apply development migrations                              |
| `npm run db:generate`    | Generate Prisma client                                           |
| `npm run db:push`        | Push schema directly without creating a migration                |
| `npm run db:seed`        | Seed default data                                                |
| `npm run db:studio`      | Open Prisma Studio                                               |
| `npm run db:reset`       | Reset database, rerun migrations, and seed                       |

---

## Environment Variables

| Variable                         | Purpose                                         |
| -------------------------------- | ----------------------------------------------- |
| `DATABASE_URL`                   | PostgreSQL connection string used by Prisma     |
| `POSTGRES_DB`                    | Docker PostgreSQL database name                 |
| `POSTGRES_USER`                  | Docker PostgreSQL username                      |
| `POSTGRES_PASSWORD`              | Docker PostgreSQL password                      |
| `APP_NAME`                       | Display/application name                        |
| `APP_URL`                        | Server-side application URL                     |
| `NEXT_PUBLIC_APP_URL`            | Browser-visible app URL                         |
| `NEXT_PUBLIC_API_BASE_URL`       | Optional browser API base URL                   |
| `AUTH_SECRET`                    | Auth.js signing/encryption secret               |
| `AUTH_URL`                       | Auth.js base URL                                |
| `NEXTAUTH_URL`                   | Compatibility URL for next-auth                 |
| `AUTH_TRUST_HOST`                | Allows Auth.js to trust deployment host headers |
| `JWT_SECRET`                     | Secret for custom JWT-compatible auth endpoints |
| `JWT_EXPIRES_IN`                 | Custom JWT expiry duration                      |
| `AUTH_GOOGLE_ID`                 | Google OAuth client ID                          |
| `AUTH_GOOGLE_SECRET`             | Google OAuth client secret                      |
| `AUTH_MICROSOFT_ENTRA_ID_ID`     | Microsoft Entra ID OAuth client ID              |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Microsoft Entra ID OAuth client secret          |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | Microsoft Entra ID issuer URL                   |
| `CORS_ORIGIN`                    | Allowed browser origin                          |
| `RATE_LIMIT_WINDOW_MS`           | Rate limit window                               |
| `RATE_LIMIT_MAX_REQUESTS`        | Max requests per rate limit window              |
| `LOG_LEVEL`                      | Pino log level                                  |
| `SEED_ADMIN_PASSWORD`            | Default seeded admin password                   |

---

## Hackathon Presentation Flow

Use this structure for a concise demo.

### 1. Opening

AssetFlow is an enterprise asset operations platform. It gives a company one place to register assets, allocate them, book shared resources, handle maintenance, run audits, and produce operational reports.

### 2. Problem

Manual asset tracking fails when teams grow. Ownership becomes unclear, duplicate allocation happens, booking conflicts are missed, and maintenance history disappears across spreadsheets.

### 3. Product Walkthrough

1. Log in as the seeded admin.
2. Open the dashboard and show operational metrics.
3. Go to assets and show registered assets with status, condition, department, and category.
4. Create or inspect an asset.
5. Open organization setup and show departments, categories, and employees.
6. Show allocation, booking, maintenance, audit, notification, and reports workspaces.
7. Explain that the backend is backed by PostgreSQL and Prisma, not static UI data.

### 4. Technical Strength

- Production-style Next.js 15 App Router structure
- Typed Prisma schema and migrations
- Role-aware authentication foundation
- Reusable UI system
- Zod validation boundaries
- Dockerized local stack
- CI-ready package scripts
- Enterprise-oriented folder organization

### 5. Closing

AssetFlow is designed to become a real internal tool: it starts as a hackathon project but already has the structure needed for production hardening, integrations, reporting, and deployment.

---

## Demo Talking Points

| Topic                      | What to say                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Why it matters             | Asset loss, booking conflicts, and maintenance delays are expensive operational problems        |
| Why this solution works    | One database-backed workflow replaces disconnected spreadsheets                                 |
| What is technically strong | Next.js full-stack architecture, Prisma schema, Auth.js foundation, Docker deployment           |
| What is scalable           | Feature-based frontend, repository-based backend, normalized database                           |
| What comes next            | Mobile scanning, advanced reporting, approval workflows, object storage, queues, and monitoring |

---

## Quality and Engineering

The repository includes the following production practices:

- TypeScript for static safety
- ESLint for code correctness
- Prettier for consistent formatting
- Husky and lint-staged for pre-commit checks
- Prisma migrations for database change history
- Seed script for reproducible demo setup
- Docker Compose for local infrastructure
- Environment variable template for onboarding
- Central API response and error utilities
- Server-side auth and permission helpers
- Repository modules for database access

Run the full validation pipeline:

```bash
npm run validate
```

---

## Security Notes

AssetFlow is structured around common enterprise security requirements:

- Secrets live in `.env` and are not committed
- Passwords are hashed with bcrypt
- Auth.js manages session/OAuth integration
- Server routes can enforce role and permission checks
- Zod schemas validate request payloads
- Prisma parameterizes database access and reduces SQL injection risk
- Soft deletes preserve operational history
- API errors are normalized before returning to clients
- Logs are centralized through Pino

Before production deployment:

- Replace all placeholder secrets
- Configure OAuth providers
- Enforce HTTPS
- Review CORS settings
- Add rate limiting middleware at the edge or reverse proxy
- Add database backups
- Add monitoring and alerting
- Add audit logging to every mutation route

---

## Future Roadmap

| Phase   | Work                                                                |
| ------- | ------------------------------------------------------------------- |
| Phase 1 | Complete CRUD and workflows for all modules                         |
| Phase 2 | Add approval policies and stronger RBAC                             |
| Phase 3 | Add QR/barcode scanning and asset labels                            |
| Phase 4 | Add file uploads for invoices, warranty documents, and asset photos |
| Phase 5 | Add report exports and scheduled reports                            |
| Phase 6 | Add Redis caching and background workers                            |
| Phase 7 | Add observability, metrics, tracing, and alerts                     |
| Phase 8 | Prepare multi-tenant deployment                                     |

---

## Deployment Checklist

- [ ] Set production `DATABASE_URL`
- [ ] Set strong `AUTH_SECRET`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure OAuth credentials if used
- [ ] Run `npm run validate`
- [ ] Run `npm run db:migrate`
- [ ] Confirm seed data is not used as production credentials
- [ ] Configure HTTPS and trusted host settings
- [ ] Configure backups
- [ ] Configure logs and monitoring

---

## Development Workflow

Recommended implementation order:

```text
Repository setup
  -> Database schema and migrations
  -> Authentication and authorization
  -> Organization module
  -> Asset registry
  -> Allocation workflow
  -> Booking workflow
  -> Maintenance workflow
  -> Audit workflow
  -> Notifications
  -> Reports and exports
  -> Production hardening
```

---

## Team Git Workflow

Use feature branches and clear commits.

```bash
git checkout -b feat/assets-api
git add .
git commit -m "Add assets API integration"
git push -u origin feat/assets-api
```

Suggested branch naming:

| Prefix      | Use                    |
| ----------- | ---------------------- |
| `feat/`     | New feature            |
| `fix/`      | Bug fix                |
| `chore/`    | Tooling or maintenance |
| `docs/`     | Documentation          |
| `refactor/` | Internal code cleanup  |

Suggested commit format:

```text
type(scope): short summary
```

Examples:

```text
feat(assets): add asset registration form
fix(auth): handle inactive users during login
chore(prisma): add maintenance request migration
```

---

## Troubleshooting

### Prisma Client is stale

```bash
npm run db:generate
```

### Database connection fails

Check that PostgreSQL is running:

```bash
docker compose ps
```

Then verify `DATABASE_URL` in `.env`.

### Local database needs a clean reset

```bash
npm run db:reset
```

This is destructive and should only be used for local development.

### Build fails after pulling changes

```bash
npm install
npm run db:generate
npm run typecheck
```

---

## License

This project was built for hackathon demonstration purposes. Add the final license selected by the team before public release.
