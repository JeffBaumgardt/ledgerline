import Link from "next/link"

import { TEST_REPORTS_BASE } from "@/lib/constants"

export const metadata = {
	title: "Test reports",
}

export default function TestingPage() {
	const vitestUrl = `${TEST_REPORTS_BASE}/vitest/`
	const playwrightUrl = `${TEST_REPORTS_BASE}/playwright/`
	const ciBadge =
		"https://github.com/JeffBaumgardt/ledgerline/actions/workflows/ci.yml/badge.svg"

	return (
		<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
			<p className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-widest text-[var(--ll-accent)]">
				Quality
			</p>
			<h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--ll-ink)]">
				Test reports
			</h1>
			<p className="mt-3 text-[var(--ll-muted)]">
				CI runs Vitest unit tests and Playwright end-to-end tests on every push to main. HTML reports are
				uploaded as artifacts and published to GitHub Pages so you can open them without cloning the repo.
			</p>

			<div className="mt-8 flex items-center gap-3">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={ciBadge} alt="CI status" width={120} height={20} />
				<a
					href="https://github.com/JeffBaumgardt/ledgerline/actions"
					className="text-sm font-medium text-[var(--ll-accent)] underline-offset-2 hover:underline"
					target="_blank"
					rel="noreferrer"
				>
					View Actions runs
				</a>
			</div>

			<ul className="mt-10 space-y-4">
				<li className="border border-[var(--ll-line)] bg-[var(--ll-surface)] p-5">
					<h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Vitest (unit)</h2>
					<p className="mt-1 text-sm text-[var(--ll-muted)]">
						Money math, overdue status, CSV, Zod schemas, dashboard aggregates, and MSW Supabase boundary
						tests.
					</p>
					<a
						href={vitestUrl}
						className="mt-3 inline-flex text-sm font-semibold text-[var(--ll-accent)] underline-offset-2 hover:underline"
						target="_blank"
						rel="noreferrer"
					>
						Open Vitest HTML report →
					</a>
				</li>
				<li className="border border-[var(--ll-line)] bg-[var(--ll-surface)] p-5">
					<h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Playwright (E2E)</h2>
					<p className="mt-1 text-sm text-[var(--ll-muted)]">
						Auth setup, invoice lifecycle, expenses, client edit, CSV export, public pages.
					</p>
					<a
						href={playwrightUrl}
						className="mt-3 inline-flex text-sm font-semibold text-[var(--ll-accent)] underline-offset-2 hover:underline"
						target="_blank"
						rel="noreferrer"
					>
						Open Playwright HTML report →
					</a>
				</li>
			</ul>

			<p className="mt-10 text-sm text-[var(--ll-muted)]">
				<Link href="/" className="font-medium text-[var(--ll-accent)] underline-offset-2 hover:underline">
					← Back to Ledgerline
				</Link>
			</p>
		</main>
	)
}
