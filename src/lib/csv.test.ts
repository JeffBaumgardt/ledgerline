import { describe, expect, it } from "vitest"

import { invoicesToCsv } from "@/lib/csv"

describe("csv", () => {
	it("writes headers and rows", () => {
		const csv = invoicesToCsv([
			{
				number: "INV-001",
				clientName: "Acme Co",
				status: "PAID",
				issueDate: "2026-01-15",
				dueDate: "2026-02-15",
				totalCents: 15000,
			},
		])
		expect(csv).toContain("Number,Client,Status,Issue date,Due date,Total")
		expect(csv).toContain("INV-001,Acme Co,PAID,2026-01-15,2026-02-15,$150.00")
	})

	it("escapes commas and quotes in fields", () => {
		const csv = invoicesToCsv([
			{
				number: "INV-002",
				clientName: 'Smith, "Inc"',
				status: "SENT",
				issueDate: "2026-03-01",
				dueDate: "2026-03-31",
				totalCents: 100,
			},
		])
		expect(csv).toContain('"Smith, ""Inc"""')
	})

	it("ends with a trailing newline", () => {
		const csv = invoicesToCsv([])
		expect(csv.endsWith("\n")).toBe(true)
	})
})
