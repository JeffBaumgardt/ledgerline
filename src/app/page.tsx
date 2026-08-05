import Link from "next/link"

import { TEST_REPORTS_BASE } from "@/lib/constants"

export default function HomePage() {
	return (
		<main className="relative flex flex-1 flex-col overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,_rgba(11,107,90,0.14),_transparent_55%),linear-gradient(165deg,#e8eef2_0%,#f4f1ec_45%,#e9f0ee_100%)]"
			/>
			<section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
				<p className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--ll-ink)] sm:text-6xl md:text-7xl">
					Ledgerline
				</p>
				<h1 className="mt-6 max-w-xl text-xl font-medium text-[var(--ll-ink-soft)] sm:text-2xl">
					Invoices, expenses, and CSV export — with a testing story recruiters can open.
				</h1>
				<p className="mt-4 max-w-lg text-base text-[var(--ll-muted)]">
					Unit tests (Vitest), end-to-end flows (Playwright), and GitHub Actions publish HTML reports you can
					browse from this site.
				</p>
				<div className="mt-10 flex flex-wrap items-center gap-3">
					<Link
						href="/app"
						className="inline-flex items-center justify-center rounded-md bg-[var(--ll-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ll-accent-hover)]"
					>
						Open app
					</Link>
					<Link
						href="/testing"
						className="inline-flex items-center justify-center rounded-md border border-[var(--ll-line)] bg-[var(--ll-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ll-ink)] transition hover:border-[var(--ll-accent)]"
					>
						View test reports
					</Link>
				</div>
			</section>
			<footer className="relative border-t border-[var(--ll-line)] px-4 py-6 text-center text-sm text-[var(--ll-muted)] sm:px-6">
				<a
					className="underline-offset-2 hover:text-[var(--ll-accent)] hover:underline"
					href={TEST_REPORTS_BASE}
					target="_blank"
					rel="noreferrer"
				>
					Published reports on GitHub Pages
				</a>
				{" · "}
				<a
					className="underline-offset-2 hover:text-[var(--ll-accent)] hover:underline"
					href="https://github.com/JeffBaumgardt/ledgerline"
					target="_blank"
					rel="noreferrer"
				>
					Source
				</a>
			</footer>
		</main>
	)
}
