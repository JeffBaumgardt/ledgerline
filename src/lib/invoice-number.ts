/**
 * Derive the next INV-### number from existing invoice number strings.
 * Non-matching formats are ignored.
 */
export function nextInvoiceNumberFrom(existingNumbers: string[]): string {
	let max = 0
	for (const number of existingNumbers) {
		const match = /^INV-(\d+)$/i.exec(number)
		if (match) {
			max = Math.max(max, Number(match[1]))
		}
	}
	return `INV-${String(max + 1).padStart(3, "0")}`
}
