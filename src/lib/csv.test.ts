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

	it("trims ISO datetimes to date-only fields", () => {
		const csv = invoicesToCsv([
			{
				number: "INV-003",
				clientName: "Solo",
				status: "DRAFT",
				issueDate: "2026-05-01T12:34:56.000Z",
				dueDate: "2026-05-15T00:00:00.000Z",
				totalCents: 0,
			},
		])
		expect(csv).toContain("2026-05-01")
		expect(csv).toContain("2026-05-15")
		expect(csv).not.toContain("12:34")
	})

	it("serializes multiple rows in order", () => {
		const csv = invoicesToCsv([
			{
				number: "INV-001",
				clientName: "A",
				status: "DRAFT",
				issueDate: "2026-01-01",
				dueDate: "2026-01-02",
				totalCents: 100,
			},
			{
				number: "INV-002",
				clientName: "B",
				status: "SENT",
				issueDate: "2026-01-03",
				dueDate: "2026-01-04",
				totalCents: 200,
			},
		])
		const lines = csv.trimEnd().split("\n")
		expect(lines).toHaveLength(3)
		expect(lines[1]).toContain("INV-001")
		expect(lines[2]).toContain("INV-002")
	})
})
