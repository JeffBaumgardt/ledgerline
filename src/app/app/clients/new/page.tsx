import AppShell from "@/components/AppShell"
import { ClientForm } from "@/components/ClientForm"

export const metadata = { title: "New client" }

export default function NewClientPage() {
	return (
		<AppShell active="clients">
			<h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold">New client</h1>
			<ClientForm mode="create" />
		</AppShell>
	)
}
