import { z } from "zod"

import { InvoiceStatus } from "@/lib/invoice-status"

export const expenseCategories = [
	"SOFTWARE",
	"TRAVEL",
	"MEALS",
	"OFFICE_SUPPLIES",
	"CONTRACTORS",
	"MARKETING",
	"UTILITIES",
	"OTHER",
] as const

export type ExpenseCategory = (typeof expenseCategories)[number]

export const clientSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(120),
	email: z.email("Valid email is required"),
	company: z.string().trim().max(120).optional().nullable(),
})

export const lineItemSchema = z.object({
	description: z.string().trim().min(1, "Description is required").max(200),
	quantity: z.number().int().positive("Quantity must be at least 1"),
	unitPriceCents: z.number().int().nonnegative("Unit price cannot be negative"),
})

export const invoiceCreateSchema = z.object({
	clientId: z.string().min(1),
	issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD"),
	dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD"),
	notes: z.string().trim().max(2000).optional().nullable(),
	lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
})

export const invoiceUpdateSchema = invoiceCreateSchema.extend({
	id: z.string().min(1),
})

export const invoiceStatusSchema = z.object({
	id: z.string().min(1),
	status: z.enum([InvoiceStatus.DRAFT, InvoiceStatus.SENT, InvoiceStatus.PAID, InvoiceStatus.OVERDUE]),
})

export const expenseSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
	category: z.enum(expenseCategories),
	amountCents: z.number().int().positive("Amount must be greater than zero"),
	vendor: z.string().trim().min(1, "Vendor is required").max(120),
	notes: z.string().trim().max(1000).optional().nullable(),
})

export const invoiceFilterSchema = z.object({
	status: z
		.enum(["ALL", InvoiceStatus.DRAFT, InvoiceStatus.SENT, InvoiceStatus.PAID, InvoiceStatus.OVERDUE])
		.optional()
		.default("ALL"),
	clientId: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
})
