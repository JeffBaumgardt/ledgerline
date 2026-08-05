import { describe, expect, it } from "vitest"

import {
	dollarsToCents,
	formatMoney,
	invoiceTotalCents,
	lineItemTotalCents,
	sumLineItems,
} from "@/lib/money"

describe("money", () => {
	it("formats cents as USD", () => {
		expect(formatMoney(0)).toBe("$0.00")
		expect(formatMoney(1250)).toBe("$12.50")
		expect(formatMoney(100_000)).toBe("$1,000.00")
	})

	it("computes line item and invoice totals", () => {
		expect(lineItemTotalCents(3, 500)).toBe(1500)
		expect(
			sumLineItems([
				{ quantity: 2, unitPriceCents: 1000 },
				{ quantity: 1, unitPriceCents: 250 },
			]),
		).toBe(2250)
		expect(
			invoiceTotalCents([
				{ quantity: 1, unitPriceCents: 999 },
				{ quantity: 4, unitPriceCents: 100 },
			]),
		).toBe(1399)
	})

	it("converts dollars to cents with rounding", () => {
		expect(dollarsToCents(12.5)).toBe(1250)
		expect(dollarsToCents(12.505)).toBe(1251)
	})

	it("handles zero quantity lines and empty sums", () => {
		expect(lineItemTotalCents(0, 999)).toBe(0)
		expect(sumLineItems([])).toBe(0)
		expect(invoiceTotalCents([])).toBe(0)
	})

	it("formats negative cents as negative currency", () => {
		expect(formatMoney(-50)).toBe("-$0.50")
	})
})
