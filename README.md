# Ledgerline

[![CI](https://github.com/JeffBaumgardt/ledgerline/actions/workflows/ci.yml/badge.svg)](https://github.com/JeffBaumgardt/ledgerline/actions/workflows/ci.yml)
[![Test reports](https://img.shields.io/badge/test%20reports-GitHub%20Pages-0b6b5a)](https://jeffbaumgardt.github.io/ledgerline/)

Small-business **invoice and expense tracker** with filtering, CSV export, and a deliberately loud testing story: **Vitest** unit tests, **Playwright** E2E, and **GitHub Actions** that publish HTML reports to GitHub Pages.

## Why this demo

Most portfolios show screenshots. Ledgerline shows **business logic unit tests**, **browser E2E**, and **CI artifacts you can click** from the [Test reports](https://jeffbaumgardt.github.io/ledgerline/) page and the in-app `/testing` route.

## Stack

- **Next.js** (App Router) · **React** · **TypeScript** · **Tailwind CSS**
- **Clerk** — email/password gate for `/app/**`
- **Supabase** — shared Pulseboard project; **`ll_*` namespaced tables**; `@supabase/supabase-js` service role (same pattern as [Till & Ticket](https://github.com/JeffBaumgardt/till-and-ticket))
- **Zod** · **Server Actions** · **TanStack Table**
- **Vitest** (+ HTML reporter) · **Playwright** (+ HTML reporter) · **GitHub Actions**

## Features

- Clients: create, edit, archive  
- Invoices: line items, totals in cents, mark sent / paid  
- Overdue derived from due date (unit-tested pure function)  
- Invoice table: status / client / date filters, sortable columns, **Export CSV**  
- Expenses by category  
- Dashboard aggregates: outstanding, paid this month, expenses this month  

## Local setup

```bash
pnpm install
cp .env.example .env.local
# Fill Supabase (pulseboard project) + Clerk keys
# Apply migration once against the shared DB (see below)
pnpm db:seed   # optional — needs SEED_CLERK_USER_ID for your Clerk user
pnpm dev
```

### Schema (`ll_*` only)

SQL lives in [`supabase/migrations/20260805190000_ll_initial_schema.sql`](./supabase/migrations/20260805190000_ll_initial_schema.sql). Apply it to the **shared Pulseboard Supabase project** (e.g. SQL editor, or `supabase db push` if linked). It does **not** touch Pulseboard or `tat_*` tables.

### Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Shared Pulseboard Supabase URL |
| `SUPABASE_SECRET_KEY` | **Server only** service role |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` |
| `SEED_CLERK_USER_ID` / `SEED_CLERK_USER_EMAIL` | Seed targets your Clerk user |
| `E2E_CLERK_USER_EMAIL` | Playwright `@clerk/testing` sign-in |

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint` / `typecheck` | Quality gates |
| `pnpm test` | Vitest unit tests (writes `reports/vitest`) |
| `pnpm e2e` | Playwright E2E (writes `reports/playwright`) |
| `pnpm db:seed` | Idempotent seed for **this** Clerk user’s `ll_*` rows |

Open local reports after tests:

```bash
npx vite preview --outDir reports/vitest
npx playwright show-report reports/playwright
```

## Test reports (published)

On every push to `main`, CI uploads report artifacts and deploys a small site:

- https://jeffbaumgardt.github.io/ledgerline/  
- https://jeffbaumgardt.github.io/ledgerline/vitest/  
- https://jeffbaumgardt.github.io/ledgerline/playwright/  

Same links from the app: [/testing](/testing).

## Architecture (blurb)

Clerk protects `/app/**`. Server Actions call `ensureUser()` to upsert `ll_users`, then PostgREST via the service role on namespaced tables. Money is integer cents. `getEffectiveStatus` treats past-due `SENT` invoices as `OVERDUE` without a background job.

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Deploy (Vercel)

1. Import the GitHub repo on Vercel  
2. Set the same Supabase + Clerk env vars as local  
3. Set `NEXT_PUBLIC_APP_URL` to the production URL  
4. Clerk Dashboard → allow the Vercel domain  
5. Re-seed if needed: `pnpm db:seed` with production secrets  

## Docs

| Doc | Purpose |
|-----|---------|
| [PITCH.md](./PITCH.md) | Product pitch |
| [PLAN.md](./PLAN.md) | Build plan summary |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Data + auth + test publishing |

## ATS keywords

Vitest · Playwright · Unit Testing · E2E Testing · GitHub Actions · CI/CD · Next.js · TypeScript · PostgreSQL · Supabase · TanStack Table · Accessibility · ARIA · Form Validation · CSV Export · Server Actions · Zod
