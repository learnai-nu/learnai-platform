import type { APIRoute } from 'astro';
import { lessonFormSchema } from '../../../../../lib/admin/contracts';
import { editorTextToBody } from '../../../../../lib/admin/content';
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
	const parsed = lessonFormSchema.safeParse(Object.fromEntries(formData));
	const fallbackCourseId = formData.get('courseId');
	const target =
		typeof fallbackCourseId === 'string' ? `/admin/kurser/${fallbackCourseId}` : '/admin/kurser';
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(target, 'error'));

	const value = parsed.data;
	const { data: module } = await context.supabase
		.from('course_modules')
		.select('id')
		.eq('id', value.moduleId)
		.eq('course_id', value.courseId)
		.maybeSingle();
	if (!module) return redirectWithoutCache(adminStatusUrl(target, 'error'));

	const payload = {
		module_id: value.moduleId,
		title: value.title,
		slug: value.slug,
		description: value.description || null,
		body: editorTextToBody(value.bodyText),
		estimated_minutes: value.estimatedMinutes === '' ? null : value.estimatedMinutes,
		sort_order: value.sortOrder,
		is_preview: value.isPreview === 'true',
		updated_at: new Date().toISOString(),
	};
	const result = value.id
		? await context.supabase
			.from('lessons')
			.update(payload)
			.eq('id', value.id)
			.eq('module_id', value.moduleId)
		: await context.supabase.from('lessons').insert(payload);

	return redirectWithoutCache(
		adminStatusUrl(target, result.error ? 'error' : 'lesson-saved'),
	);
};
