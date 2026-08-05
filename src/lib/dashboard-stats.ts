import { InvoiceStatus, getEffectiveStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"

export type DashboardInvoiceInput = {
	status: StoredInvoiceStatus
	dueDate: string
	totalCents: number
	paidAt: Date | null
}

export type DashboardExpenseInput = {
	date: string
	amountCents: number
}

export type DashboardTotals = {
	outstandingCents: number
	paidThisMonthCents: number
	expensesThisMonthCents: number
}

/**
 * Pure dashboard aggregates — invocable from unit tests without Supabase.
 */
export function computeDashboardStats(
	invoices: DashboardInvoiceInput[],
	expenses: DashboardExpenseInput[],
	now: Date = new Date(),
): DashboardTotals {
	const year = now.getFullYear()
	const month = now.getMonth()

	let outstandingCents = 0
	let paidThisMonthCents = 0

	for (const inv of invoices) {
		const effective = getEffectiveStatus(inv, now)
		if (effective === InvoiceStatus.SENT || effective === InvoiceStatus.OVERDUE) {
			outstandingCents += inv.totalCents
		}
		if (effective === InvoiceStatus.PAID && inv.paidAt) {
			if (inv.paidAt.getFullYear() === year && inv.paidAt.getMonth() === month) {
				paidThisMonthCents += inv.totalCents
			}
		}
	}

	let expensesThisMonthCents = 0
	for (const exp of expenses) {
		const [y, m] = exp.date.split("-").map(Number)
		if (y === year && m - 1 === month) {
			expensesThisMonthCents += exp.amountCents
		}
	}

	return { outstandingCents, paidThisMonthCents, expensesThisMonthCents }
}
