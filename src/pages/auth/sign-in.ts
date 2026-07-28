import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../lib/supabase/server';

const credentialsSchema = z.object({
	email: z.email().max(254),
	password: z.string().min(8).max(128),
});

export const POST: APIRoute = async ({ request, cookies }) => {
	const redirectWithoutCache = (location: string) =>
		new Response(null, {
			status: 303,
			headers: { Location: location, 'Cache-Control': 'private, no-store, max-age=0' },
		});
	const parsed = credentialsSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) return redirectWithoutCache('/login?status=invalid');

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.auth.signInWithPassword(parsed.data);
	if (error) return redirectWithoutCache('/login?status=signin-error');

	return redirectWithoutCache('/dashboard');
};
