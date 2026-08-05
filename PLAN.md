# Ledgerline — Build Plan

Portfolio demo: invoices + expenses with **Vitest HTML** and **Playwright HTML** reports published via **GitHub Actions → GitHub Pages**.

Phases:

1. **Bootstrap** — Next.js, Tailwind, Clerk, pnpm, Prettier, docs  
2. **Data** — shared Supabase `ll_*` schema, repository, seed  
3. **Auth** — Clerk protects `/app/**`  
4. **Business logic + unit tests** — money, status, CSV, Zod + Vitest reporters  
5. **UI** — dashboard, clients, invoices (TanStack Table), expenses  
6. **E2E** — Playwright + `@clerk/testing`  
7. **CI + publish** — lint/typecheck/unit/e2e + Pages deployment  
8. **Polish + ship** — README, ARCHITECTURE, Vercel  

Non-negotiables are in [ARCHITECTURE.md](./ARCHITECTURE.md) and [PITCH.md](./PITCH.md).
