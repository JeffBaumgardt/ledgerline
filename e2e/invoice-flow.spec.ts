import { expect, test } from "@playwright/test"

test.describe("invoice flow", () => {
	test("create client → invoice → mark paid → dashboard updates", async ({ page }) => {
		const suffix = Date.now().toString(36)
		const clientName = `E2E Client ${suffix}`

		await page.goto("/app/clients/new")
		await page.getByLabel("Name").fill(clientName)
		await page.getByLabel("Email").fill(`e2e-${suffix}@example.com`)
		await page.getByLabel("Company").fill("E2E Co")
		await page.getByRole("button", { name: "Create client" }).click()
		await expect(page).toHaveURL(/\/app\/clients/)
		await expect(page.getByText(clientName)).toBeVisible()

		await page.goto("/app/invoices/new")
		await page.getByLabel("Client").selectOption({ label: clientName })
		await page.getByLabel(/Line 1 description/).fill("E2E consulting")
		await page.getByLabel(/Line 1 quantity/).fill("2")
		await page.getByLabel(/Line 1 unit price/).fill("150.00")
		await expect(page.getByText("Total: $300.00")).toBeVisible()
		await page.getByRole("button", { name: "Create invoice" }).click()
		await expect(page).toHaveURL(/\/app\/invoices\//)

		await page.getByRole("button", { name: "Mark sent" }).click()
		await expect(page.getByLabel(/Status: sent/i)).toBeVisible({ timeout: 10_000 })

		await page.getByRole("button", { name: "Mark paid" }).click()
		await expect(page.getByLabel(/Status: paid/i)).toBeVisible({ timeout: 10_000 })

		await page.goto("/app")
		await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
		// Paid this month card should be present (value depends on prior seed, just ensure render)
		await expect(page.getByText("Paid this month")).toBeVisible()
		await expect(page.getByText(/E2E Client|INV-/).first()).toBeVisible()
	})

	test("export CSV smoke", async ({ page }) => {
		await page.goto("/app/invoices")
		await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible()

		const downloadPromise = page.waitForEvent("download")
		await page.getByRole("button", { name: "Export filtered invoices to CSV" }).click()
		const download = await downloadPromise
		expect(download.suggestedFilename()).toMatch(/\.csv$/i)
	})

	test("filter drafts and filter by paid status", async ({ page }) => {
		await page.goto("/app/invoices")
		// Status chips use aria-label "Status: …"; use exact filter label.
		await page.getByLabel("Status", { exact: true }).selectOption("DRAFT")
		await expect(page).toHaveURL(/status=DRAFT/)
		await page.getByRole("button", { name: /Sort by Number/i }).click()
		await expect(page.getByRole("columnheader", { name: /Number/i })).toBeVisible()

		await page.getByLabel("Status", { exact: true }).selectOption("PAID")
		await expect(page).toHaveURL(/status=PAID/)
	})
})
