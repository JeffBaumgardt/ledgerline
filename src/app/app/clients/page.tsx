import Link from "next/link"

import AppShell from "@/components/AppShell"
import { ArchiveClientButton } from "@/components/ClientForm"
import { ensureUser } from "@/server/auth"
import { listClients } from "@/server/repository"

export const metadata = { title: "Clients" }

export default async function ClientsPage() {
	const user = await ensureUser()
	const clients = await listClients(user.id)

	return (
		<AppShell active="clients">
			<header className="mb-6 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Clients</h1>
					<p className="mt-1 text-sm text-[var(--ll-muted)]">Create, edit, and archive clients.</p>
				</div>
				<Link
					href="/app/clients/new"
					className="rounded-md bg-[var(--ll-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ll-accent-hover)]"
				>
					New client
				</Link>
			</header>

			{clients.length === 0 ? (
				<p className="text-sm text-[var(--ll-muted)]">No active clients yet.</p>
			) : (
				<div className="overflow-x-auto border border-[var(--ll-line)] bg-[var(--ll-surface)]">
					<table className="w-full min-w-[32rem] text-left text-sm">
						<thead className="border-b border-[var(--ll-line)] text-xs uppercase tracking-wide text-[var(--ll-muted)]">
							<tr>
								<th scope="col" className="px-4 py-3 font-semibold">
									Name
								</th>
								<th scope="col" className="px-4 py-3 font-semibold">
									Email
								</th>
								<th scope="col" className="px-4 py-3 font-semibold">
									Company
								</th>
								<th scope="col" className="px-4 py-3 font-semibold">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{clients.map((client) => (
								<tr key={client.id} className="border-b border-[var(--ll-line)] last:border-0">
									<td className="px-4 py-3 font-medium">{client.name}</td>
									<td className="px-4 py-3">{client.email}</td>
									<td className="px-4 py-3">{client.company ?? "—"}</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<Link
												href={`/app/clients/${client.id}`}
												className="font-medium text-[var(--ll-accent)] hover:underline"
											>
												Edit
											</Link>
											<ArchiveClientButton clientId={client.id} name={client.name} />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</AppShell>
	)
}
