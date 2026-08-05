import { SignIn } from "@clerk/nextjs"

import { safeRedirectPath } from "@/lib/safe-redirect"

type SignInPageProps = {
	searchParams: Promise<{ redirect_url?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
	const params = await searchParams
	const redirectUrl = safeRedirectPath(params.redirect_url)

	return (
		<main className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(11,107,90,0.12),_transparent_50%)] px-4 py-12">
			<p className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ll-ink)]">
				Ledgerline
			</p>
			<SignIn
				routing="path"
				path="/sign-in"
				signUpUrl={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"}
				forceRedirectUrl={redirectUrl}
				fallbackRedirectUrl="/app"
				appearance={{
					elements: {
						socialButtons: "hidden",
						socialButtonsBlockButton: "hidden",
						dividerRow: "hidden",
					},
				}}
			/>
		</main>
	)
}
