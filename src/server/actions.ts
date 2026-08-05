"use server"

import { revalidatePath } from "next/cache"

import {
	clientSchema,
	expenseSchema,
	invoiceCreateSchema,
	invoiceUpdateSchema,
} from "@/lib/validation/schemas"
import { InvoiceStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"
import { ensureUser } from "@/server/auth"
import * as repo from "@/server/repository"

export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: string }

function fail(error: unknown): ActionResult<never> {
	const message = error instanceof Error ? error.message : "Something went wrong"
	return { ok: false, error: message }
}

export async function createClientAction(input: unknown): Promise<ActionResult<{ id: string }>> {
	try {
		const user = await ensureUser()
		const parsed = clientSchema.parse(input)
		const client = await repo.createClient(user.id, parsed)
		revalidatePath("/app/clients")
		revalidatePath("/app")
		return { ok: true, data: { id: client.id } }
	} catch (error) {
		return fail(error)
	}
}

export async function updateClientAction(
	clientId: string,
	input: unknown,
): Promise<ActionResult<{ id: string }>> {
	try {
		const user = await ensureUser()
		const parsed = clientSchema.parse(input)
		const client = await repo.updateClient(user.id, clientId, parsed)
		revalidatePath("/app/clients")
		revalidatePath(`/app/clients/${clientId}`)
		return { ok: true, data: { id: client.id } }
	} catch (error) {
		return fail(error)
	}
}

export async function archiveClientAction(clientId: string): Promise<ActionResult> {
	try {
		const user = await ensureUser()
		await repo.archiveClient(user.id, clientId)
		revalidatePath("/app/clients")
		return { ok: true, data: undefined }
	} catch (error) {
		return fail(error)
	}
}

export async function createInvoiceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
	try {
		const user = await ensureUser()
		const parsed = invoiceCreateSchema.parse(input)
		const invoice = await repo.createInvoice(user.id, {
			clientId: parsed.clientId,
			issueDate: parsed.issueDate,
			dueDate: parsed.dueDate,
			notes: parsed.notes,
			lineItems: parsed.lineItems,
		})
		revalidatePath("/app/invoices")
		revalidatePath("/app")
		return { ok: true, data: { id: invoice.id } }
	} catch (error) {
		return fail(error)
	}
}

export async function updateInvoiceAction(input: unknown): Promise<ActionResult<{ id: string }>> {
	try {
		const user = await ensureUser()
		const parsed = invoiceUpdateSchema.parse(input)
		const invoice = await repo.updateInvoice(user.id, parsed.id, {
			clientId: parsed.clientId,
			issueDate: parsed.issueDate,
			dueDate: parsed.dueDate,
			notes: parsed.notes,
			lineItems: parsed.lineItems,
		})
		revalidatePath("/app/invoices")
		revalidatePath(`/app/invoices/${invoice.id}`)
		revalidatePath("/app")
		return { ok: true, data: { id: invoice.id } }
	} catch (error) {
		return fail(error)
	}
}

export async function setInvoiceStatusAction(
	invoiceId: string,
	status: StoredInvoiceStatus,
): Promise<ActionResult> {
	try {
		const user = await ensureUser()
		if (
			status !== InvoiceStatus.DRAFT &&
			status !== InvoiceStatus.SENT &&
			status !== InvoiceStatus.PAID
		) {
			throw new Error("Invalid status transition")
		}
		await repo.setInvoiceStatus(user.id, invoiceId, status)
		revalidatePath("/app/invoices")
		revalidatePath(`/app/invoices/${invoiceId}`)
		revalidatePath("/app")
		return { ok: true, data: undefined }
	} catch (error) {
		return fail(error)
	}
}

export async function createExpenseAction(input: unknown): Promise<ActionResult<{ id: string }>> {
	try {
		const user = await ensureUser()
		const parsed = expenseSchema.parse(input)
		const expense = await repo.createExpense(user.id, parsed)
		revalidatePath("/app/expenses")
		revalidatePath("/app")
		return { ok: true, data: { id: expense.id } }
	} catch (error) {
		return fail(error)
	}
}
