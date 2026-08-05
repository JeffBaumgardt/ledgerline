import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { DM_Sans, Libre_Franklin } from "next/font/google"

import SiteHeader from "@/components/SiteHeader"

import "./globals.css"

const display = DM_Sans({
	variable: "--font-display",
	subsets: ["latin"],
	display: "swap",
	weight: ["500", "600", "700"],
})

const body = Libre_Franklin({
	variable: "--font-body",
	subsets: ["latin"],
	display: "swap",
})

export const metadata: Metadata = {
	title: {
		default: "Ledgerline — Invoices & Expenses",
		template: "%s · Ledgerline",
	},
	description:
		"Small business invoice and expense tracker with Vitest, Playwright, and CI. Filter, export CSV, and see the test reports.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col bg-[var(--ll-bg)] font-[family-name:var(--font-body)] text-[var(--ll-ink)]">
				<ClerkProvider
					signInUrl="/sign-in"
					signUpUrl="/sign-up"
					signInFallbackRedirectUrl="/app"
					signUpFallbackRedirectUrl="/app"
					appearance={{
						options: {
							socialButtonsPlacement: "bottom",
							socialButtonsVariant: "blockButton",
						},
						elements: {
							socialButtons: "hidden",
							socialButtonsBlockButton: "hidden",
							dividerRow: "hidden",
						},
					}}
				>
					<SiteHeader />
					{children}
				</ClerkProvider>
			</body>
		</html>
	)
}
