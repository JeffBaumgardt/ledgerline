-- Ledgerline namespaced schema (ll_*) for shared Supabase with Pulseboard / Till & Ticket.
-- App access: @supabase/supabase-js service role (SUPABASE_SECRET_KEY) after Clerk checks.
-- RLS enabled; no permissive anon/authenticated policies.

CREATE TYPE "ll_invoice_status" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');
CREATE TYPE "ll_expense_category" AS ENUM (
    'SOFTWARE',
    'TRAVEL',
    'MEALS',
    'OFFICE_SUPPLIES',
    'CONTRACTORS',
    'MARKETING',
    'UTILITIES',
    'OTHER'
);

CREATE TABLE "ll_users" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "ll_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ll_users_clerk_user_id_key" ON "ll_users"("clerk_user_id");

CREATE TABLE "ll_clients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "ll_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ll_invoices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "ll_invoice_status" NOT NULL DEFAULT 'DRAFT',
    "sent_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "ll_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ll_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ll_line_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ll_expenses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "category" "ll_expense_category" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "vendor" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "ll_expenses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ll_invoices_user_id_number_key" ON "ll_invoices"("user_id", "number");
CREATE INDEX "ll_clients_user_id_idx" ON "ll_clients"("user_id");
CREATE INDEX "ll_invoices_user_id_status_idx" ON "ll_invoices"("user_id", "status");
CREATE INDEX "ll_invoices_user_id_issue_date_idx" ON "ll_invoices"("user_id", "issue_date");
CREATE INDEX "ll_invoices_client_id_idx" ON "ll_invoices"("client_id");
CREATE INDEX "ll_line_items_invoice_id_idx" ON "ll_line_items"("invoice_id");
CREATE INDEX "ll_expenses_user_id_date_idx" ON "ll_expenses"("user_id", "date");
CREATE INDEX "ll_expenses_user_id_category_idx" ON "ll_expenses"("user_id", "category");

ALTER TABLE "ll_clients"
    ADD CONSTRAINT "ll_clients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "ll_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ll_invoices"
    ADD CONSTRAINT "ll_invoices_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "ll_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ll_invoices"
    ADD CONSTRAINT "ll_invoices_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "ll_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ll_line_items"
    ADD CONSTRAINT "ll_line_items_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "ll_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ll_expenses"
    ADD CONSTRAINT "ll_expenses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "ll_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match Pulseboard / Till & Ticket security posture on the shared public schema.
ALTER TABLE "ll_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ll_clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ll_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ll_line_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ll_expenses" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "ll_users" FROM anon, authenticated;
REVOKE ALL ON TABLE "ll_clients" FROM anon, authenticated;
REVOKE ALL ON TABLE "ll_invoices" FROM anon, authenticated;
REVOKE ALL ON TABLE "ll_line_items" FROM anon, authenticated;
REVOKE ALL ON TABLE "ll_expenses" FROM anon, authenticated;

GRANT ALL ON TABLE "ll_users" TO service_role;
GRANT ALL ON TABLE "ll_clients" TO service_role;
GRANT ALL ON TABLE "ll_invoices" TO service_role;
GRANT ALL ON TABLE "ll_line_items" TO service_role;
GRANT ALL ON TABLE "ll_expenses" TO service_role;
