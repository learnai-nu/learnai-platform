import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../lib/supabase/server';

const credentialsSchema = z.object({
	email: z.email().max(254),
	password: z.string().min(8).max(128),
});

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
	const parsed = credentialsSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) return redirect('/login?status=invalid', 303);

	const supabase = createServerSupabaseClient(request, cookies);
	const callbackUrl = new URL('/auth/callback?next=/dashboard', url.origin);
	const { error } = await supabase.auth.signUp({
		...parsed.data,
		options: { emailRedirectTo: callbackUrl.toString() },
	});
	if (error) return redirect('/login?status=signup-error', 303);

	return redirect('/login?status=check-email', 303);
};
