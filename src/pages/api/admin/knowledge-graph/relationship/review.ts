import type { APIRoute } from 'astro';
import { relationshipReviewSchema } from '../../../../../lib/knowledge-graph/contracts';
import {
	adminStatusUrl,
	hasSameOrigin,
	redirectWithoutCache,
} from '../../../../../lib/admin/security';
import { getAdminContext } from '../../../../../lib/auth/admin';

const graphPath = '/admin/vidensgraf';

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });
	const context = await getAdminContext(request, cookies);
	if (!context.claims) return redirectWithoutCache('/login?status=required');
	if (!context.role) return new Response('Ingen adgang.', { status: 403 });

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return redirectWithoutCache(adminStatusUrl(graphPath, 'review-error'));
	}

	const parsed = relationshipReviewSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(graphPath, 'review-error'));

	const { data: current, error: loadError } = await context.supabase
		.from('relationships')
		.select('status')
		.eq('id', parsed.data.relationshipId)
		.maybeSingle();
	if (loadError || !current) return redirectWithoutCache(adminStatusUrl(graphPath, 'review-error'));

	const transitionAllowed = parsed.data.decision === 'archived'
		? current.status === 'approved' || current.status === 'rejected'
		: current.status === 'proposed';
	if (!transitionAllowed) return redirectWithoutCache(adminStatusUrl(graphPath, 'review-error'));

	const { error } = await context.supabase
		.from('relationships')
		.update({ status: parsed.data.decision, updated_at: new Date().toISOString() })
		.eq('id', parsed.data.relationshipId)
		.eq('status', current.status);

	return redirectWithoutCache(
		adminStatusUrl(graphPath, error ? 'review-error' : `relationship-${parsed.data.decision}`),
		);
};
