# Ledgerline — Product Pitch

## One-liner

**Ledgerline** is a small-business invoice and expense tracker with filtering, CSV export, and a serious Vitest + Playwright + CI story — not just UI.

## Problem

Almost every portfolio claims “TypeScript” and “Next.js.” Almost none show automated tests or CI. ATS systems and technical screens still filter on Vitest/Jest, Playwright/Cypress, and GitHub Actions. A clean invoice app that is obviously tested differentiates you from ten other CRUD demos.

Secondary problem: business-tool UIs (tables, filters, money formatting, status badges) are exactly what many internal tools and B2B products look like day to day.

## Audience

- Recruiters screening for unit testing, E2E, CI/CD
- Hiring managers who want evidence you can maintain software, not only ship screenshots

## Solution

A single-workspace finance lite app:

| Concept | Description |
|---------|-------------|
| **Client** | Name, email, company |
| **Invoice** | Client, issue/due dates, line items, status (`DRAFT` \| `SENT` \| `PAID` \| `OVERDUE`) |
| **Line item** | Description, quantity, unit price |
| **Expense** | Date, category, amount, vendor, notes |
| **Dashboard** | Outstanding, paid this month, expenses this month |

### Must-have user flows

1. Create / edit / archive clients  
2. Create invoice with line items; compute subtotal/total  
3. Mark invoice sent → paid (overdue derived from due date when listing)  
4. Create expenses with categories  
5. Filter invoices by status, client, date range  
6. Sort columns on the invoice table  
7. Export filtered invoices to CSV  
8. Dashboard widgets reflect real aggregates  

### Demo affordances

- Seeded clients, invoices, expenses (`pnpm db:seed`)  
- Clerk email auth  
- Public `/testing` page with links to published HTML reports  
- README CI badge  

### Out of scope (v1)

Accounting integrations · multi-currency FX · PDF generation · payroll · bank sync  

## Success criteria

README shows a green CI badge. A reviewer can run unit tests locally and open Vitest/Playwright HTML reports. The UI is polished enough that the testing story does not look bolted onto a broken app.
