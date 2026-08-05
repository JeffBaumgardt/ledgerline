import "server-only"
import { auth, currentUser } from "@clerk/nextjs/server"

import { upsertUserByClerk } from "@/server/repository"
import type { User } from "@/server/types"

export async function requireClerkUserId(): Promise<string> {
	const { userId } = await auth()
	if (!userId) {
		throw new Error("Unauthorized")
	}
	return userId
}

/**
 * Ensure a local ll_users row exists for the Clerk session (upsert by clerk_user_id).
 */
export async function ensureUser(): Promise<User> {
	const clerkUserId = await requireClerkUserId()
	const clerkUser = await currentUser()
	const email =
		clerkUser?.primaryEmailAddress?.emailAddress ??
		clerkUser?.emailAddresses[0]?.emailAddress ??
		`${clerkUserId}@users.ledgerline.local`
	const name =
		[clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
		clerkUser?.username ||
		null

	return upsertUserByClerk({ clerkUserId, email, name })
}
