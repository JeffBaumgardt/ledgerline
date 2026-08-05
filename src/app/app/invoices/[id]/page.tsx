import { notFound } from "next/navigation"

import AppShell from "@/components/AppShell"
import { InvoiceForm, InvoiceStatusActions } from "@/components/InvoiceForm"
import StatusBadge from "@/components/StatusBadge"
import { formatMoney } from "@/lib/money"
import { ensureUser } from "@/server/auth"
import { getInvoice, listClients } from "@/server/repository"

export const metadata = { title: "Invoice" }

type Props = { params: Promise<{ id: string }> }

export default async function InvoiceDetailPage({ params }: Props) {
	const { id } = await params
	const user = await ensureUser()
	const [invoice, clients] = await Promise.all([getInvoice(user.id, id), listClients(user.id)])
	if (!invoice) notFound()

	const clientOptions = clients
		.filter((c) => !c.archivedAt || c.id === invoice.clientId)
		.map((c) => ({ id: c.id, name: c.name }))
	if (!clientOptions.some((c) => c.id === invoice.clientId)) {
		clientOptions.push({ id: invoice.client.id, name: invoice.client.name })
	}

	return (
		<AppShell active="invoices">
			<header className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-sm text-[var(--ll-muted)]">{invoice.number}</p>
					<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
						{invoice.client.name}
					</h1>
					<div className="mt-2 flex flex-wrap items-center gap-3">
						<StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
						<span className="text-sm tabular-nums text-[var(--ll-muted)]">
							Total {formatMoney(invoice.totalCents)}
						</span>
					</div>
				</div>
				<InvoiceStatusActions invoiceId={invoice.id} status={invoice.status} />
			</header>
			<InvoiceForm
				mode="edit"
				invoiceId={invoice.id}
				clients={clientOptions}
				initial={{
					clientId: invoice.clientId,
					issueDate: invoice.issueDate,
					dueDate: invoice.dueDate,
					notes: invoice.notes,
					status: invoice.status,
					lineItems: invoice.lineItems.map((li) => ({
						description: li.description,
						quantity: li.quantity,
						unitPriceCents: li.unitPriceCents,
					})),
				}}
			/>
		</AppShell>
	)
}
