import Link from "next/link"
import { Suspense } from "react"

import AppShell from "@/components/AppShell"
import { InvoiceTable } from "@/components/InvoiceTable"
import { InvoiceStatus } from "@/lib/invoice-status"
import { ensureUser } from "@/server/auth"
import { listClients, listInvoices } from "@/server/repository"

export const metadata = { title: "Invoices" }

type Props = {
	searchParams: Promise<{
		status?: string
		clientId?: string
		from?: string
		to?: string
	}>
}

export default async function InvoicesPage({ searchParams }: Props) {
	const params = await searchParams
	const user = await ensureUser()
	const status =
		params.status === InvoiceStatus.DRAFT ||
		params.status === InvoiceStatus.SENT ||
		params.status === InvoiceStatus.PAID ||
		params.status === InvoiceStatus.OVERDUE
			? params.status
			: "ALL"
	const [invoices, clients] = await Promise.all([
		listInvoices(user.id, {
			status,
			clientId: params.clientId || undefined,
			from: params.from || undefined,
			to: params.to || undefined,
		}),
		listClients(user.id, { includeArchived: true }),
	])

	const rows = invoices.map((inv) => ({
		id: inv.id,
		number: inv.number,
		clientId: inv.clientId,
		clientName: inv.client.name,
		status: inv.status,
		issueDate: inv.issueDate,
		dueDate: inv.dueDate,
		totalCents: inv.totalCents,
	}))

	return (
		<AppShell active="invoices">
			<header className="mb-6 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Invoices</h1>
					<p className="mt-1 text-sm text-[var(--ll-muted)]">
						Filter, sort columns, and export the current view to CSV.
					</p>
				</div>
				<Link
					href="/app/invoices/new"
					className="rounded-md bg-[var(--ll-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ll-accent-hover)]"
				>
					New invoice
				</Link>
			</header>
			<Suspense fallback={<p className="text-sm text-[var(--ll-muted)]">Loading…</p>}>
				<InvoiceTable
					rows={rows}
					clients={clients.map((c) => ({ id: c.id, name: c.name }))}
					filters={{
						status,
						clientId: params.clientId ?? "",
						from: params.from ?? "",
						to: params.to ?? "",
					}}
				/>
			</Suspense>
		</AppShell>
	)
}
