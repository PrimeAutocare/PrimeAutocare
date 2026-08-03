# PrimeAutocare

A full-stack vehicle service center management system built with a **FastAPI
REST API** backend and a **React 19 single-page application** frontend. It
tracks customers, vehicles, service jobs (creation through completion),
invoicing, payments, and employee attendance against a normalized
**PostgreSQL** schema.

Built as a portfolio project by a two-person team —
[Inuka Wijerathna](https://github.com/InukaWijerathna) and
[Senuka Wijerathna](https://github.com/SenukaWijerathna) —
under the [PrimeAutocare](https://github.com/PrimeAutocare) organisation. The
project is designed to run itself with zero manual intervention:

- The app is **deployed on Vercel** as a serverless function (FastAPI wrapped
  for the Python runtime) with a static frontend build.
- [Activity_Simulator](https://github.com/PrimeAutocare/Activity_Simulator)
  drives the live REST API on a **GitHub Actions cron schedule**, authenticating
  as a bot employee to simulate realistic day-to-day shop activity (job status
  transitions, invoicing, payments), and backfills employee attendance
  worklogs directly against Postgres.
- [Reporting_Automation](https://github.com/PrimeAutocare/Reporting_Automation)
  runs a fortnightly **ETL pipeline** against the live database, generating
  business intelligence reports and publishing them to
  [Generated_Reports](https://github.com/PrimeAutocare/Generated_Reports) with
  no human in the loop.

## Technical Highlights

- **Backend** — Python REST API built with **FastAPI**, **SQLAlchemy ORM**, and
  **Pydantic** schema validation; layered router/schema/model architecture
  with dependency-injected database sessions
- **Authentication & Authorization** — **JWT** (JSON Web Token) access tokens
  issued on login, transported via **httpOnly, secure cookies**; **bcrypt**
  password hashing; **role-based access control (RBAC)** enforced through
  FastAPI dependency injection (`require_role`) across Admin, Supervisor, and
  Technician roles
- **Database** — **PostgreSQL** (hosted on Neon) with a normalized relational
  schema: primary/foreign key constraints, `CHECK` constraints enforcing
  business rules (e.g. a job can't move to "in-progress" without an assigned
  technician), and human-readable sequence-generated identifiers
- **API Design** — RESTful **CRUD** endpoints across nine resources (jobs,
  invoices, payments, customers, vehicles, employees, job types, attendance,
  auth), consistent HTTP status codes, and structured error handling that
  maps database integrity errors to `409 Conflict` responses
- **Frontend** — **React 19** functional components with hooks, **Vite** build
  tooling, **Tailwind CSS v4** utility-first styling, **React Router v7**
  client-side routing, and a component-based, responsive UI
- **Testing & CI/CD** — **pytest** for backend unit tests, **Vitest** +
  **React Testing Library** for frontend component tests, automated via
  **GitHub Actions CI/CD pipelines** on every push
- **DevOps** — **Docker Compose** for local multi-service orchestration
  (Postgres + backend + frontend), environment-based configuration, and
  serverless deployment via **Vercel**

## Repositories

| Repository | What it is |
| --- | --- |
| **PrimeAutocare** (this repo) | The application: REST API, frontend SPA, database schema |
| [Activity_Simulator](https://github.com/PrimeAutocare/Activity_Simulator) | Scheduled bot that simulates day-to-day shop activity via the live API and backfills attendance worklogs directly in Postgres |
| [Reporting_Automation](https://github.com/PrimeAutocare/Reporting_Automation) | Scheduled Groovy ETL scripts that build Excel business reports from the database |
| [Generated_Reports](https://github.com/PrimeAutocare/Generated_Reports) | Where those reports land, current + archive per period |

## Structure

```
apps/
  backend/     FastAPI + SQLAlchemy API (Python)
  frontend/    React 19 + Vite + Tailwind SPA
api/           Vercel serverless entry point wrapping the backend
database/      Postgres schema, per-table migrations, seed data
docs/          ERD diagrams (conceptual + logical, with draw.io source)
```

## Running locally

The fastest way to get everything running is Docker Compose — it starts
Postgres (seeded from `database/schema.sql` and `database/test_data.sql`),
the backend on `:8000`, and the frontend on `:5173`:

```bash
docker compose up --build
```

### Running services individually

**Backend**

```bash
cd apps/backend
cp .env.example .env   # fill in DATABASE_URL / JWT_SECRET_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd apps/frontend
cp .env.example .env   # fill in VITE_API_BASE_URL if not using the default
npm install
npm run dev
```

## Tests

```bash
cd apps/backend
pytest

cd apps/frontend
npm run lint
npm test
```

## Deployment

`vercel.json` deploys the whole thing to Vercel: the frontend is built as a
static SPA, and `/api/*` is rewritten to `api/index.py`, a serverless function
that wraps the FastAPI backend. The database is hosted Postgres (Neon).

## CI

- `.github/workflows/backend-ci.yml` — installs deps and runs `pytest` on backend changes.
- `.github/workflows/frontend-ci.yml` — lints and builds the frontend on frontend changes.

## Team

- [Inuka Wijerathna](https://github.com/InukaWijerathna)
- [Senuka Wijerathna](https://github.com/SenukaWijerathna)
