"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { archiveClientAction, createClientAction, updateClientAction } from "@/server/actions"

type ClientFormProps = {
	mode: "create" | "edit"
	clientId?: string
	initial?: { name: string; email: string; company: string | null }
}

export function ClientForm({ mode, clientId, initial }: ClientFormProps) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [name, setName] = useState(initial?.name ?? "")
	const [email, setEmail] = useState(initial?.email ?? "")
	const [company, setCompany] = useState(initial?.company ?? "")

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		setError(null)
		startTransition(async () => {
			const payload = { name, email, company: company || null }
			const result =
				mode === "create"
					? await createClientAction(payload)
					: await updateClientAction(clientId!, payload)
			if (!result.ok) {
				setError(result.error)
				return
			}
			router.push("/app/clients")
			router.refresh()
		})
	}

	return (
		<form onSubmit={handleSubmit} className="max-w-md space-y-4" noValidate>
			<div>
				<label htmlFor="client-name" className="block text-sm font-medium">
					Name
				</label>
				<input
					id="client-name"
					name="name"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					autoComplete="name"
				/>
			</div>
			<div>
				<label htmlFor="client-email" className="block text-sm font-medium">
					Email
				</label>
				<input
					id="client-email"
					name="email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					autoComplete="email"
				/>
			</div>
			<div>
				<label htmlFor="client-company" className="block text-sm font-medium">
					Company
				</label>
				<input
					id="client-company"
					name="company"
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					autoComplete="organization"
				/>
			</div>
			{error ? (
				<p className="text-sm text-[var(--ll-danger)]" role="alert">
					{error}
				</p>
			) : null}
			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-[var(--ll-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
			>
				{pending ? "Saving…" : mode === "create" ? "Create client" : "Save changes"}
			</button>
		</form>
	)
}

export function ArchiveClientButton({ clientId, name }: { clientId: string; name: string }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleArchive() {
		if (!window.confirm(`Archive client “${name}”?`)) return
		setError(null)
		startTransition(async () => {
			const result = await archiveClientAction(clientId)
			if (!result.ok) {
				setError(result.error)
				return
			}
			router.refresh()
		})
	}

	return (
		<div>
			<button
				type="button"
				onClick={handleArchive}
				disabled={pending}
				className="text-sm font-medium text-[var(--ll-danger)] hover:underline disabled:opacity-60"
				aria-label={`Archive client ${name}`}
			>
				{pending ? "Archiving…" : "Archive"}
			</button>
			{error ? (
				<p className="text-sm text-[var(--ll-danger)]" role="alert">
					{error}
				</p>
			) : null}
		</div>
	)
}
