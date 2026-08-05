import Link from "next/link"

const linkClass =
	"text-sm font-medium text-[var(--ll-muted)] transition hover:text-[var(--ll-accent)] data-[active=true]:text-[var(--ll-accent)]"

export default function AppShell({
	children,
	active,
}: {
	children: React.ReactNode
	active?: "dashboard" | "invoices" | "clients" | "expenses"
}) {
	return (
		<div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
			<nav className="mb-8 flex flex-wrap gap-4 border-b border-[var(--ll-line)] pb-3" aria-label="App">
				<Link href="/app" className={linkClass} data-active={active === "dashboard" || undefined}>
					Dashboard
				</Link>
				<Link href="/app/invoices" className={linkClass} data-active={active === "invoices" || undefined}>
					Invoices
				</Link>
				<Link href="/app/clients" className={linkClass} data-active={active === "clients" || undefined}>
					Clients
				</Link>
				<Link href="/app/expenses" className={linkClass} data-active={active === "expenses" || undefined}>
					Expenses
				</Link>
			</nav>
			{children}
		</div>
	)
}
