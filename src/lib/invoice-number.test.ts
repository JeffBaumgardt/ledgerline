import { describe, expect, it } from "vitest"

import { nextInvoiceNumberFrom } from "@/lib/invoice-number"

describe("nextInvoiceNumberFrom", () => {
	it("starts at INV-001 when empty", () => {
		expect(nextInvoiceNumberFrom([])).toBe("INV-001")
	})

	it("increments the highest INV-###", () => {
		expect(nextInvoiceNumberFrom(["INV-001", "INV-003", "INV-002"])).toBe("INV-004")
	})

	it("pads to three digits past 99", () => {
		expect(nextInvoiceNumberFrom(["INV-099"])).toBe("INV-100")
	})

	it("ignores non-matching numbers", () => {
		expect(nextInvoiceNumberFrom(["draft", "INV-X", "INV-7"])).toBe("INV-008")
	})

	it("is case-insensitive on the INV prefix", () => {
		expect(nextInvoiceNumberFrom(["inv-012"])).toBe("INV-013")
	})
})
