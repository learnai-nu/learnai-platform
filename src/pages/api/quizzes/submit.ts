import type { APIRoute } from 'astro';
import {
	mapQuizRpcError,
	quizResultSchema,
	quizSubmissionSchema,
} from '../../../lib/quiz/contracts';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

function jsonResponse(body: unknown, status: number) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'private, no-store, max-age=0',
		},
	});
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
		return jsonResponse({ code: 'unsupported_media', message: 'Send quizbesvarelsen som JSON.' }, 415);
	}

	const supabase = createServerSupabaseClient(request, cookies);
	const { data: claimsData } = await supabase.auth.getClaims();
	if (!claimsData?.claims?.sub) {
		return jsonResponse({ code: 'auth_required', message: 'Log ind for at aflevere quizzen.' }, 401);
	}

	let input: unknown;
	try {
		input = await request.json();
	} catch {
		return jsonResponse({ code: 'invalid_json', message: 'Quizbesvarelsen er ikke gyldig JSON.' }, 400);
	}

	const parsed = quizSubmissionSchema.safeParse(input);
	if (!parsed.success) {
		return jsonResponse({ code: 'invalid_answers', message: 'Kontrollér dine svar og prøv igen.' }, 400);
	}

	const { data, error } = await supabase.rpc('submit_quiz', {
		p_quiz_id: parsed.data.quizId,
		p_answers: parsed.data.answers.map((answer) => ({
			question_id: answer.questionId,
			selected_option_ids: answer.selectedOptionIds,
			free_text_answer: answer.freeTextAnswer ?? null,
		})),
	});

	if (error) {
		const mapped = mapQuizRpcError(error);
		return jsonResponse(mapped, mapped.status);
	}

	const result = quizResultSchema.safeParse(data);
	if (!result.success) {
		return jsonResponse({ code: 'invalid_result', message: 'Quizresultatet kunne ikke læses.' }, 502);
	}

	return jsonResponse(result.data, 200);
};
