import type { APIRoute } from 'astro';
import { quizQuestionFormSchema } from '../../../../../lib/admin/contracts';
import {
	adminStatusUrl,
	hasSameOrigin,
	redirectWithoutCache,
} from '../../../../../lib/admin/security';
import { getAdminContext } from '../../../../../lib/auth/admin';

function optionsFromForm(formData: FormData) {
	return Array.from({ length: 6 }, (_, index) => {
		const id = formData.get(`option${index}Id`);
		const text = formData.get(`option${index}Text`);
		return {
			id: typeof id === 'string' ? id : '',
			text: typeof text === 'string' ? text : '',
			isCorrect: formData.get(`option${index}Correct`) === 'true',
		};
	}).filter((option) => option.id || option.text.trim());
}

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
	const raw = {
		...Object.fromEntries(formData),
		options: optionsFromForm(formData),
	};
	const parsed = quizQuestionFormSchema.safeParse(raw);
	const quizId = formData.get('quizId');
	const target = typeof quizId === 'string' ? `/admin/quizzer/${quizId}` : '/admin/quizzer';
	if (!parsed.success) return redirectWithoutCache(adminStatusUrl(target, 'error'));

	const value = parsed.data;
	const { error } = await context.supabase.rpc('admin_upsert_quiz_question', {
		p_quiz_id: value.quizId,
		p_question_id: value.id || null,
		p_type: value.type,
		p_question: value.question,
		p_explanation: value.explanation || null,
		p_points: value.points,
		p_sort_order: value.sortOrder,
		p_options: value.options.map((option, index) => ({
			id: option.id || null,
			text: option.text,
			is_correct: option.isCorrect,
			sort_order: index,
		})),
	});

	return redirectWithoutCache(
		adminStatusUrl(target, error ? 'error' : 'question-saved'),
	);
};
