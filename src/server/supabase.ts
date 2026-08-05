import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"

let serverClient: SupabaseClient | null = null

/**
 * Server-only Supabase client using the secret (service role) key.
 * Never import from Client Components.
 * Authorization is Clerk in server code — not client JWT claims.
 */
export function getSupabaseAdmin(): SupabaseClient {
	if (serverClient) {
		return serverClient
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL
	const secretKey = process.env.SUPABASE_SECRET_KEY

	if (!url) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
	}

	if (!secretKey) {
		throw new Error("Missing SUPABASE_SECRET_KEY")
	}

	serverClient = createClient(url, secretKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	})

	return serverClient
}

export function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
	if (!error) return false
	return error.code === "23505" || Boolean(error.message?.includes("duplicate key"))
}

export function newId(): string {
	return nanoid(24)
}

export function throwOnError(
	error: { message?: string; code?: string } | null,
	context: string,
): void {
	if (error) {
		throw new Error(`${context}: ${error.message ?? error.code ?? "unknown error"}`)
	}
}
