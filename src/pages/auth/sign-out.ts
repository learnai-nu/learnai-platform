import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	const supabase = createServerSupabaseClient(request, cookies);
	await supabase.auth.signOut();
	return redirect('/', 303);
};
