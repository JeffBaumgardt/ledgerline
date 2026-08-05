import { formatMoney } from "@/lib/money"

export type CsvInvoiceRow = {
	number: string
	clientName: string
	status: string
	issueDate: string
	dueDate: string
	totalCents: number
}

function escapeCsvField(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

function formatDate(value: string): string {
	// Accept YYYY-MM-DD or ISO strings
	return value.slice(0, 10)
}

/**
 * Serialize invoice rows to CSV (headers + rows). Filters already applied by caller.
 */
export function invoicesToCsv(rows: CsvInvoiceRow[]): string {
	const headers = ["Number", "Client", "Status", "Issue date", "Due date", "Total"]
	const lines = [headers.join(",")]

	for (const row of rows) {
		const fields = [
			escapeCsvField(row.number),
			escapeCsvField(row.clientName),
			escapeCsvField(row.status),
			escapeCsvField(formatDate(row.issueDate)),
			escapeCsvField(formatDate(row.dueDate)),
			escapeCsvField(formatMoney(row.totalCents)),
		]
		lines.push(fields.join(","))
	}

	return lines.join("\n") + "\n"
}
