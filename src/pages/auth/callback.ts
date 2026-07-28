import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../lib/supabase/server';

function safeNextPath(value: string | null) {
	return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export const GET: APIRoute = async ({ request, cookies, redirect, url }) => {
	const code = url.searchParams.get('code');
	if (!code) return redirect('/login?status=callback-error', 303);

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) return redirect('/login?status=callback-error', 303);

	return redirect(safeNextPath(url.searchParams.get('next')), 303);
};
