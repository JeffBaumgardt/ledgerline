import { expect, test } from "@playwright/test"

test.describe("clients", () => {
	test("edit client name and see list update", async ({ page }) => {
		const suffix = Date.now().toString(36)
		const original = `Edit Me ${suffix}`
		const updated = `Edited ${suffix}`

		await page.goto("/app/clients/new")
		await page.getByLabel("Name").fill(original)
		await page.getByLabel("Email").fill(`edit-${suffix}@example.com`)
		await page.getByLabel("Company").fill("Edit Co")
		await page.getByRole("button", { name: "Create client" }).click()
		await expect(page).toHaveURL(/\/app\/clients/)
		await expect(page.getByText(original)).toBeVisible()

		// Row actions use "Edit" link (name is plain text, not the link)
		const row = page.getByRole("row", { name: new RegExp(original) })
		await row.getByRole("link", { name: "Edit" }).click()
		await expect(page.getByRole("heading", { name: "Edit client" })).toBeVisible()
		await page.getByLabel("Name").fill(updated)
		await page.getByRole("button", { name: "Save changes" }).click()
		await expect(page).toHaveURL(/\/app\/clients/)
		await expect(page.getByText(updated)).toBeVisible()
		await expect(page.getByText(original)).toHaveCount(0)
	})
})
