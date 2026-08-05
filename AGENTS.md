# Agent notes — Ledgerline

- Respect `ll_*` namespace only on the shared Supabase project; never mutate Pulseboard or `tat_*` tables.
- Prefer pure functions in `src/lib/*` for money, CSV, and overdue status (unit-testable without DB).
- Do not expose `SUPABASE_SECRET_KEY` to the client; use `getSupabaseAdmin()` only from server modules.
- UI stack is Tailwind + TanStack Table (not MUI).
- Keep CI test-report publishing working when changing Vitest/Playwright reporter paths (`reports/vitest`, `reports/playwright`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
