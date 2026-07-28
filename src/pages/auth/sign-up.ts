import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../lib/supabase/server';

const credentialsSchema = z.object({
	email: z.email().max(254),
	password: z.string().min(8).max(128),
});

export const POST: APIRoute = async ({ request, cookies, url }) => {
	const redirectWithoutCache = (location: string) =>
		new Response(null, {
			status: 303,
			headers: { Location: location, 'Cache-Control': 'private, no-store, max-age=0' },
		});
	const parsed = credentialsSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) return redirectWithoutCache('/login?status=invalid');

	const supabase = createServerSupabaseClient(request, cookies);
	const callbackUrl = new URL('/auth/callback?next=/dashboard', url.origin);
	const { error } = await supabase.auth.signUp({
		...parsed.data,
		options: { emailRedirectTo: callbackUrl.toString() },
	});
	if (error) return redirectWithoutCache('/login?status=signup-error');

	return redirectWithoutCache('/login?status=check-email');
};
