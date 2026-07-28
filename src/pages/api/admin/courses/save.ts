import type { APIRoute } from 'astro';
import { courseFormSchema } from '../../../../lib/admin/contracts';
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
		return redirectWithoutCache(adminStatusUrl('/admin/kurser', 'error'));
	}
	const parsed = courseFormSchema.safeParse(Object.fromEntries(formData));
	const fallbackId = formData.get('id');
	const fallback = typeof fallbackId === 'string' && fallbackId ? `/admin/kurser/${fallbackId}` : '/admin/kurser/ny';
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(fallback, 'error'));

	const value = parsed.data;
	const payload = {
		title: value.title,
		slug: value.slug,
		status: value.status,
		level: value.level,
		description: value.description || null,
		estimated_minutes: value.estimatedMinutes === '' ? null : value.estimatedMinutes,
		price_dkk: value.priceDkk,
		is_featured: value.isFeatured === 'true',
		updated_at: new Date().toISOString(),
	};

	if (value.id) {
		const { data: current } = await context.supabase
			.from('courses')
			.select('status,published_at')
			.eq('id', value.id)
			.maybeSingle();
		const publishedAt =
			value.status === 'published'
				? current?.published_at ?? new Date().toISOString()
				: current?.published_at ?? null;
		const { error } = await context.supabase
			.from('courses')
			.update({ ...payload, published_at: publishedAt })
			.eq('id', value.id);
		if (error) return redirectWithoutCache(adminStatusUrl(`/admin/kurser/${value.id}`, 'error'));
		return redirectWithoutCache(adminStatusUrl(`/admin/kurser/${value.id}`, 'saved'));
	}

	const { data, error } = await context.supabase
		.from('courses')
		.insert({ ...payload, status: 'draft', published_at: null })
		.select('id')
		.single();
	if (error || !data) return redirectWithoutCache(adminStatusUrl('/admin/kurser/ny', 'error'));
	return redirectWithoutCache(adminStatusUrl(`/admin/kurser/${data.id}`, 'created'));
};
