"use client"

import Link from "next/link"
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { invoicesToCsv } from "@/lib/csv"
import { formatMoney } from "@/lib/money"
import { getEffectiveStatus, InvoiceStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"
import StatusBadge from "@/components/StatusBadge"

export type InvoiceTableRow = {
	id: string
	number: string
	clientId: string
	clientName: string
	status: StoredInvoiceStatus
	issueDate: string
	dueDate: string
	totalCents: number
}

type ClientOption = { id: string; name: string }

type Props = {
	rows: InvoiceTableRow[]
	clients: ClientOption[]
	filters: {
		status: string
		clientId: string
		from: string
		to: string
	}
}

export function InvoiceTable({ rows, clients, filters }: Props) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [sorting, setSorting] = useState<SortingState>([{ id: "issueDate", desc: true }])

	const columns = useMemo<ColumnDef<InvoiceTableRow>[]>(
		() => [
			{
				accessorKey: "number",
				header: "Number",
				cell: ({ row }) => (
					<Link
						href={`/app/invoices/${row.original.id}`}
						className="font-medium text-[var(--ll-accent)] hover:underline"
					>
						{row.original.number}
					</Link>
				),
			},
			{
				accessorKey: "clientName",
				header: "Client",
			},
			{
				id: "status",
				accessorFn: (row) => getEffectiveStatus(row),
				header: "Status",
				cell: ({ row }) => (
					<StatusBadge status={row.original.status} dueDate={row.original.dueDate} />
				),
			},
			{
				accessorKey: "issueDate",
				header: "Issue date",
			},
			{
				accessorKey: "dueDate",
				header: "Due date",
			},
			{
				accessorKey: "totalCents",
				header: "Total",
				cell: ({ getValue }) => (
					<span className="tabular-nums">{formatMoney(getValue<number>())}</span>
				),
			},
		],
		[],
	)

	const table = useReactTable({
		data: rows,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	function handleFilterChange(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString())
		if (!value || value === "ALL") {
			params.delete(key)
		} else {
			params.set(key, value)
		}
		const qs = params.toString()
		router.push(qs ? `/app/invoices?${qs}` : "/app/invoices")
	}

	function handleExportCsv() {
		const sorted = table.getRowModel().rows.map((r) => r.original)
		const csv = invoicesToCsv(
			sorted.map((r) => ({
				number: r.number,
				clientName: r.clientName,
				status: getEffectiveStatus(r),
				issueDate: r.issueDate,
				dueDate: r.dueDate,
				totalCents: r.totalCents,
			})),
		)
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "invoices.csv"
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="space-y-4">
			<form
				className="flex flex-wrap items-end gap-3"
				onSubmit={(e) => e.preventDefault()}
				aria-label="Filter invoices"
			>
				<div>
					<label htmlFor="filter-status" className="block text-xs font-semibold uppercase text-[var(--ll-muted)]">
						Status
					</label>
					<select
						id="filter-status"
						value={filters.status}
						onChange={(e) => handleFilterChange("status", e.target.value)}
						className="mt-1 rounded-md border border-[var(--ll-line)] bg-white px-2 py-1.5 text-sm"
					>
						<option value="ALL">All</option>
						<option value={InvoiceStatus.DRAFT}>Draft</option>
						<option value={InvoiceStatus.SENT}>Sent</option>
						<option value={InvoiceStatus.PAID}>Paid</option>
						<option value={InvoiceStatus.OVERDUE}>Overdue</option>
					</select>
				</div>
				<div>
					<label htmlFor="filter-client" className="block text-xs font-semibold uppercase text-[var(--ll-muted)]">
						Client
					</label>
					<select
						id="filter-client"
						value={filters.clientId}
						onChange={(e) => handleFilterChange("clientId", e.target.value)}
						className="mt-1 rounded-md border border-[var(--ll-line)] bg-white px-2 py-1.5 text-sm"
					>
						<option value="">All clients</option>
						{clients.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="filter-from" className="block text-xs font-semibold uppercase text-[var(--ll-muted)]">
						From
					</label>
					<input
						id="filter-from"
						type="date"
						value={filters.from}
						onChange={(e) => handleFilterChange("from", e.target.value)}
						className="mt-1 rounded-md border border-[var(--ll-line)] bg-white px-2 py-1.5 text-sm"
					/>
				</div>
				<div>
					<label htmlFor="filter-to" className="block text-xs font-semibold uppercase text-[var(--ll-muted)]">
						To
					</label>
					<input
						id="filter-to"
						type="date"
						value={filters.to}
						onChange={(e) => handleFilterChange("to", e.target.value)}
						className="mt-1 rounded-md border border-[var(--ll-line)] bg-white px-2 py-1.5 text-sm"
					/>
				</div>
				<button
					type="button"
					onClick={handleExportCsv}
					className="rounded-md border border-[var(--ll-line)] bg-white px-3 py-1.5 text-sm font-semibold hover:border-[var(--ll-accent)]"
					aria-label="Export filtered invoices to CSV"
				>
					Export CSV
				</button>
			</form>

			<div className="overflow-x-auto border border-[var(--ll-line)] bg-[var(--ll-surface)]">
				<table className="w-full min-w-[48rem] text-left text-sm">
					<thead className="border-b border-[var(--ll-line)] text-xs uppercase tracking-wide text-[var(--ll-muted)]">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const sorted = header.column.getIsSorted()
									const ariaSort =
										sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"
									return (
										<th
											key={header.id}
											scope="col"
											aria-sort={header.column.getCanSort() ? ariaSort : undefined}
											className="px-4 py-3 font-semibold"
										>
											{header.isPlaceholder ? null : header.column.getCanSort() ? (
												<button
													type="button"
													className="inline-flex items-center gap-1 hover:text-[var(--ll-ink)]"
													onClick={header.column.getToggleSortingHandler()}
													aria-label={`Sort by ${String(header.column.columnDef.header)}`}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													<span aria-hidden className="text-[10px]">
														{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "↕"}
													</span>
												</button>
											) : (
												flexRender(header.column.columnDef.header, header.getContext())
											)}
										</th>
									)
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="px-4 py-8 text-[var(--ll-muted)]">
									No invoices match these filters.
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="border-b border-[var(--ll-line)] last:border-0">
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-3">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
