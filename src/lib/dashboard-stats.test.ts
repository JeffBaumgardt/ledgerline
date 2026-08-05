import { describe, expect, it } from "vitest"

import { computeDashboardStats } from "@/lib/dashboard-stats"
import { InvoiceStatus } from "@/lib/invoice-status"

describe("computeDashboardStats", () => {
	const now = new Date(2026, 7, 15) // Aug 15, 2026

	it("sums outstanding SENT and OVERDUE by effective status", () => {
		const stats = computeDashboardStats(
			[
				{
					status: InvoiceStatus.SENT,
					dueDate: "2026-08-20",
					totalCents: 10_000,
					paidAt: null,
				},
				{
					status: InvoiceStatus.SENT,
					dueDate: "2026-08-01",
					totalCents: 5_000,
					paidAt: null,
				},
				{
					status: InvoiceStatus.DRAFT,
					dueDate: "2026-08-01",
					totalCents: 99_999,
					paidAt: null,
				},
				{
					status: InvoiceStatus.PAID,
					dueDate: "2026-07-01",
					totalCents: 2_000,
					paidAt: new Date(2026, 6, 10),
				},
			],
			[],
			now,
		)
		// 10k still-sent + 5k effective overdue
		expect(stats.outstandingCents).toBe(15_000)
		expect(stats.paidThisMonthCents).toBe(0)
	})

	it("counts paid this calendar month only", () => {
		const stats = computeDashboardStats(
			[
				{
					status: InvoiceStatus.PAID,
					dueDate: "2026-08-01",
					totalCents: 3_000,
					paidAt: new Date(2026, 7, 3),
				},
				{
					status: InvoiceStatus.PAID,
					dueDate: "2026-07-01",
					totalCents: 9_000,
					paidAt: new Date(2026, 6, 20),
				},
				{
					status: InvoiceStatus.PAID,
					dueDate: "2026-08-01",
					totalCents: 1_000,
					paidAt: null,
				},
			],
			[],
			now,
		)
		expect(stats.paidThisMonthCents).toBe(3_000)
	})

	it("sums expenses in the current month", () => {
		const stats = computeDashboardStats(
			[],
			[
				{ date: "2026-08-01", amountCents: 500 },
				{ date: "2026-08-15", amountCents: 250 },
				{ date: "2026-07-31", amountCents: 9_000 },
			],
			now,
		)
		expect(stats.expensesThisMonthCents).toBe(750)
		expect(stats.outstandingCents).toBe(0)
	})
})
