import type { APIRoute } from 'astro';
import { contentFormSchema } from '../../../../lib/admin/contracts';
import { editorTextToBody } from '../../../../lib/admin/content';
import {
	adminStatusUrl,
	hasSameOrigin,
	redirectWithoutCache,
} from '../../../../lib/admin/security';
import { getAdminContext } from '../../../../lib/auth/admin';

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const context = await getAdminContext(request, cookies);
	if (!context.claims) return redirectWithoutCache('/login?status=required');
	if (!context.role) return new Response('Ingen adgang.', { status: 403 });

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return redirectWithoutCache(adminStatusUrl('/admin/indhold', 'error'));
	}

	const parsed = contentFormSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		const fallbackId = formData.get('id');
		const target =
			typeof fallbackId === 'string' && fallbackId
				? `/admin/indhold/${fallbackId}`
				: '/admin/indhold/ny';
		return redirectWithoutCache(adminStatusUrl(target, 'error'));
	}

	const value = parsed.data;
	const payload = {
		title: value.title,
		slug: value.slug,
		type: value.type,
		status: value.status,
		excerpt: value.excerpt || null,
		body: editorTextToBody(value.bodyText),
		seo_title: value.seoTitle || null,
		seo_description: value.seoDescription || null,
		updated_at: new Date().toISOString(),
	};

	if (value.id) {
		const { data: current } = await context.supabase
			.from('content_items')
			.select('status,published_at')
			.eq('id', value.id)
			.maybeSingle();
		const publishedAt =
			value.status === 'published'
				? current?.published_at ?? new Date().toISOString()
				: current?.published_at ?? null;
		const { error } = await context.supabase
			.from('content_items')
			.update({ ...payload, published_at: publishedAt })
			.eq('id', value.id);
		if (error) return redirectWithoutCache(adminStatusUrl(`/admin/indhold/${value.id}`, 'error'));
		return redirectWithoutCache(adminStatusUrl('/admin/indhold', 'saved'));
	}

	const { data, error } = await context.supabase
		.from('content_items')
		.insert({
			...payload,
			status: 'draft',
			author_id: context.claims.sub,
			published_at: null,
		})
		.select('id')
		.single();

	if (error || !data) return redirectWithoutCache(adminStatusUrl('/admin/indhold/ny', 'error'));
	return redirectWithoutCache(adminStatusUrl(`/admin/indhold/${data.id}`, 'created'));
};
