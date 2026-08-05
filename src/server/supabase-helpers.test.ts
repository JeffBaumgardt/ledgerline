import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { isUniqueViolation, throwOnError } from "@/server/supabase"

describe("supabase helpers", () => {
	it("throwOnError ignores null", () => {
		expect(() => throwOnError(null, "ctx")).not.toThrow()
	})

	it("throwOnError wraps message and context", () => {
		expect(() => throwOnError({ message: "boom", code: "PGRST" }, "listClients")).toThrow(
			"listClients: boom",
		)
		expect(() => throwOnError({ code: "XX" }, "op")).toThrow("op: XX")
	})

	it("isUniqueViolation detects postgres and message shapes", () => {
		expect(isUniqueViolation(null)).toBe(false)
		expect(isUniqueViolation({ code: "23505" })).toBe(true)
		expect(isUniqueViolation({ message: "duplicate key value violates unique constraint" })).toBe(true)
		expect(isUniqueViolation({ code: "42501", message: "permission denied" })).toBe(false)
	})
})
