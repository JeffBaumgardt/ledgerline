# Architecture

Ledgerline is a single-workspace invoice and expense app. Auth is **Clerk** (email/password). Data lives in a **shared Supabase Postgres** project (with Pulseboard and Till & Ticket) under a **`ll_*` table namespace**. The Next.js App Router owns UI and Server Actions.

## Request path

```
Browser
  → proxy.ts (clerkMiddleware; protect /app/**)
  → Server Component / Server Action
  → ensureUser()  (Clerk session → upsert ll_users by clerk_user_id)
  → getSupabaseAdmin() (service role; RLS enabled, no anon policies)
  → Postgres ll_* tables
```

Authorization is **never** taken from the client. Every mutation Zod-validates input, then scopes queries to the local `ll_users.id`.

## Shared database

| App | Tables |
|-----|--------|
| Pulseboard | unprefixed (`users`, `boards`, …) |
| Till & Ticket | `tat_*` |
| Ledgerline | `ll_*` |

Security posture (same as Till & Ticket):

- RLS enabled on all `ll_*` tables  
- `anon` / `authenticated` revoked  
- App uses **service role** only on the server after Clerk checks  

## Schema (summary)

```
ll_users ──< ll_clients
   │
   ├──< ll_invoices ──< ll_line_items
   │
   └──< ll_expenses
```

Enums: `ll_invoice_status`, `ll_expense_category`. Money is **integer cents**.

## Overdue status

Stored status stays `SENT` until paid. Display and filters use pure `getEffectiveStatus(invoice, now)`:

- `DRAFT` / `PAID` → unchanged  
- `SENT` past `due_date` → `OVERDUE`  

No cron job; avoids mutating rows on read. Unit-tested in `src/lib/invoice-status.test.ts`.

## Key modules

| Path | Role |
|------|------|
| `src/proxy.ts` | Clerk middleware |
| `src/server/supabase.ts` | Service-role client |
| `src/server/auth.ts` | `ensureUser` |
| `src/server/repository.ts` | `ll_*` data access |
| `src/server/actions.ts` | Zod-gated mutations |
| `src/lib/money.ts` | Cents math + format |
| `src/lib/csv.ts` | Invoice CSV export |
| `supabase/migrations/` | Namespaced SQL |

## Testing + published reports

```
CI: lint → typecheck → vitest (HTML → reports/vitest)
                    → playwright (HTML → reports/playwright)
         → (main) assemble site/ + GitHub Pages
```

Live report index: `https://jeffbaumgardt.github.io/ledgerline/`  
In-app links: `/testing`

## Stack keywords

Next.js · TypeScript · React · PostgreSQL · Supabase · Clerk · Server Actions · Zod · Vitest · Playwright · GitHub Actions · CI/CD · TanStack Table · Accessibility · CSV Export
