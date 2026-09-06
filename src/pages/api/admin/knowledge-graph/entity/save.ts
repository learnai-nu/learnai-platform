import type { APIRoute } from 'astro';
import { entityFormSchema, splitAliases } from '../../../../../lib/knowledge-graph/contracts';
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
		return redirectWithoutCache(adminStatusUrl(graphPath, 'entity-error'));
	}

	const parsed = entityFormSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return redirectWithoutCache(adminStatusUrl(graphPath, 'entity-error'));
	}

	const value = parsed.data;
	const payload = {
		entity_type: value.entityType,
		name: value.name,
		slug: value.slug,
		description: value.description || null,
		aliases: splitAliases(value.aliasesText),
		status: value.status,
		source_tag_id: value.sourceTagId || null,
		updated_at: new Date().toISOString(),
	};

	const result = value.id
		? await context.supabase.from('entities').update(payload).eq('id', value.id)
		: await context.supabase.from('entities').insert({
			...payload,
			created_by: context.claims.sub,
		});

	return redirectWithoutCache(
		adminStatusUrl(graphPath, result.error ? 'entity-error' : value.id ? 'entity-saved' : 'entity-created'),
		);
};
