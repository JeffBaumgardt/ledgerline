import type { StoredInvoiceStatus } from "@/lib/invoice-status"
import type { ExpenseCategory } from "@/lib/validation/schemas"
import type { Client, Expense, Invoice, LineItem, User } from "@/server/types"

function asDate(value: string | Date | null | undefined): Date | null {
	if (value == null) return null
	if (value instanceof Date) return value
	return new Date(value)
}

function asDateRequired(value: string | Date): Date {
	return value instanceof Date ? value : new Date(value)
}

export type LlUserRow = {
	id: string
	clerk_user_id: string
	email: string
	name: string | null
	created_at: string
	updated_at: string
}

export type LlClientRow = {
	id: string
	user_id: string
	name: string
	email: string
	company: string | null
	archived_at: string | null
	created_at: string
	updated_at: string
}

export type LlInvoiceRow = {
	id: string
	user_id: string
	client_id: string
	number: string
	issue_date: string
	due_date: string
	status: StoredInvoiceStatus
	sent_at: string | null
	paid_at: string | null
	notes: string | null
	created_at: string
	updated_at: string
}

export type LlLineItemRow = {
	id: string
	invoice_id: string
	description: string
	quantity: number
	unit_price_cents: number
	position: number
}

export type LlExpenseRow = {
	id: string
	user_id: string
	date: string
	category: ExpenseCategory
	amount_cents: number
	vendor: string
	notes: string | null
	created_at: string
}

export function mapUser(row: LlUserRow): User {
	return {
		id: row.id,
		clerkUserId: row.clerk_user_id,
		email: row.email,
		name: row.name,
		createdAt: asDateRequired(row.created_at),
		updatedAt: asDateRequired(row.updated_at),
	}
}

export function mapClient(row: LlClientRow): Client {
	return {
		id: row.id,
		userId: row.user_id,
		name: row.name,
		email: row.email,
		company: row.company,
		archivedAt: asDate(row.archived_at),
		createdAt: asDateRequired(row.created_at),
		updatedAt: asDateRequired(row.updated_at),
	}
}

export function mapInvoice(row: LlInvoiceRow): Invoice {
	return {
		id: row.id,
		userId: row.user_id,
		clientId: row.client_id,
		number: row.number,
		issueDate: String(row.issue_date).slice(0, 10),
		dueDate: String(row.due_date).slice(0, 10),
		status: row.status,
		sentAt: asDate(row.sent_at),
		paidAt: asDate(row.paid_at),
		notes: row.notes,
		createdAt: asDateRequired(row.created_at),
		updatedAt: asDateRequired(row.updated_at),
	}
}

export function mapLineItem(row: LlLineItemRow): LineItem {
	return {
		id: row.id,
		invoiceId: row.invoice_id,
		description: row.description,
		quantity: row.quantity,
		unitPriceCents: row.unit_price_cents,
		position: row.position,
	}
}

export function mapExpense(row: LlExpenseRow): Expense {
	return {
		id: row.id,
		userId: row.user_id,
		date: String(row.date).slice(0, 10),
		category: row.category,
		amountCents: row.amount_cents,
		vendor: row.vendor,
		notes: row.notes,
		createdAt: asDateRequired(row.created_at),
	}
}
