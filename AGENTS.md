# Agent notes — Ledgerline

- Respect `ll_*` namespace only on the shared Supabase project; never mutate Pulseboard or `tat_*` tables.
- Prefer pure functions in `src/lib/*` for money, CSV, and overdue status (unit-testable without DB).
- Do not expose `SUPABASE_SECRET_KEY` to the client; use `getSupabaseAdmin()` only from server modules.
- UI stack is Tailwind + TanStack Table (not MUI).
- Keep CI test-report publishing working when changing Vitest/Playwright reporter paths (`reports/vitest`, `reports/playwright`).
