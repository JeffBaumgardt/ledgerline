import { describe, expect, it } from "vitest"

import {
	mapClient,
	mapExpense,
	mapInvoice,
	mapLineItem,
	mapUser,
	type LlClientRow,
	type LlExpenseRow,
	type LlInvoiceRow,
	type LlLineItemRow,
	type LlUserRow,
} from "@/server/map-rows"

describe("map-rows", () => {
	it("maps user snake_case to camelCase", () => {
		const row: LlUserRow = {
			id: "u1",
			clerk_user_id: "clerk_1",
			email: "a@example.com",
			name: "Ada",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-02T00:00:00.000Z",
		}
		const user = mapUser(row)
		expect(user.clerkUserId).toBe("clerk_1")
		expect(user.email).toBe("a@example.com")
		expect(user.createdAt).toBeInstanceOf(Date)
	})

	it("maps client archived timestamps as null or Date", () => {
		const base: LlClientRow = {
			id: "c1",
			user_id: "u1",
			name: "Acme",
			email: "a@acme.test",
			company: null,
			archived_at: null,
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T00:00:00.000Z",
		}
		expect(mapClient(base).archivedAt).toBeNull()
		expect(mapClient({ ...base, archived_at: "2026-02-01T12:00:00.000Z" }).archivedAt).toBeInstanceOf(
			Date,
		)
	})

	it("normalizes invoice dates to YYYY-MM-DD strings", () => {
		const row: LlInvoiceRow = {
			id: "i1",
			user_id: "u1",
			client_id: "c1",
			number: "INV-001",
			issue_date: "2026-03-01T00:00:00.000Z",
			due_date: "2026-03-15",
			status: "DRAFT",
			sent_at: null,
			paid_at: null,
			notes: "Note",
			created_at: "2026-03-01T00:00:00.000Z",
			updated_at: "2026-03-01T00:00:00.000Z",
		}
		const inv = mapInvoice(row)
		expect(inv.issueDate).toBe("2026-03-01")
		expect(inv.dueDate).toBe("2026-03-15")
		expect(inv.notes).toBe("Note")
	})

	it("maps line item price field", () => {
		const row: LlLineItemRow = {
			id: "li1",
			invoice_id: "i1",
			description: "Work",
			quantity: 2,
			unit_price_cents: 1500,
			position: 0,
		}
		expect(mapLineItem(row)).toMatchObject({
			invoiceId: "i1",
			unitPriceCents: 1500,
			quantity: 2,
		})
	})

	it("maps expense amounts and categories", () => {
		const row: LlExpenseRow = {
			id: "e1",
			user_id: "u1",
			date: "2026-04-10T00:00:00.000Z",
			category: "SOFTWARE",
			amount_cents: 999,
			vendor: "GitHost",
			notes: null,
			created_at: "2026-04-10T00:00:00.000Z",
		}
		const exp = mapExpense(row)
		expect(exp.date).toBe("2026-04-10")
		expect(exp.amountCents).toBe(999)
		expect(exp.category).toBe("SOFTWARE")
	})
})
