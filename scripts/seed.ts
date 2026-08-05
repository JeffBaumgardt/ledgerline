/**
 * Idempotent seed for ll_* tables only (shared Pulseboard Supabase project).
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
 * Optional: SEED_CLERK_USER_ID, SEED_CLERK_USER_EMAIL, SEED_CLERK_USER_NAME
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"

function loadEnvFile(filename: string) {
	const path = resolve(process.cwd(), filename)
	if (!existsSync(path)) return
	const text = readFileSync(path, "utf8")
	for (const line of text.split("\n")) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith("#")) continue
		const eq = trimmed.indexOf("=")
		if (eq === -1) continue
		const key = trimmed.slice(0, eq).trim()
		let value = trimmed.slice(eq + 1).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		if (process.env[key] === undefined) {
			process.env[key] = value
		}
	}
}

loadEnvFile(".env.local")
loadEnvFile(".env")


function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) throw new Error(`Missing ${name}`)
	return value
}

function id(): string {
	return nanoid(24)
}

function isoDaysFromNow(days: number): string {
	const d = new Date()
	d.setDate(d.getDate() + days)
	return d.toISOString().slice(0, 10)
}

async function main() {
	const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
	const secret = requireEnv("SUPABASE_SECRET_KEY")
	const clerkUserId = process.env.SEED_CLERK_USER_ID ?? "seed_demo_clerk_user"
	const email = process.env.SEED_CLERK_USER_EMAIL ?? "demo@ledgerline.local"
	const name = process.env.SEED_CLERK_USER_NAME ?? "Demo User"

	const supabase = createClient(url, secret, {
		auth: { persistSession: false, autoRefreshToken: false },
	})

	const { data: existingUser, error: findErr } = await supabase
		.from("ll_users")
		.select("*")
		.eq("clerk_user_id", clerkUserId)
		.maybeSingle()
	if (findErr) throw findErr

	let userId: string
	const now = new Date().toISOString()

	if (existingUser) {
		userId = existingUser.id as string
		// Wipe this user's demo data so seed is re-runnable (ll_* only)
		const { data: invs } = await supabase.from("ll_invoices").select("id").eq("user_id", userId)
		const invIds = (invs ?? []).map((r) => r.id as string)
		if (invIds.length > 0) {
			await supabase.from("ll_line_items").delete().in("invoice_id", invIds)
		}
		await supabase.from("ll_invoices").delete().eq("user_id", userId)
		await supabase.from("ll_expenses").delete().eq("user_id", userId)
		await supabase.from("ll_clients").delete().eq("user_id", userId)
		console.log(`Cleared existing seed data for user ${userId}`)
	} else {
		userId = id()
		const { error } = await supabase.from("ll_users").insert({
			id: userId,
			clerk_user_id: clerkUserId,
			email,
			name,
			created_at: now,
			updated_at: now,
		})
		if (error) throw error
		console.log(`Created ll_users ${userId}`)
	}

	const clients = [
		{ id: id(), name: "Harbor Studio", email: "billing@harbor.example", company: "Harbor Studio LLC" },
		{ id: id(), name: "Northwind Retail", email: "ap@northwind.example", company: "Northwind Inc" },
		{ id: id(), name: "Cedar Labs", email: "ops@cedar.example", company: "Cedar Labs" },
		{ id: id(), name: "Blue Quill", email: "hello@bluequill.example", company: null },
		{ id: id(), name: "Summit Freight", email: "accounts@summit.example", company: "Summit Freight Co" },
	]

	const { error: clientErr } = await supabase.from("ll_clients").insert(
		clients.map((c) => ({
			id: c.id,
			user_id: userId,
			name: c.name,
			email: c.email,
			company: c.company,
			created_at: now,
			updated_at: now,
		})),
	)
	if (clientErr) throw clientErr

	const invoices = [
		{
			number: "INV-001",
			client: clients[0],
			status: "PAID" as const,
			issue: isoDaysFromNow(-40),
			due: isoDaysFromNow(-26),
			items: [
				{ description: "Brand refresh discovery", quantity: 1, unit_price_cents: 240000 },
				{ description: "Brand kit delivery", quantity: 1, unit_price_cents: 120000 },
			],
		},
		{
			number: "INV-002",
			client: clients[1],
			status: "SENT" as const,
			issue: isoDaysFromNow(-10),
			due: isoDaysFromNow(5),
			items: [{ description: "POS integration sprint", quantity: 40, unit_price_cents: 12500 }],
		},
		{
			number: "INV-003",
			client: clients[2],
			status: "SENT" as const,
			issue: isoDaysFromNow(-25),
			due: isoDaysFromNow(-5),
			items: [{ description: "Lab dashboard prototype", quantity: 1, unit_price_cents: 480000 }],
		},
		{
			number: "INV-004",
			client: clients[3],
			status: "DRAFT" as const,
			issue: isoDaysFromNow(0),
			due: isoDaysFromNow(14),
			items: [
				{ description: "Website content rewrite", quantity: 8, unit_price_cents: 15000 },
				{ description: "Editorial QA", quantity: 2, unit_price_cents: 10000 },
			],
		},
		{
			number: "INV-005",
			client: clients[4],
			status: "PAID" as const,
			issue: isoDaysFromNow(-15),
			due: isoDaysFromNow(-1),
			items: [{ description: "Freight analytics retainer", quantity: 1, unit_price_cents: 350000 }],
		},
		{
			number: "INV-006",
			client: clients[0],
			status: "DRAFT" as const,
			issue: isoDaysFromNow(0),
			due: isoDaysFromNow(21),
			items: [{ description: "Social templates pack", quantity: 1, unit_price_cents: 90000 }],
		},
	]

	for (const inv of invoices) {
		const invId = id()
		const paidAt =
			inv.status === "PAID" ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() : null
		const sentAt =
			inv.status === "SENT" || inv.status === "PAID"
				? new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
				: null

		const { error: invErr } = await supabase.from("ll_invoices").insert({
			id: invId,
			user_id: userId,
			client_id: inv.client.id,
			number: inv.number,
			issue_date: inv.issue,
			due_date: inv.due,
			status: inv.status,
			sent_at: sentAt,
			paid_at: paidAt,
			notes: null,
			created_at: now,
			updated_at: now,
		})
		if (invErr) throw invErr

		const { error: lineErr } = await supabase.from("ll_line_items").insert(
			inv.items.map((item, index) => ({
				id: id(),
				invoice_id: invId,
				description: item.description,
				quantity: item.quantity,
				unit_price_cents: item.unit_price_cents,
				position: index,
			})),
		)
		if (lineErr) throw lineErr
	}

	const expenses = [
		{
			date: isoDaysFromNow(-3),
			category: "SOFTWARE",
			amount_cents: 2900,
			vendor: "Figma",
		},
		{
			date: isoDaysFromNow(-8),
			category: "TRAVEL",
			amount_cents: 18650,
			vendor: "United Airlines",
		},
		{
			date: isoDaysFromNow(-20),
			category: "CONTRACTORS",
			amount_cents: 120000,
			vendor: "Kai Freelance",
		},
		{
			date: isoDaysFromNow(-45),
			category: "MARKETING",
			amount_cents: 45000,
			vendor: "Print House",
		},
		{
			date: isoDaysFromNow(-2),
			category: "MEALS",
			amount_cents: 6240,
			vendor: "Cafe North",
		},
	]

	const { error: expErr } = await supabase.from("ll_expenses").insert(
		expenses.map((e) => ({
			id: id(),
			user_id: userId,
			date: e.date,
			category: e.category,
			amount_cents: e.amount_cents,
			vendor: e.vendor,
			notes: null,
			created_at: now,
		})),
	)
	if (expErr) throw expErr

	console.log(`Seeded ${clients.length} clients, ${invoices.length} invoices, ${expenses.length} expenses`)
	console.log(`User clerk_user_id=${clerkUserId} app_user_id=${userId}`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
