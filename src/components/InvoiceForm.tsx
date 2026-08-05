"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { dollarsToCents, formatMoney, invoiceTotalCents } from "@/lib/money"
import { createInvoiceAction, setInvoiceStatusAction, updateInvoiceAction } from "@/server/actions"
import { InvoiceStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"

type ClientOption = { id: string; name: string }
type LineDraft = { description: string; quantity: string; unitPrice: string }

type InvoiceFormProps = {
	mode: "create" | "edit"
	clients: ClientOption[]
	invoiceId?: string
	initial?: {
		clientId: string
		issueDate: string
		dueDate: string
		notes: string | null
		status: StoredInvoiceStatus
		lineItems: Array<{ description: string; quantity: number; unitPriceCents: number }>
	}
}

function emptyLine(): LineDraft {
	return { description: "", quantity: "1", unitPrice: "" }
}

export function InvoiceForm({ mode, clients, invoiceId, initial }: InvoiceFormProps) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [clientId, setClientId] = useState(initial?.clientId ?? clients[0]?.id ?? "")
	const [issueDate, setIssueDate] = useState(initial?.issueDate ?? "")
	const [dueDate, setDueDate] = useState(initial?.dueDate ?? "")
	const [notes, setNotes] = useState(initial?.notes ?? "")
	const [lines, setLines] = useState<LineDraft[]>(
		initial?.lineItems.map((li) => ({
			description: li.description,
			quantity: String(li.quantity),
			unitPrice: (li.unitPriceCents / 100).toFixed(2),
		})) ?? [emptyLine()],
	)

	const totalCents = useMemo(() => {
		return invoiceTotalCents(
			lines.map((l) => ({
				quantity: Number(l.quantity) || 0,
				unitPriceCents: dollarsToCents(Number(l.unitPrice) || 0),
			})),
		)
	}, [lines])

	function handleLineChange(index: number, field: keyof LineDraft, value: string) {
		setLines((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
	}

	function handleAddLine() {
		setLines((prev) => [...prev, emptyLine()])
	}

	function handleRemoveLine(index: number) {
		setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
	}

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		setError(null)
		const lineItems = lines.map((l) => ({
			description: l.description,
			quantity: Number(l.quantity),
			unitPriceCents: dollarsToCents(Number(l.unitPrice)),
		}))
		startTransition(async () => {
			const payload = {
				clientId,
				issueDate,
				dueDate,
				notes: notes || null,
				lineItems,
			}
			const result =
				mode === "create"
					? await createInvoiceAction(payload)
					: await updateInvoiceAction({ id: invoiceId!, ...payload })
			if (!result.ok) {
				setError(result.error)
				return
			}
			router.push(`/app/invoices/${result.data.id}`)
			router.refresh()
		})
	}

	const isPaid = initial?.status === InvoiceStatus.PAID

	return (
		<form onSubmit={handleSubmit} className="space-y-6" noValidate>
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label htmlFor="inv-client" className="text-sm font-medium">
						Client
					</label>
					<select
						id="inv-client"
						required
						disabled={isPaid}
						value={clientId}
						onChange={(e) => setClientId(e.target.value)}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					>
						{clients.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label htmlFor="inv-issue" className="text-sm font-medium">
							Issue date
						</label>
						<input
							id="inv-issue"
							type="date"
							required
							disabled={isPaid}
							value={issueDate}
							onChange={(e) => setIssueDate(e.target.value)}
							className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label htmlFor="inv-due" className="text-sm font-medium">
							Due date
						</label>
						<input
							id="inv-due"
							type="date"
							required
							disabled={isPaid}
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
						/>
					</div>
				</div>
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<p className="text-sm font-medium">Line items</p>
					<button
						type="button"
						onClick={handleAddLine}
						disabled={isPaid}
						className="text-sm font-medium text-[var(--ll-accent)] hover:underline disabled:opacity-50"
					>
						Add line
					</button>
				</div>
				<div className="space-y-2">
					{lines.map((line, index) => (
						<div key={index} className="grid grid-cols-[1fr_5rem_7rem_auto] gap-2">
							<input
								aria-label={`Line ${index + 1} description`}
								placeholder="Description"
								required
								disabled={isPaid}
								value={line.description}
								onChange={(e) => handleLineChange(index, "description", e.target.value)}
								className="rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
							/>
							<input
								aria-label={`Line ${index + 1} quantity`}
								type="number"
								min="1"
								step="1"
								required
								disabled={isPaid}
								value={line.quantity}
								onChange={(e) => handleLineChange(index, "quantity", e.target.value)}
								className="rounded-md border border-[var(--ll-line)] bg-white px-2 py-2 text-sm"
							/>
							<input
								aria-label={`Line ${index + 1} unit price`}
								type="number"
								min="0"
								step="0.01"
								required
								disabled={isPaid}
								placeholder="0.00"
								value={line.unitPrice}
								onChange={(e) => handleLineChange(index, "unitPrice", e.target.value)}
								className="rounded-md border border-[var(--ll-line)] bg-white px-2 py-2 text-sm"
							/>
							<button
								type="button"
								onClick={() => handleRemoveLine(index)}
								disabled={isPaid || lines.length === 1}
								className="px-2 text-sm text-[var(--ll-danger)] disabled:opacity-40"
								aria-label={`Remove line ${index + 1}`}
							>
								Remove
							</button>
						</div>
					))}
				</div>
				<p className="mt-3 text-right text-sm font-semibold tabular-nums">
					Total: {formatMoney(totalCents)}
				</p>
			</div>

			<div>
				<label htmlFor="inv-notes" className="text-sm font-medium">
					Notes
				</label>
				<textarea
					id="inv-notes"
					disabled={isPaid}
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
				/>
			</div>

			{error ? (
				<p className="text-sm text-[var(--ll-danger)]" role="alert">
					{error}
				</p>
			) : null}

			{!isPaid ? (
				<button
					type="submit"
					disabled={pending || !clientId}
					className="rounded-md bg-[var(--ll-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
				>
					{pending ? "Saving…" : mode === "create" ? "Create invoice" : "Save invoice"}
				</button>
			) : (
				<p className="text-sm text-[var(--ll-muted)]">Paid invoices are read-only.</p>
			)}
		</form>
	)
}

export function InvoiceStatusActions({
	invoiceId,
	status,
}: {
	invoiceId: string
	status: StoredInvoiceStatus
}) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleStatus(next: StoredInvoiceStatus) {
		setError(null)
		startTransition(async () => {
			const result = await setInvoiceStatusAction(invoiceId, next)
			if (!result.ok) {
				setError(result.error)
				return
			}
			router.refresh()
		})
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			{status === InvoiceStatus.DRAFT ? (
				<button
					type="button"
					disabled={pending}
					onClick={() => handleStatus(InvoiceStatus.SENT)}
					className="rounded-md bg-[var(--ll-accent)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
				>
					Mark sent
				</button>
			) : null}
			{status !== InvoiceStatus.PAID ? (
				<button
					type="button"
					disabled={pending}
					onClick={() => handleStatus(InvoiceStatus.PAID)}
					className="rounded-md border border-[var(--ll-line)] bg-white px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
				>
					Mark paid
				</button>
			) : (
				<span className="text-sm text-[var(--ll-ok)]">Paid</span>
			)}
			{error ? (
				<p className="w-full text-sm text-[var(--ll-danger)]" role="alert">
					{error}
				</p>
			) : null}
			<Link href="/app/invoices" className="text-sm text-[var(--ll-muted)] hover:underline">
				Back to list
			</Link>
		</div>
	)
}
