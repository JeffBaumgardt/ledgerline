"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { createExpenseAction } from "@/server/actions"
import { expenseCategories, type ExpenseCategory } from "@/lib/validation/schemas"
import { dollarsToCents, formatMoney } from "@/lib/money"

type ExpenseRow = {
	id: string
	date: string
	category: ExpenseCategory
	amountCents: number
	vendor: string
	notes: string | null
}

const categoryLabel: Record<ExpenseCategory, string> = {
	SOFTWARE: "Software",
	TRAVEL: "Travel",
	MEALS: "Meals",
	OFFICE_SUPPLIES: "Office supplies",
	CONTRACTORS: "Contractors",
	MARKETING: "Marketing",
	UTILITIES: "Utilities",
	OTHER: "Other",
}

export function ExpenseSection({ expenses }: { expenses: ExpenseRow[] }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
	const [category, setCategory] = useState<ExpenseCategory>("SOFTWARE")
	const [amount, setAmount] = useState("")
	const [vendor, setVendor] = useState("")
	const [notes, setNotes] = useState("")

	const filteredCategories = useMemo(() => expenseCategories, [])

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		setError(null)
		const amountCents = dollarsToCents(Number(amount))
		startTransition(async () => {
			const result = await createExpenseAction({
				date,
				category,
				amountCents,
				vendor,
				notes: notes || null,
			})
			if (!result.ok) {
				setError(result.error)
				return
			}
			setAmount("")
			setVendor("")
			setNotes("")
			router.refresh()
		})
	}

	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
			<form
				onSubmit={handleSubmit}
				className="space-y-3 border border-[var(--ll-line)] bg-[var(--ll-surface)] p-4"
				noValidate
			>
				<h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Add expense</h2>
				<div>
					<label htmlFor="exp-date" className="text-sm font-medium">
						Date
					</label>
					<input
						id="exp-date"
						type="date"
						required
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					/>
				</div>
				<div>
					<label htmlFor="exp-category" className="text-sm font-medium">
						Category
					</label>
					<select
						id="exp-category"
						value={category}
						onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					>
						{filteredCategories.map((c) => (
							<option key={c} value={c}>
								{categoryLabel[c]}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="exp-amount" className="text-sm font-medium">
						Amount (USD)
					</label>
					<input
						id="exp-amount"
						type="number"
						min="0.01"
						step="0.01"
						required
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					/>
				</div>
				<div>
					<label htmlFor="exp-vendor" className="text-sm font-medium">
						Vendor
					</label>
					<input
						id="exp-vendor"
						required
						value={vendor}
						onChange={(e) => setVendor(e.target.value)}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
					/>
				</div>
				<div>
					<label htmlFor="exp-notes" className="text-sm font-medium">
						Notes
					</label>
					<textarea
						id="exp-notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={2}
						className="mt-1 w-full rounded-md border border-[var(--ll-line)] bg-white px-3 py-2 text-sm"
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
					{pending ? "Saving…" : "Add expense"}
				</button>
			</form>

			<div className="overflow-x-auto border border-[var(--ll-line)] bg-[var(--ll-surface)]">
				<table className="w-full min-w-[36rem] text-left text-sm">
					<thead className="border-b border-[var(--ll-line)] text-xs uppercase tracking-wide text-[var(--ll-muted)]">
						<tr>
							<th scope="col" className="px-4 py-3 font-semibold">
								Date
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Vendor
							</th>
							<th scope="col" className="px-4 py-3 font-semibold">
								Category
							</th>
							<th scope="col" className="px-4 py-3 font-semibold text-right">
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						{expenses.length === 0 ? (
							<tr>
								<td colSpan={4} className="px-4 py-6 text-[var(--ll-muted)]">
									No expenses yet.
								</td>
							</tr>
						) : (
							expenses.map((exp) => (
								<tr key={exp.id} className="border-b border-[var(--ll-line)] last:border-0">
									<td className="px-4 py-3 tabular-nums">{exp.date}</td>
									<td className="px-4 py-3 font-medium">{exp.vendor}</td>
									<td className="px-4 py-3">{categoryLabel[exp.category]}</td>
									<td className="px-4 py-3 text-right tabular-nums">
										{formatMoney(exp.amountCents)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
