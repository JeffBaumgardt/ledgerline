import "server-only"

import { computeDashboardStats } from "@/lib/dashboard-stats"
import { InvoiceStatus, getEffectiveStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"
import { nextInvoiceNumberFrom } from "@/lib/invoice-number"
import { invoiceTotalCents } from "@/lib/money"
import type { ExpenseCategory } from "@/lib/validation/schemas"
import {
	mapClient,
	mapExpense,
	mapInvoice,
	mapLineItem,
	mapUser,
	type LlClientRow,
	type LlExpenseRow,
	type LlInvoiceRow,
	type LlLineItemRow,
	type LlUserRow,
} from "@/server/map-rows"
import { getSupabaseAdmin, newId, throwOnError } from "@/server/supabase"
import type { Client, DashboardStats, Expense, Invoice, InvoiceWithDetails, LineItem, User } from "@/server/types"

export async function upsertUserByClerk(input: {
	clerkUserId: string
	email: string
	name: string | null
}): Promise<User> {
	const supabase = getSupabaseAdmin()
	const now = new Date().toISOString()

	const { data: existing, error: findError } = await supabase
		.from("ll_users")
		.select("*")
		.eq("clerk_user_id", input.clerkUserId)
		.maybeSingle()
	throwOnError(findError, "upsertUser find")

	if (existing) {
		const { data: updated, error: updateError } = await supabase
			.from("ll_users")
			.update({ email: input.email, name: input.name, updated_at: now })
			.eq("id", (existing as LlUserRow).id)
			.select("*")
			.single()
		throwOnError(updateError, "upsertUser update")
		return mapUser(updated as LlUserRow)
	}

	const { data: created, error: createError } = await supabase
		.from("ll_users")
		.insert({
			id: newId(),
			clerk_user_id: input.clerkUserId,
			email: input.email,
			name: input.name,
			created_at: now,
			updated_at: now,
		})
		.select("*")
		.single()
	throwOnError(createError, "upsertUser create")
	return mapUser(created as LlUserRow)
}

export async function listClients(userId: string, opts?: { includeArchived?: boolean }): Promise<Client[]> {
	const supabase = getSupabaseAdmin()
	let query = supabase.from("ll_clients").select("*").eq("user_id", userId).order("name", { ascending: true })

	if (!opts?.includeArchived) {
		query = query.is("archived_at", null)
	}

	const { data, error } = await query
	throwOnError(error, "listClients")
	return (data as LlClientRow[] | null)?.map(mapClient) ?? []
}

export async function getClient(userId: string, clientId: string): Promise<Client | null> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_clients")
		.select("*")
		.eq("user_id", userId)
		.eq("id", clientId)
		.maybeSingle()
	throwOnError(error, "getClient")
	return data ? mapClient(data as LlClientRow) : null
}

export async function createClient(
	userId: string,
	input: { name: string; email: string; company?: string | null },
): Promise<Client> {
	const supabase = getSupabaseAdmin()
	const now = new Date().toISOString()
	const { data, error } = await supabase
		.from("ll_clients")
		.insert({
			id: newId(),
			user_id: userId,
			name: input.name,
			email: input.email,
			company: input.company ?? null,
			created_at: now,
			updated_at: now,
		})
		.select("*")
		.single()
	throwOnError(error, "createClient")
	return mapClient(data as LlClientRow)
}

export async function updateClient(
	userId: string,
	clientId: string,
	input: { name: string; email: string; company?: string | null },
): Promise<Client> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_clients")
		.update({
			name: input.name,
			email: input.email,
			company: input.company ?? null,
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", userId)
		.eq("id", clientId)
		.select("*")
		.single()
	throwOnError(error, "updateClient")
	return mapClient(data as LlClientRow)
}

export async function archiveClient(userId: string, clientId: string): Promise<Client> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_clients")
		.update({
			archived_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", userId)
		.eq("id", clientId)
		.select("*")
		.single()
	throwOnError(error, "archiveClient")
	return mapClient(data as LlClientRow)
}

async function attachInvoiceDetails(
	invoices: Invoice[],
	clientsById: Map<string, Client>,
): Promise<InvoiceWithDetails[]> {
	if (invoices.length === 0) return []

	const supabase = getSupabaseAdmin()
	const ids = invoices.map((i) => i.id)
	const { data: items, error } = await supabase
		.from("ll_line_items")
		.select("*")
		.in("invoice_id", ids)
		.order("position", { ascending: true })
	throwOnError(error, "attachInvoiceDetails")

	const itemsByInvoice = new Map<string, LineItem[]>()
	for (const row of (items as LlLineItemRow[] | null) ?? []) {
		const item = mapLineItem(row)
		const list = itemsByInvoice.get(item.invoiceId) ?? []
		list.push(item)
		itemsByInvoice.set(item.invoiceId, list)
	}

	return invoices.map((invoice) => {
		const lineItems = itemsByInvoice.get(invoice.id) ?? []
		const client = clientsById.get(invoice.clientId)
		if (!client) {
			throw new Error(`Missing client ${invoice.clientId} for invoice ${invoice.id}`)
		}
		return {
			...invoice,
			client,
			lineItems,
			totalCents: invoiceTotalCents(lineItems),
		}
	})
}

export type InvoiceListFilters = {
	status?: "ALL" | StoredInvoiceStatus
	clientId?: string
	from?: string
	to?: string
}

export async function listInvoices(userId: string, filters: InvoiceListFilters = {}): Promise<InvoiceWithDetails[]> {
	const supabase = getSupabaseAdmin()
	let query = supabase.from("ll_invoices").select("*").eq("user_id", userId).order("issue_date", {
		ascending: false,
	})

	if (filters.clientId) {
		query = query.eq("client_id", filters.clientId)
	}
	if (filters.from) {
		query = query.gte("issue_date", filters.from)
	}
	if (filters.to) {
		query = query.lte("issue_date", filters.to)
	}

	// Overdue is derived for SENT rows — filter stored statuses accordingly
	if (filters.status === InvoiceStatus.OVERDUE) {
		query = query.in("status", [InvoiceStatus.SENT, InvoiceStatus.OVERDUE])
	} else if (filters.status === InvoiceStatus.SENT) {
		query = query.eq("status", InvoiceStatus.SENT)
	} else if (filters.status && filters.status !== "ALL") {
		query = query.eq("status", filters.status)
	}

	const { data, error } = await query
	throwOnError(error, "listInvoices")

	const invoices = ((data as LlInvoiceRow[] | null) ?? []).map(mapInvoice)
	const clients = await listClients(userId, { includeArchived: true })
	const clientsById = new Map(clients.map((c) => [c.id, c]))
	let detailed = await attachInvoiceDetails(invoices, clientsById)

	const now = new Date()
	if (filters.status === InvoiceStatus.OVERDUE) {
		detailed = detailed.filter((inv) => getEffectiveStatus(inv, now) === InvoiceStatus.OVERDUE)
	} else if (filters.status === InvoiceStatus.SENT) {
		detailed = detailed.filter((inv) => getEffectiveStatus(inv, now) === InvoiceStatus.SENT)
	}

	return detailed
}

export async function getInvoice(userId: string, invoiceId: string): Promise<InvoiceWithDetails | null> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_invoices")
		.select("*")
		.eq("user_id", userId)
		.eq("id", invoiceId)
		.maybeSingle()
	throwOnError(error, "getInvoice")
	if (!data) return null

	const invoice = mapInvoice(data as LlInvoiceRow)
	const client = await getClient(userId, invoice.clientId)
	if (!client) return null
	const [detailed] = await attachInvoiceDetails([invoice], new Map([[client.id, client]]))
	return detailed ?? null
}

export async function nextInvoiceNumber(userId: string): Promise<string> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_invoices")
		.select("number")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(50)
	throwOnError(error, "nextInvoiceNumber")

	const numbers = ((data as Array<{ number: string }> | null) ?? []).map((row) => String(row.number))
	return nextInvoiceNumberFrom(numbers)
}

export async function createInvoice(
	userId: string,
	input: {
		clientId: string
		issueDate: string
		dueDate: string
		notes?: string | null
		lineItems: Array<{ description: string; quantity: number; unitPriceCents: number }>
	},
): Promise<InvoiceWithDetails> {
	const client = await getClient(userId, input.clientId)
	if (!client || client.archivedAt) {
		throw new Error("Client not found")
	}

	const supabase = getSupabaseAdmin()
	const now = new Date().toISOString()
	const invoiceId = newId()
	const number = await nextInvoiceNumber(userId)

	const { error: invError } = await supabase.from("ll_invoices").insert({
		id: invoiceId,
		user_id: userId,
		client_id: input.clientId,
		number,
		issue_date: input.issueDate,
		due_date: input.dueDate,
		status: InvoiceStatus.DRAFT,
		notes: input.notes ?? null,
		created_at: now,
		updated_at: now,
	})
	throwOnError(invError, "createInvoice")

	const lineRows = input.lineItems.map((item, index) => ({
		id: newId(),
		invoice_id: invoiceId,
		description: item.description,
		quantity: item.quantity,
		unit_price_cents: item.unitPriceCents,
		position: index,
	}))
	const { error: itemsError } = await supabase.from("ll_line_items").insert(lineRows)
	throwOnError(itemsError, "createInvoice line items")

	const created = await getInvoice(userId, invoiceId)
	if (!created) throw new Error("Failed to load created invoice")
	return created
}

export async function updateInvoice(
	userId: string,
	invoiceId: string,
	input: {
		clientId: string
		issueDate: string
		dueDate: string
		notes?: string | null
		lineItems: Array<{ description: string; quantity: number; unitPriceCents: number }>
	},
): Promise<InvoiceWithDetails> {
	const existing = await getInvoice(userId, invoiceId)
	if (!existing) throw new Error("Invoice not found")
	if (existing.status === InvoiceStatus.PAID) {
		throw new Error("Paid invoices cannot be edited")
	}

	const client = await getClient(userId, input.clientId)
	if (!client) throw new Error("Client not found")

	const supabase = getSupabaseAdmin()
	const now = new Date().toISOString()

	const { error: invError } = await supabase
		.from("ll_invoices")
		.update({
			client_id: input.clientId,
			issue_date: input.issueDate,
			due_date: input.dueDate,
			notes: input.notes ?? null,
			updated_at: now,
		})
		.eq("id", invoiceId)
		.eq("user_id", userId)
	throwOnError(invError, "updateInvoice")

	const { error: delError } = await supabase.from("ll_line_items").delete().eq("invoice_id", invoiceId)
	throwOnError(delError, "updateInvoice clear lines")

	const lineRows = input.lineItems.map((item, index) => ({
		id: newId(),
		invoice_id: invoiceId,
		description: item.description,
		quantity: item.quantity,
		unit_price_cents: item.unitPriceCents,
		position: index,
	}))
	const { error: itemsError } = await supabase.from("ll_line_items").insert(lineRows)
	throwOnError(itemsError, "updateInvoice line items")

	const updated = await getInvoice(userId, invoiceId)
	if (!updated) throw new Error("Failed to load updated invoice")
	return updated
}

export async function setInvoiceStatus(
	userId: string,
	invoiceId: string,
	status: StoredInvoiceStatus,
): Promise<InvoiceWithDetails> {
	const existing = await getInvoice(userId, invoiceId)
	if (!existing) throw new Error("Invoice not found")

	const now = new Date()
	const nowIso = now.toISOString()
	const patch: Record<string, unknown> = {
		status,
		updated_at: nowIso,
	}

	if (status === InvoiceStatus.SENT) {
		patch.sent_at = existing.sentAt?.toISOString() ?? nowIso
		patch.paid_at = null
	}
	if (status === InvoiceStatus.PAID) {
		patch.paid_at = nowIso
		if (!existing.sentAt) {
			patch.sent_at = nowIso
		}
	}
	if (status === InvoiceStatus.DRAFT) {
		patch.sent_at = null
		patch.paid_at = null
	}

	const supabase = getSupabaseAdmin()
	const { error } = await supabase.from("ll_invoices").update(patch).eq("id", invoiceId).eq("user_id", userId)
	throwOnError(error, "setInvoiceStatus")

	const updated = await getInvoice(userId, invoiceId)
	if (!updated) throw new Error("Failed to load invoice after status change")
	return updated
}

export async function listExpenses(userId: string): Promise<Expense[]> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_expenses")
		.select("*")
		.eq("user_id", userId)
		.order("date", { ascending: false })
	throwOnError(error, "listExpenses")
	return ((data as LlExpenseRow[] | null) ?? []).map(mapExpense)
}

export async function createExpense(
	userId: string,
	input: {
		date: string
		category: ExpenseCategory
		amountCents: number
		vendor: string
		notes?: string | null
	},
): Promise<Expense> {
	const supabase = getSupabaseAdmin()
	const { data, error } = await supabase
		.from("ll_expenses")
		.insert({
			id: newId(),
			user_id: userId,
			date: input.date,
			category: input.category,
			amount_cents: input.amountCents,
			vendor: input.vendor,
			notes: input.notes ?? null,
			created_at: new Date().toISOString(),
		})
		.select("*")
		.single()
	throwOnError(error, "createExpense")
	return mapExpense(data as LlExpenseRow)
}

export async function getDashboardStats(userId: string, now: Date = new Date()): Promise<DashboardStats> {
	const invoices = await listInvoices(userId)
	const expenses = await listExpenses(userId)

	return computeDashboardStats(
		invoices.map((inv) => ({
			status: inv.status,
			dueDate: inv.dueDate,
			totalCents: inv.totalCents,
			paidAt: inv.paidAt,
		})),
		expenses.map((exp) => ({
			date: exp.date,
			amountCents: exp.amountCents,
		})),
		now,
	)
}
