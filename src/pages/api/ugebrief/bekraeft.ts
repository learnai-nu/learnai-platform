import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../../lib/admin/security';
import { sha256, syncWeeklyBriefContact } from '../../../lib/email/weekly-brief';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });
	const formData = await request.formData();
	const token = String(formData.get('token') ?? '');
	if (!/^[a-f0-9]{64}$/.test(token)) return redirectWithoutCache('/ugebrief/bekraeft?status=invalid');

	const tokenHash = await sha256(token);
	const supabase = createServerSupabaseClient(request, cookies, { 'x-newsletter-token': tokenHash });
	const { data, error } = await supabase
		.from('newsletter_subscribers')
		.select('email, first_name')
		.eq('confirmation_token_hash', tokenHash)
		.gt('confirmation_expires_at', new Date().toISOString())
		.maybeSingle();
	const candidate = data;
	if (error || !candidate?.email) return redirectWithoutCache('/ugebrief/bekraeft?status=invalid');

	try {
		const contactId = await syncWeeklyBriefContact({
			email: candidate.email,
			firstName: candidate.first_name,
		});
		const { error: confirmError } = await supabase
			.from('newsletter_subscribers')
			.update({
				confirmed_at: new Date().toISOString(),
				unsubscribed_at: null,
				resend_contact_id: contactId,
			})
			.eq('confirmation_token_hash', tokenHash);
		if (confirmError) throw new Error('Tilmeldingen kunne ikke bekræftes.');
	} catch {
		return redirectWithoutCache(`/ugebrief/bekraeft?status=error&token=${encodeURIComponent(token)}`);
	}

	return redirectWithoutCache('/ugebrief/bekraeft?status=success');
};
