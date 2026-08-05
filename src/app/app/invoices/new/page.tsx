import Link from "next/link"

import AppShell from "@/components/AppShell"
import { InvoiceForm } from "@/components/InvoiceForm"
import { InvoiceStatus } from "@/lib/invoice-status"
import { ensureUser } from "@/server/auth"
import { listClients } from "@/server/repository"

export const metadata = { title: "New invoice" }

function datePlusDays(days: number): string {
	const d = new Date()
	d.setUTCDate(d.getUTCDate() + days)
	return d.toISOString().slice(0, 10)
}

export default async function NewInvoicePage() {
	const user = await ensureUser()
	const clients = await listClients(user.id)
	const issueDate = datePlusDays(0)
	const dueDate = datePlusDays(14)

	return (
		<AppShell active="invoices">
			<header className="mb-6">
				<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">New invoice</h1>
				{clients.length === 0 ? (
					<p className="mt-2 text-sm text-[var(--ll-muted)]">
						You need a client first.{" "}
						<Link href="/app/clients/new" className="font-medium text-[var(--ll-accent)] hover:underline">
							Create a client
						</Link>
					</p>
				) : null}
			</header>
			{clients.length > 0 ? (
				<InvoiceForm
					mode="create"
					clients={clients.map((c) => ({ id: c.id, name: c.name }))}
					initial={{
						clientId: clients[0]!.id,
						issueDate,
						dueDate,
						notes: null,
						status: InvoiceStatus.DRAFT,
						lineItems: [{ description: "", quantity: 1, unitPriceCents: 0 }],
					}}
				/>
			) : null}
		</AppShell>
	)
}
