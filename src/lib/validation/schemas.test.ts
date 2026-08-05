import { describe, expect, it } from "vitest"

import { clientSchema, expenseSchema, lineItemSchema, invoiceCreateSchema } from "@/lib/validation/schemas"

describe("schemas", () => {
	it("accepts valid client", () => {
		const result = clientSchema.safeParse({
			name: "River Design",
			email: "hello@river.example",
			company: "River LLC",
		})
		expect(result.success).toBe(true)
	})

	it("rejects invalid email", () => {
		const result = clientSchema.safeParse({ name: "X", email: "not-an-email" })
		expect(result.success).toBe(false)
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

	it("rejects zero expense amount", () => {
		const result = expenseSchema.safeParse({
			date: "2026-01-01",
			category: "SOFTWARE",
			amountCents: 0,
			vendor: "Notion",
		})
		expect(result.success).toBe(false)
	})
})
