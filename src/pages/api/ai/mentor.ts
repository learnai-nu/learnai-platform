import type { APIRoute } from 'astro';
import { mentorRequestSchema } from '../../../lib/ai/contracts';
import {
	buildMentorContext,
	buildMentorInstructions,
	extractFileCitations,
	extractResponseText,
	safetyIdentifier,
	sourceUrl,
	type LearningSource,
} from '../../../lib/ai/mentor';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { hasSameOrigin } from '../../../lib/admin/security';
import { renderMarkdown } from '../../../lib/content/markdown';

export const prerender = false;

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'private, no-store, max-age=0',
			'X-Content-Type-Options': 'nosniff',
		},
	});
}

function quotaError(error: { message?: string } | null) {
	if (error?.message?.includes('AI_DAILY_LIMIT_REACHED')) {
		return json({ code: 'daily_limit', message: 'Du har brugt dagens 20 mentor-spørgsmål.' }, 429);
	}
	return json({ code: 'quota_error', message: 'Din adgang kunne ikke kontrolleres.' }, 503);
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) {
		return json({ code: 'invalid_origin', message: 'Ugyldig forespørgsel.' }, 403);
	}
	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return json({ code: 'invalid_content_type', message: 'Ugyldig forespørgsel.' }, 415);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ code: 'invalid_json', message: 'Ugyldig forespørgsel.' }, 400);
	}
	const parsed = mentorRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return json({ code: 'invalid_question', message: 'Skriv et spørgsmål på 3-1.200 tegn.' }, 400);
	}

	const apiKey = import.meta.env.OPENAI_API_KEY;
	const vectorStoreId = import.meta.env.OPENAI_VECTOR_STORE_ID?.trim();
	if (!apiKey) {
		return json({ code: 'not_configured', message: 'AI Mentor er ikke aktiveret endnu.' }, 503);
	}

	const supabase = createServerSupabaseClient(request, cookies);
	const { data: claimsData } = await supabase.auth.getClaims();
	const userId = claimsData?.claims?.sub;
	if (!userId) return json({ code: 'auth_required', message: 'Log ind for at bruge AI Mentor.' }, 401);

	const [profileResult, searchResult] = await Promise.all([
		supabase
			.from('profiles')
			.select('job_title,industry,experience_level,learning_goals,interests,preferred_ai_tools')
			.eq('id', userId)
			.maybeSingle(),
		supabase.rpc('search_published_learning_content', {
			p_query: parsed.data.question,
			p_limit: 4,
		}),
	]);

	let sources = (searchResult.data ?? []) as LearningSource[];
	if (searchResult.error) {
		return json({ code: 'retrieval_error', message: 'LearnAI-kilderne kunne ikke hentes.' }, 503);
	}
	if (sources.length === 0) {
		const fallback = await supabase
			.from('content_items')
			.select('title,slug,type,excerpt,body')
			.eq('status', 'published')
			.eq('locale', 'da')
			.in('type', ['guide', 'article', 'prompt'])
			.order('updated_at', { ascending: false })
			.limit(4);
		if (fallback.error) {
			return json({ code: 'retrieval_error', message: 'LearnAI-kilderne kunne ikke hentes.' }, 503);
		}
		sources = (fallback.data ?? []) as LearningSource[];
	}
	if (sources.length === 0 && !vectorStoreId) {
		return json({ code: 'no_sources', message: 'Der er endnu ikke nok godkendt indhold til at svare.' }, 422);
	}

	const { data: remaining, error: quotaFailure } = await supabase.rpc('consume_ai_mentor_quota');
	if (quotaFailure || typeof remaining !== 'number') return quotaError(quotaFailure);

	const rawProfile = profileResult.data;
	const profile = rawProfile ? {
		jobTitle: rawProfile.job_title ?? '',
		industry: rawProfile.industry ?? '',
		experienceLevel: rawProfile.experience_level,
		learningGoals: rawProfile.learning_goals ?? [],
		interests: rawProfile.interests ?? [],
		preferredAiTools: rawProfile.preferred_ai_tools ?? [],
	} : {};

	const responseBody: Record<string, unknown> = {
		model: import.meta.env.OPENAI_MODEL || 'gpt-5.6-sol',
		store: false,
		safety_identifier: await safetyIdentifier(userId),
		instructions: buildMentorInstructions(profile, Boolean(vectorStoreId)),
		input: `Brugerens spørgsmål:\n${parsed.data.question}\n\nGodkendt LearnAI-kontekst:\n${sources.length > 0 ? buildMentorContext(sources) : 'Ingen relevante interne indholdskilder fundet.'}`,
		reasoning: { effort: 'low' },
		text: { verbosity: 'low' },
		max_output_tokens: 900,
	};
	if (vectorStoreId) {
		responseBody.tools = [{
			type: 'file_search',
			vector_store_ids: [vectorStoreId],
			max_num_results: 8,
		}];
		responseBody.include = ['file_search_call.results'];
	}

	let openAIResponse: Response;
	try {
		openAIResponse = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(responseBody),
			signal: AbortSignal.timeout(30_000),
		});
	} catch {
		return json({ code: 'provider_unavailable', message: 'AI Mentor svarer ikke lige nu. Prøv igen om lidt.' }, 503);
	}

	if (!openAIResponse.ok) {
		let providerDetails: Record<string, unknown> = { status: openAIResponse.status };
		try {
			const providerPayload = await openAIResponse.json() as {
				error?: { code?: unknown; type?: unknown; param?: unknown };
			};
			providerDetails = {
				...providerDetails,
				code: providerPayload.error?.code,
				type: providerPayload.error?.type,
				param: providerPayload.error?.param,
			};
		} catch {
			// Keep diagnostics intentionally limited when the provider returns non-JSON.
		}
		console.error('AI Mentor provider request failed', providerDetails);
		return json({ code: 'provider_error', message: 'AI Mentor kunne ikke danne et svar lige nu.' }, 503);
	}
	const openAIPayload: unknown = await openAIResponse.json();
	const answer = extractResponseText(openAIPayload);
	if (!answer) return json({ code: 'empty_response', message: 'AI Mentor returnerede ikke et brugbart svar.' }, 503);
	const documentSources = extractFileCitations(openAIPayload).map((filename) => ({
		title: filename,
		type: 'videnskilde',
	}));
	const responseSources = [
		...sources.map((source) => ({
			title: source.title,
			type: source.type,
			url: sourceUrl(source.slug),
		})),
		...documentSources,
	].slice(0, 8);

	return json({
		answer,
		answerHtml: renderMarkdown(answer),
		sources: responseSources,
		remaining,
	});
};
