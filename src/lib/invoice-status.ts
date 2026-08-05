export const InvoiceStatus = {
	DRAFT: "DRAFT",
	SENT: "SENT",
	PAID: "PAID",
	OVERDUE: "OVERDUE",
} as const

export type StoredInvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export type InvoiceStatusInput = {
	status: StoredInvoiceStatus
	dueDate: Date | string
}

function toDateOnly(value: Date | string): Date {
	if (typeof value === "string") {
		// DATE columns come as YYYY-MM-DD
		const [y, m, d] = value.slice(0, 10).split("-").map(Number)
		return new Date(y, m - 1, d)
	}
	return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

/**
 * Derive display / filter status. SENT invoices past due date become OVERDUE
 * without mutating the stored row (pure, unit-tested).
 */
export function getEffectiveStatus(
	invoice: InvoiceStatusInput,
	now: Date = new Date(),
): StoredInvoiceStatus {
	if (invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.PAID) {
		return invoice.status
	}

	if (invoice.status === InvoiceStatus.OVERDUE) {
		return InvoiceStatus.OVERDUE
	}

	// SENT (or legacy OVERDUE stored value handled above)
	const due = toDateOnly(invoice.dueDate)
	const today = toDateOnly(now)
	if (due < today) {
		return InvoiceStatus.OVERDUE
	}
	return InvoiceStatus.SENT
}

export function isOverdue(invoice: InvoiceStatusInput, now: Date = new Date()): boolean {
	return getEffectiveStatus(invoice, now) === InvoiceStatus.OVERDUE
}
