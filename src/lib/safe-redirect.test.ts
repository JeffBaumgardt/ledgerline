import { describe, expect, it } from "vitest"

import { safeRedirectPath } from "@/lib/safe-redirect"

describe("safeRedirectPath", () => {
	it("returns fallback for empty values", () => {
		expect(safeRedirectPath(undefined)).toBe("/app")
		expect(safeRedirectPath(null)).toBe("/app")
		expect(safeRedirectPath("")).toBe("/app")
		expect(safeRedirectPath(undefined, "/clients")).toBe("/clients")
	})

	it("allows same-origin relative paths", () => {
		expect(safeRedirectPath("/app/invoices")).toBe("/app/invoices")
		expect(safeRedirectPath("/testing?tab=vitest")).toBe("/testing?tab=vitest")
	})

	it("rejects protocol-relative and absolute URLs", () => {
		expect(safeRedirectPath("//evil.example")).toBe("/app")
		expect(safeRedirectPath("https://evil.example")).toBe("/app")
		expect(safeRedirectPath("http://evil.example/app")).toBe("/app")
	})

	it("rejects non-path values", () => {
		expect(safeRedirectPath("app")).toBe("/app")
		expect(safeRedirectPath("javascript:alert(1)")).toBe("/app")
	})
})
