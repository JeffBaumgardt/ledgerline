import { expect, test } from "@playwright/test"

test.describe("public pages", () => {
	test("landing shows brand and app entry", async ({ page }) => {
		await page.goto("/")
		await expect(page.getByRole("link", { name: "Ledgerline home" })).toBeVisible()
		await expect(page.getByRole("heading", { level: 1 })).toContainText(/Invoices|expenses/i)
		await expect(page.getByRole("link", { name: /Open app|Sign in/i }).first()).toBeVisible()
		await expect(page.getByRole("link", { name: /View test reports|Test reports/i }).first()).toBeVisible()
	})

	test("testing page links out to report sinks", async ({ page }) => {
		await page.goto("/testing")
		await expect(page.getByRole("heading", { name: "Test reports" })).toBeVisible()
		await expect(page.getByRole("link", { name: /Open Vitest HTML report/i })).toBeVisible()
		await expect(page.getByRole("link", { name: /Open Playwright HTML report/i })).toBeVisible()
		await expect(page.getByRole("link", { name: /View Actions runs/i })).toBeVisible()
	})

	test("protected app route redirects unauthenticated users to sign-in", async ({ page }) => {
		await page.goto("/app")
		await expect(page).toHaveURL(/sign-in|clerk/i, { timeout: 15_000 })
	})
})
