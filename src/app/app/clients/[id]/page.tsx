import { notFound } from "next/navigation"

import AppShell from "@/components/AppShell"
import { ClientForm } from "@/components/ClientForm"
import { ensureUser } from "@/server/auth"
import { getClient } from "@/server/repository"

export const metadata = { title: "Edit client" }

type Props = { params: Promise<{ id: string }> }

export default async function EditClientPage({ params }: Props) {
	const { id } = await params
	const user = await ensureUser()
	const client = await getClient(user.id, id)
	if (!client || client.archivedAt) notFound()

	return (
		<AppShell active="clients">
			<h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold">Edit client</h1>
			<ClientForm
				mode="edit"
				clientId={client.id}
				initial={{ name: client.name, email: client.email, company: client.company }}
			/>
		</AppShell>
	)
}
