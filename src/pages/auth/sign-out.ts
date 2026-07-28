import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export const POST: APIRoute = async ({ request, cookies }) => {
	const supabase = createServerSupabaseClient(request, cookies);
	await supabase.auth.signOut();
	return new Response(null, {
		status: 303,
		headers: { Location: '/', 'Cache-Control': 'private, no-store, max-age=0' },
	});
};
