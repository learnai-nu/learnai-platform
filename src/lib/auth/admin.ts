import type { AstroCookies } from 'astro';
import { createServerSupabaseClient } from '../supabase/server';

export type ContentManagerRole = 'admin' | 'editor';

export function getContentManagerRole(claims: unknown): ContentManagerRole | null {
	if (!claims || typeof claims !== 'object') return null;
	const appMetadata = (claims as { app_metadata?: unknown }).app_metadata;
	if (!appMetadata || typeof appMetadata !== 'object') return null;
	const role = (appMetadata as { role?: unknown }).role;
	return role === 'admin' || role === 'editor' ? role : null;
}

export async function getAdminContext(request: Request, cookies: AstroCookies) {
	const supabase = createServerSupabaseClient(request, cookies);
	const { data, error } = await supabase.auth.getClaims();
	const claims = data?.claims ?? null;

	return {
		supabase,
		claims,
		role: getContentManagerRole(claims),
		authError: error,
	};
}

export function adminEmail(claims: unknown) {
	if (!claims || typeof claims !== 'object') return 'Redaktion';
	const email = (claims as { email?: unknown }).email;
	return typeof email === 'string' ? email : 'Redaktion';
}
