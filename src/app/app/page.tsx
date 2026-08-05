import Link from "next/link"

import AppShell from "@/components/AppShell"
import { formatMoney } from "@/lib/money"
import { ensureUser } from "@/server/auth"
import { getDashboardStats, listInvoices } from "@/server/repository"
import StatusBadge from "@/components/StatusBadge"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
	const user = await ensureUser()
	const [stats, recent] = await Promise.all([
		getDashboardStats(user.id),
		listInvoices(user.id).then((rows) => rows.slice(0, 5)),
	])

	return (
		<AppShell active="dashboard">
			<header className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
						Dashboard
					</h1>
					<p className="mt-1 text-sm text-[var(--ll-muted)]">Totals from your invoices and expenses.</p>
				</div>
				<Link
					href="/app/invoices/new"
					className="rounded-md bg-[var(--ll-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ll-accent-hover)]"
				>
					New invoice
				</Link>
			</header>

			<section className="grid gap-4 sm:grid-cols-3" aria-label="Key metrics">
				<article className="border border-[var(--ll-line)] bg-[var(--ll-surface)] p-5">
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--ll-muted)]">Outstanding</p>
					<p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums">
						{formatMoney(stats.outstandingCents)}
					</p>
				</article>
				<article className="border border-[var(--ll-line)] bg-[var(--ll-surface)] p-5">
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--ll-muted)]">
						Paid this month
					</p>
					<p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums">
						{formatMoney(stats.paidThisMonthCents)}
					</p>
				</article>
				<article className="border border-[var(--ll-line)] bg-[var(--ll-surface)] p-5">
					<p className="text-xs font-semibold uppercase tracking-wider text-[var(--ll-muted)]">
						Expenses this month
					</p>
					<p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tabular-nums">
						{formatMoney(stats.expensesThisMonthCents)}
					</p>
				</article>
			</section>

			<section className="mt-10" aria-labelledby="recent-invoices">
				<div className="mb-3 flex items-center justify-between">
					<h2 id="recent-invoices" className="font-[family-name:var(--font-display)] text-lg font-semibold">
						Recent invoices
					</h2>
					<Link href="/app/invoices" className="text-sm font-medium text-[var(--ll-accent)] hover:underline">
						View all
					</Link>
				</div>
				{recent.length === 0 ? (
					<p className="text-sm text-[var(--ll-muted)]">No invoices yet. Create your first one.</p>
				) : (
					<ul className="divide-y divide-[var(--ll-line)] border border-[var(--ll-line)] bg-[var(--ll-surface)]">
						{recent.map((inv) => (
							<li key={inv.id}>
								<Link
									href={`/app/invoices/${inv.id}`}
									className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--ll-accent-soft)]"
								>
									<span className="font-medium">
										{inv.number} · {inv.client.name}
									</span>
									<span className="flex items-center gap-3 text-sm">
										<StatusBadge status={inv.status} dueDate={inv.dueDate} />
										<span className="tabular-nums">{formatMoney(inv.totalCents)}</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</AppShell>
	)
}
