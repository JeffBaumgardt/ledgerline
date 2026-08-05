import { expect, test } from "@playwright/test"

test.describe("expenses", () => {
	test("add expense and see it in the list", async ({ page }) => {
		const suffix = Date.now().toString(36)
		const vendor = `E2E Vendor ${suffix}`

		await page.goto("/app/expenses")
		await expect(page.getByRole("heading", { name: "Expenses" })).toBeVisible()

		await page.getByLabel("Vendor").fill(vendor)
		await page.getByLabel("Amount (USD)").fill("42.50")
		await page.getByLabel("Category").selectOption("SOFTWARE")
		await page.getByLabel("Notes").fill("Playwright edge expense")
		await page.getByRole("button", { name: "Add expense" }).click()

		await expect(page.getByRole("cell", { name: vendor })).toBeVisible({ timeout: 15_000 })
		await expect(page.getByRole("cell", { name: "$42.50" })).toBeVisible()
	})
})
