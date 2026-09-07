import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../../lib/admin/security';
import { sendBusinessLeadNotification } from '../../../lib/email/business-lead-notification';
import { businessLeadSchema, toBusinessLeadRow } from '../../../lib/leads/business';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export const prerender = false;

const page = '/virksomheder';

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const formData = await request.formData();
	const parsed = businessLeadSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		company: formData.get('company'),
		roleTitle: formData.get('roleTitle') ?? '',
		companySize: formData.get('companySize') || undefined,
		goal: formData.get('goal') ?? '',
		consent: formData.get('consent'),
		website: formData.get('website') ?? '',
	});
	if (!parsed.success) return redirectWithoutCache(`${page}?status=invalid#kontakt`);

	const supabase = createServerSupabaseClient(request, cookies);
	const { error } = await supabase.from('business_leads').insert(toBusinessLeadRow(parsed.data));
	if (error) return redirectWithoutCache(`${page}?status=save-error#kontakt`);

	try {
		const notification = await sendBusinessLeadNotification(parsed.data);
		if (notification === 'skipped') {
			console.warn('Leadet blev gemt, men e-mailnotifikation er ikke konfigureret.');
		}
	} catch {
		// En fejl hos mailleverandøren må ikke få brugeren til at genindsende et lead,
		// der allerede er gemt i Supabase.
		console.error('Leadet blev gemt, men e-mailnotifikationen kunne ikke sendes.');
	}

	return redirectWithoutCache(`${page}?status=success#kontakt`);
};
