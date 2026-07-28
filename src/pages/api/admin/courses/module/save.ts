import type { APIRoute } from 'astro';
import { moduleFormSchema } from '../../../../../lib/admin/contracts';
import {
	adminStatusUrl,
	hasSameOrigin,
	redirectWithoutCache,
} from '../../../../../lib/admin/security';
import { getAdminContext } from '../../../../../lib/auth/admin';

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
	const parsed = moduleFormSchema.safeParse(Object.fromEntries(formData));
	const courseId = formData.get('courseId');
	const target = typeof courseId === 'string' ? `/admin/kurser/${courseId}` : '/admin/kurser';
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(target, 'error'));

	const value = parsed.data;
	const payload = {
		course_id: value.courseId,
		title: value.title,
		description: value.description || null,
		sort_order: value.sortOrder,
		updated_at: new Date().toISOString(),
	};
	const result = value.id
		? await context.supabase
			.from('course_modules')
			.update(payload)
			.eq('id', value.id)
			.eq('course_id', value.courseId)
		: await context.supabase.from('course_modules').insert(payload);

	return redirectWithoutCache(
		adminStatusUrl(`/admin/kurser/${value.courseId}`, result.error ? 'error' : 'module-saved'),
	);
};
