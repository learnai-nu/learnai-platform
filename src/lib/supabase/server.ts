import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

function requiredPublicEnv(name: 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
	const value = import.meta.env[name];
	if (!value) {
		throw new Error(`Miljøvariablen ${name} mangler.`);
	}
	return value;
}

export function createServerSupabaseClient(request: Request, cookies: AstroCookies) {
	return createServerClient(
		requiredPublicEnv('PUBLIC_SUPABASE_URL'),
		requiredPublicEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get('Cookie') ?? '');
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						cookies.set(name, value, {
							...options,
							path: '/',
						});
					}
				},
			},
		},
	);
}
