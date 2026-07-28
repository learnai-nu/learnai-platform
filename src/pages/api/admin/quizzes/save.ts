import type { APIRoute } from 'astro';
import { quizFormSchema } from '../../../../lib/admin/contracts';
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
		return redirectWithoutCache(adminStatusUrl('/admin/quizzer', 'error'));
	}
	const parsed = quizFormSchema.safeParse(Object.fromEntries(formData));
	const fallbackId = formData.get('id');
	const target =
		typeof fallbackId === 'string' && fallbackId
			? `/admin/quizzer/${fallbackId}`
			: '/admin/quizzer';
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(target, 'error'));

	const value = parsed.data;
	const payload = {
		lesson_id: value.lessonId,
		title: value.title,
		description: value.description || null,
		passing_score: value.passingScore,
		max_attempts: value.maxAttempts === '' ? null : value.maxAttempts,
		updated_at: new Date().toISOString(),
	};

	if (value.id) {
		const { error } = await context.supabase
			.from('quizzes')
			.update(payload)
			.eq('id', value.id)
			.eq('lesson_id', value.lessonId);
		return redirectWithoutCache(
			adminStatusUrl(`/admin/quizzer/${value.id}`, error ? 'error' : 'saved'),
		);
	}

	const { data, error } = await context.supabase
		.from('quizzes')
		.insert(payload)
		.select('id')
		.single();
	if (error || !data) return redirectWithoutCache(adminStatusUrl('/admin/quizzer', 'error'));
	return redirectWithoutCache(adminStatusUrl(`/admin/quizzer/${data.id}`, 'created'));
};
