import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../lib/admin/security';
import { levelTwoWaitlistSource, waitlistSchema } from '../../lib/leads/waitlist';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const formData = await request.formData();
	const parsed = waitlistSchema.safeParse({
		email: formData.get('email'),
		firstName: formData.get('firstName') ?? '',
		consent: formData.get('consent'),
		website: formData.get('website') ?? '',
	});
	if (!parsed.success) return redirectWithoutCache('/kurser/ai-i-arbejdet?status=invalid');

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.from('newsletter_subscribers').insert({
		email: parsed.data.email,
		first_name: parsed.data.firstName,
		source: levelTwoWaitlistSource,
	});

	if (error && error.code !== '23505') {
		return redirectWithoutCache('/kurser/ai-i-arbejdet?status=save-error');
	}

	return redirectWithoutCache('/kurser/ai-i-arbejdet?status=success');
};
