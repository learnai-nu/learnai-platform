import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../lib/admin/security';
import { weeklyBriefSchema, weeklyBriefSource } from '../../lib/leads/weekly-brief';
import {
	createOpaqueToken,
	sendWeeklyBriefConfirmation,
	sha256,
} from '../../lib/email/weekly-brief';
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

	const token = createOpaqueToken();
	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.from('newsletter_subscription_requests').insert({
		email: parsed.data.email,
		first_name: parsed.data.firstName,
		source: weeklyBriefSource,
		consent_at: new Date().toISOString(),
		confirmation_token_hash: await sha256(token),
	});

	if (error) {
		return redirectWithoutCache('/ugebrief?status=save-error#tilmelding');
	}

	try {
		const delivery = await sendWeeklyBriefConfirmation({
			email: parsed.data.email,
			firstName: parsed.data.firstName,
			token,
		});
		if (delivery === 'skipped') return redirectWithoutCache('/ugebrief?status=mail-error#tilmelding');
	} catch {
		return redirectWithoutCache('/ugebrief?status=mail-error#tilmelding');
	}

	return redirectWithoutCache('/ugebrief?status=check-email#tilmelding');
};
