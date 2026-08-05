/**
 * MSW handlers for PostgREST-shaped Supabase Data API responses.
 * These are boundary fixtures, not a full PostgREST emulation.
 */
import { http, HttpResponse } from "msw"

export const SUPABASE_URL = "http://127.0.0.1:54321"

export type MockClientRow = {
	id: string
	user_id: string
	name: string
	email: string
	company: string | null
	archived_at: string | null
	created_at: string
	updated_at: string
}

export function makeClientHandlers(state: { clients: MockClientRow[]; failNext?: boolean }) {
	return [
		http.get(`${SUPABASE_URL}/rest/v1/ll_clients`, ({ request }) => {
			if (state.failNext) {
				state.failNext = false
				return HttpResponse.json(
					{ message: "simulated clients failure", code: "PGRST000" },
					{ status: 500 },
				)
			}

			const url = new URL(request.url)
			const userId = url.searchParams.get("user_id")?.replace(/^eq\./, "")
			const archivedIs = url.searchParams.get("archived_at")

			let rows = state.clients
			if (userId) {
				rows = rows.filter((c) => c.user_id === userId)
			}
			if (archivedIs === "is.null") {
				rows = rows.filter((c) => c.archived_at == null)
			}
			return HttpResponse.json(rows)
		}),

		http.post(`${SUPABASE_URL}/rest/v1/ll_clients`, async ({ request }) => {
			if (state.failNext) {
				state.failNext = false
				return HttpResponse.json({ message: "insert failed", code: "42501" }, { status: 400 })
			}
			const body = (await request.json()) as MockClientRow | MockClientRow[]
			const row = Array.isArray(body) ? body[0] : body
			const now = new Date().toISOString()
			const created: MockClientRow = {
				id: row.id,
				user_id: row.user_id,
				name: row.name,
				email: row.email,
				company: row.company ?? null,
				archived_at: null,
				created_at: row.created_at ?? now,
				updated_at: row.updated_at ?? now,
			}
			state.clients.push(created)
			// Prefer return=representation is default for select after insert in supabase-js
			return HttpResponse.json(created, { status: 201 })
		}),
	]
}
