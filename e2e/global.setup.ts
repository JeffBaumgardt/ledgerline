import { clerk, clerkSetup } from "@clerk/testing/playwright"
import { test as setup } from "@playwright/test"
import path from "node:path"

setup.setTimeout(60_000)

setup("authenticate", async ({ page }) => {
	await clerkSetup()

	const email = process.env.E2E_CLERK_USER_EMAIL
	if (!email) {
		throw new Error("E2E_CLERK_USER_EMAIL is required for Playwright auth setup")
	}

	await page.goto("/")
	await page.waitForFunction(() => window.Clerk?.loaded === true, null, {
		timeout: 45_000,
	})
	await clerk.signIn({
		page,
		emailAddress: email,
	})

	await page.goto("/app")
	await page.waitForURL(/\/app/)

	const authFile = path.join(__dirname, "../playwright/.clerk/user.json")
	await page.context().storageState({ path: authFile })
})
