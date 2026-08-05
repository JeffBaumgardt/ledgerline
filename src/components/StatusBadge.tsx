import { getEffectiveStatus, type StoredInvoiceStatus } from "@/lib/invoice-status"

const styles: Record<StoredInvoiceStatus, string> = {
	DRAFT: "bg-slate-200/80 text-slate-800",
	SENT: "bg-sky-100 text-sky-900",
	PAID: "bg-emerald-100 text-emerald-900",
	OVERDUE: "bg-amber-100 text-amber-950",
}

type StatusBadgeProps = {
	status: StoredInvoiceStatus
	dueDate: string
}

export default function StatusBadge({ status, dueDate }: StatusBadgeProps) {
	const effective = getEffectiveStatus({ status, dueDate })
	return (
		<span
			className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium tracking-wide ${styles[effective]}`}
			aria-label={`Status: ${effective.toLowerCase()}`}
		>
			{effective}
		</span>
	)
}
