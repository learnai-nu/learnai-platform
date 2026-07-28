import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../lib/supabase/server';

function safeNextPath(value: string | null) {
	return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export const GET: APIRoute = async ({ request, cookies, url }) => {
	const redirectWithoutCache = (location: string) =>
		new Response(null, {
			status: 303,
			headers: { Location: location, 'Cache-Control': 'private, no-store, max-age=0' },
		});
	const code = url.searchParams.get('code');
	if (!code) return redirectWithoutCache('/login?status=callback-error');

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) return redirectWithoutCache('/login?status=callback-error');

	return redirectWithoutCache(safeNextPath(url.searchParams.get('next')));
};
