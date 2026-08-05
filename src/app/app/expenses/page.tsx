import AppShell from "@/components/AppShell"
import { ExpenseSection } from "@/components/ExpenseSection"
import { ensureUser } from "@/server/auth"
import { listExpenses } from "@/server/repository"

export const metadata = { title: "Expenses" }

export default async function ExpensesPage() {
	const user = await ensureUser()
	const expenses = await listExpenses(user.id)

	return (
		<AppShell active="expenses">
			<header className="mb-6">
				<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Expenses</h1>
				<p className="mt-1 text-sm text-[var(--ll-muted)]">Track spend by category and vendor.</p>
			</header>
			<ExpenseSection
				expenses={expenses.map((e) => ({
					id: e.id,
					date: e.date,
					category: e.category,
					amountCents: e.amountCents,
					vendor: e.vendor,
					notes: e.notes,
				}))}
			/>
		</AppShell>
	)
}
