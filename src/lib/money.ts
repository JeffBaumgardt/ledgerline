/** Money helpers — all amounts in integer cents. */

export function formatMoney(cents: number, currency = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(cents / 100)
}

export function lineItemTotalCents(quantity: number, unitPriceCents: number): number {
	return quantity * unitPriceCents
}

export function sumLineItems(
	items: Array<{ quantity: number; unitPriceCents: number }>,
): number {
	return items.reduce((sum, item) => sum + lineItemTotalCents(item.quantity, item.unitPriceCents), 0)
}

/** Invoice total equals line item sum in v1 (no tax/shipping). */
export function invoiceTotalCents(
	items: Array<{ quantity: number; unitPriceCents: number }>,
): number {
	return sumLineItems(items)
}

export function dollarsToCents(dollars: number): number {
	return Math.round(dollars * 100)
}
