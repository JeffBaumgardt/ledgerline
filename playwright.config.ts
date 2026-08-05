import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [
		["list"],
		["html", { outputFolder: "reports/playwright", open: "never" }],
		["junit", { outputFile: "reports/playwright/junit.xml" }],
		...(process.env.CI ? ([["github"]] as const) : []),
	],
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: "pnpm dev",
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: "playwright/.clerk/user.json",
			},
			dependencies: ["setup"],
		},
	],
})
