import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { setupServer } from "msw/node"

vi.mock("server-only", () => ({}))

import { makeClientHandlers, SUPABASE_URL, type MockClientRow } from "@/test/msw/handlers"

const state = {
	clients: [] as MockClientRow[],
	failNext: false,
}

const server = setupServer(...makeClientHandlers(state))

describe("repository client boundary (MSW)", () => {
	beforeAll(() => {
		process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
		process.env.SUPABASE_SECRET_KEY = "test-service-role-key"
		server.listen({ onUnhandledRequest: "error" })
	})

	beforeEach(async () => {
		state.clients = [
			{
				id: "client-active",
				user_id: "user-1",
				name: "Active Co",
				email: "a@active.test",
				company: "Active",
				archived_at: null,
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-01T00:00:00.000Z",
			},
			{
				id: "client-archived",
				user_id: "user-1",
				name: "Archived Co",
				email: "x@archived.test",
				company: null,
				archived_at: "2026-02-01T00:00:00.000Z",
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-02-01T00:00:00.000Z",
			},
		]
		state.failNext = false
		// Fresh module so getSupabaseAdmin re-reads env and does not keep a dead client
		vi.resetModules()
		vi.doMock("server-only", () => ({}))
	})

	afterEach(() => {
		server.resetHandlers()
	})

	afterAll(() => {
		server.close()
	})

	async function loadRepo() {
		process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
		process.env.SUPABASE_SECRET_KEY = "test-service-role-key"
		return import("@/server/repository")
	}

	it("listClients excludes archived by default", async () => {
		const { listClients } = await loadRepo()
		const clients = await listClients("user-1")
		expect(clients).toHaveLength(1)
		expect(clients[0]?.name).toBe("Active Co")
		expect(clients[0]?.archivedAt).toBeNull()
	})

	it("listClients can include archived", async () => {
		const { listClients } = await loadRepo()
		const clients = await listClients("user-1", { includeArchived: true })
		expect(clients.map((c) => c.name).sort()).toEqual(["Active Co", "Archived Co"])
	})

	it("createClient inserts and returns mapped client", async () => {
		const { createClient } = await loadRepo()
		const created = await createClient("user-1", {
			name: "Boundary LLC",
			email: "b@boundary.test",
			company: "Boundary",
		})
		expect(created.name).toBe("Boundary LLC")
		expect(created.email).toBe("b@boundary.test")
		expect(created.userId).toBe("user-1")
		expect(state.clients.some((c) => c.name === "Boundary LLC")).toBe(true)
	})

	it("surfaces PostgREST errors through throwOnError", async () => {
		state.failNext = true
		const { listClients } = await loadRepo()
		await expect(listClients("user-1")).rejects.toThrow(/listClients/i)
	})
})
