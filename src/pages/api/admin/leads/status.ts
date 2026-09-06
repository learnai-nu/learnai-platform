import type { APIRoute } from 'astro';
import { getAdminContext } from '../../../../lib/auth/admin';
import { adminStatusUrl, hasSameOrigin, redirectWithoutCache } from '../../../../lib/admin/security';
import { leadStatusSchema } from '../../../../lib/leads/business';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const context = await getAdminContext(request, cookies);
	// Leads er persondata. Kun administratorer, aldrig redaktører.
	if (context.role !== 'admin') return new Response('Du har ikke adgang til leads.', { status: 403 });

	const formData = await request.formData();
	const parsed = leadStatusSchema.safeParse({
		id: formData.get('id'),
		status: formData.get('status'),
	});
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl('/admin/leads', 'error'));

	const { error } = await context.supabase
		.from('business_leads')
		.update({ status: parsed.data.status })
		.eq('id', parsed.data.id);
	if (error) return redirectWithoutCache(adminStatusUrl('/admin/leads', 'error'));

	return redirectWithoutCache(adminStatusUrl('/admin/leads', 'saved'));
};
