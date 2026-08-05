import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		include: ["src/**/*.test.ts"],
		reporters: [
			"default",
			["html", { outputFile: "reports/vitest/index.html" }],
			["junit", { outputFile: "reports/vitest/junit.xml" }],
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
})
