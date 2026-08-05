import type { StoredInvoiceStatus } from "@/lib/invoice-status"
import type { ExpenseCategory } from "@/lib/validation/schemas"

export type User = {
	id: string
	clerkUserId: string
	email: string
	name: string | null
	createdAt: Date
	updatedAt: Date
}

export type Client = {
	id: string
	userId: string
	name: string
	email: string
	company: string | null
	archivedAt: Date | null
	createdAt: Date
	updatedAt: Date
}

export type LineItem = {
	id: string
	invoiceId: string
	description: string
	quantity: number
	unitPriceCents: number
	position: number
}

export type Invoice = {
	id: string
	userId: string
	clientId: string
	number: string
	issueDate: string
	dueDate: string
	status: StoredInvoiceStatus
	sentAt: Date | null
	paidAt: Date | null
	notes: string | null
	createdAt: Date
	updatedAt: Date
}

export type InvoiceWithDetails = Invoice & {
	client: Client
	lineItems: LineItem[]
	totalCents: number
}

export type Expense = {
	id: string
	userId: string
	date: string
	category: ExpenseCategory
	amountCents: number
	vendor: string
	notes: string | null
	createdAt: Date
}

export type DashboardStats = {
	outstandingCents: number
	paidThisMonthCents: number
	expensesThisMonthCents: number
}
