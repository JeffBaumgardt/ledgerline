/** Only allow same-origin relative paths for auth redirects. */
export function safeRedirectPath(value: string | undefined | null, fallback = "/app"): string {
	if (!value) return fallback
	if (!value.startsWith("/") || value.startsWith("//")) return fallback
	return value
}
