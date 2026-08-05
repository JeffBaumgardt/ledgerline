import { describe, expect, it } from "vitest"

import {
	clientSchema,
	expenseSchema,
	invoiceCreateSchema,
	invoiceFilterSchema,
	invoiceStatusSchema,
	lineItemSchema,
} from "@/lib/validation/schemas"
import { InvoiceStatus } from "@/lib/invoice-status"

describe("schemas", () => {
	it("accepts valid client", () => {
		const result = clientSchema.safeParse({
			name: "River Design",
			email: "hello@river.example",
			company: "River LLC",
		})
		expect(result.success).toBe(true)
	})

	it("trims client name and optional company", () => {
		const result = clientSchema.safeParse({
			name: "  River  ",
			email: "hello@river.example",
			company: "  Co  ",
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.name).toBe("River")
			expect(result.data.company).toBe("Co")
		}
	})

	it("rejects invalid email", () => {
		const result = clientSchema.safeParse({ name: "X", email: "not-an-email" })
		expect(result.success).toBe(false)
	})

	it("rejects empty and oversized client names", () => {
		expect(clientSchema.safeParse({ name: "   ", email: "a@b.co" }).success).toBe(false)
		expect(clientSchema.safeParse({ name: "x".repeat(121), email: "a@b.co" }).success).toBe(false)
	})

	it("rejects zero quantity and negative price", () => {
		expect(lineItemSchema.safeParse({ description: "A", quantity: 0, unitPriceCents: 100 }).success).toBe(
			false,
		)
		expect(
			lineItemSchema.safeParse({ description: "A", quantity: 1, unitPriceCents: -1 }).success,
		).toBe(false)
	})

	it("requires at least one line item on invoices", () => {
		const result = invoiceCreateSchema.safeParse({
			clientId: "c1",
			issueDate: "2026-01-01",
			dueDate: "2026-01-15",
			lineItems: [],
		})
		expect(result.success).toBe(false)
	})

	it("rejects invalid invoice date formats", () => {
		const result = invoiceCreateSchema.safeParse({
			clientId: "c1",
			issueDate: "01/01/2026",
			dueDate: "2026-01-15",
			lineItems: [{ description: "A", quantity: 1, unitPriceCents: 100 }],
		})
		expect(result.success).toBe(false)
	})

	it("accepts a complete invoice create payload", () => {
		const result = invoiceCreateSchema.safeParse({
			clientId: "c1",
			issueDate: "2026-01-01",
			dueDate: "2026-01-15",
			notes: null,
			lineItems: [
				{ description: "Consulting", quantity: 2, unitPriceCents: 15000 },
				{ description: "Expense pass-through", quantity: 1, unitPriceCents: 0 },
			],
		})
		expect(result.success).toBe(true)
	})

	it("rejects zero expense amount", () => {
		const result = expenseSchema.safeParse({
			date: "2026-01-01",
			category: "SOFTWARE",
			amountCents: 0,
			vendor: "Notion",
		})
		expect(result.success).toBe(false)
	})

	it("rejects unknown expense categories", () => {
		const result = expenseSchema.safeParse({
			date: "2026-01-01",
			category: "SNACKS",
			amountCents: 100,
			vendor: "Cafe",
		})
		expect(result.success).toBe(false)
	})

	it("defaults invoice filter status to ALL", () => {
		const result = invoiceFilterSchema.safeParse({})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.status).toBe("ALL")
		}
	})

	it("accepts status transition payload", () => {
		expect(
			invoiceStatusSchema.safeParse({ id: "inv1", status: InvoiceStatus.PAID }).success,
		).toBe(true)
		expect(invoiceStatusSchema.safeParse({ id: "inv1", status: "VOID" }).success).toBe(false)
	})
})
