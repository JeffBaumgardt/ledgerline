import Link from "next/link"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"

const navLink =
	"text-sm text-[var(--ll-ink-soft)] transition hover:text-[var(--ll-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ll-accent)]"

export default function SiteHeader() {
	return (
		<header className="border-b border-[var(--ll-line)] bg-[var(--ll-surface)]/90 backdrop-blur-sm">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<Link
					href="/"
					className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--ll-ink)]"
					aria-label="Ledgerline home"
				>
					Ledgerline
				</Link>
				<nav className="flex items-center gap-4 sm:gap-6" aria-label="Primary">
					<Link href="/testing" className={navLink}>
						Test reports
					</Link>
					<Show when="signed-in">
						<Link href="/app" className={navLink}>
							Dashboard
						</Link>
						<Link href="/app/invoices" className={navLink}>
							Invoices
						</Link>
						<Link href="/app/clients" className={navLink}>
							Clients
						</Link>
						<Link href="/app/expenses" className={navLink}>
							Expenses
						</Link>
						<UserButton />
					</Show>
					<Show when="signed-out">
						<SignInButton mode="modal" forceRedirectUrl="/app">
							<button
								type="button"
								className="rounded-md bg-[var(--ll-accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--ll-accent-hover)]"
							>
								Sign in
							</button>
						</SignInButton>
					</Show>
				</nav>
			</div>
		</header>
	)
}
