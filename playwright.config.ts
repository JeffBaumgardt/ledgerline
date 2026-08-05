import { defineConfig, devices } from "@playwright/test"

// Prefer localhost over 127.0.0.1 so Next.js dev does not block _next assets as cross-origin.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

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
				// Invoke Next directly — avoids broken host-level `pnpm run` version checks in some envs.
				command: "node ./node_modules/next/dist/bin/next dev -p 3000 -H localhost",
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
			name: "public",
			testMatch: /public\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "chromium",
			testMatch: /.*\.spec\.ts/,
			testIgnore: /public\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				storageState: "playwright/.clerk/user.json",
			},
			dependencies: ["setup"],
		},
	],
})
