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
