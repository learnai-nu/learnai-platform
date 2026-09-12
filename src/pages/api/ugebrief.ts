import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../lib/admin/security';
import { weeklyBriefSchema, weeklyBriefSource } from '../../lib/leads/weekly-brief';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const formData = await request.formData();
	const parsed = weeklyBriefSchema.safeParse({
		email: formData.get('email'),
		firstName: formData.get('firstName') ?? '',
		consent: formData.get('consent'),
		website: formData.get('website') ?? '',
	});
	if (!parsed.success) return redirectWithoutCache('/ugebrief?status=invalid#tilmelding');

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.from('newsletter_subscribers').insert({
		email: parsed.data.email,
		first_name: parsed.data.firstName,
		source: weeklyBriefSource,
	});

	// Existing subscribers receive the same neutral confirmation. This avoids
	// revealing whether a given e-mail address is already in the database.
	if (error && error.code !== '23505') {
		return redirectWithoutCache('/ugebrief?status=save-error#tilmelding');
	}

	return redirectWithoutCache('/ugebrief?status=success#tilmelding');
};
