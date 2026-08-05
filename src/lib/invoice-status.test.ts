import { describe, expect, it } from "vitest"

import { getEffectiveStatus, InvoiceStatus, isOverdue } from "@/lib/invoice-status"

describe("invoice-status", () => {
	const now = new Date(2026, 7, 5) // Aug 5, 2026 local

	it("keeps DRAFT and PAID as stored", () => {
		expect(
			getEffectiveStatus({ status: InvoiceStatus.DRAFT, dueDate: "2020-01-01" }, now),
		).toBe(InvoiceStatus.DRAFT)
		expect(
			getEffectiveStatus({ status: InvoiceStatus.PAID, dueDate: "2020-01-01" }, now),
		).toBe(InvoiceStatus.PAID)
	})

	it("marks SENT as OVERDUE when past due date", () => {
		expect(
			getEffectiveStatus({ status: InvoiceStatus.SENT, dueDate: "2026-08-01" }, now),
		).toBe(InvoiceStatus.OVERDUE)
		expect(isOverdue({ status: InvoiceStatus.SENT, dueDate: "2026-08-01" }, now)).toBe(true)
	})

	it("keeps SENT when due today or in the future", () => {
		expect(
			getEffectiveStatus({ status: InvoiceStatus.SENT, dueDate: "2026-08-05" }, now),
		).toBe(InvoiceStatus.SENT)
		expect(
			getEffectiveStatus({ status: InvoiceStatus.SENT, dueDate: "2026-08-10" }, now),
		).toBe(InvoiceStatus.SENT)
	})

	it("preserves stored OVERDUE", () => {
		expect(
			getEffectiveStatus({ status: InvoiceStatus.OVERDUE, dueDate: "2026-12-01" }, now),
		).toBe(InvoiceStatus.OVERDUE)
	})

	it("accepts Date dueDate values", () => {
		expect(
			getEffectiveStatus(
				{ status: InvoiceStatus.SENT, dueDate: new Date(2026, 7, 1) },
				now,
			),
		).toBe(InvoiceStatus.OVERDUE)
		expect(
			getEffectiveStatus(
				{ status: InvoiceStatus.SENT, dueDate: new Date(2026, 7, 20) },
				now,
			),
		).toBe(InvoiceStatus.SENT)
	})

	it("isOverdue is false for draft and future sent", () => {
		expect(isOverdue({ status: InvoiceStatus.DRAFT, dueDate: "2020-01-01" }, now)).toBe(false)
		expect(isOverdue({ status: InvoiceStatus.SENT, dueDate: "2026-12-31" }, now)).toBe(false)
	})
})
