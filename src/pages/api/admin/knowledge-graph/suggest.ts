import type { APIRoute } from 'astro';
import { adminStatusUrl, hasSameOrigin, redirectWithoutCache } from '../../../../lib/admin/security';
import { getAdminContext } from '../../../../lib/auth/admin';
import { extractResponseText, safetyIdentifier } from '../../../../lib/ai/mentor';
import {
	aiRelationshipSuggestionsSchema,
	normalizeRelationshipEndpoints,
	suggestionRequestSchema,
} from '../../../../lib/knowledge-graph/contracts';
import {
	buildKnowledgeGraphSuggestionInput,
	buildKnowledgeGraphSuggestionInstructions,
	knowledgeGraphResponseFormat,
	type SuggestionCandidate,
	type SuggestionSource,
} from '../../../../lib/knowledge-graph/suggestions';

const graphPath = '/admin/vidensgraf';

function redirectStatus(status: string) {
	return redirectWithoutCache(adminStatusUrl(graphPath, status));
}

async function loadSource(
	supabase: ReturnType<typeof import('../../../../lib/supabase/server').createServerSupabaseClient>,
	node: { content_item_id: string | null; course_id: string | null; lesson_id: string | null },
): Promise<SuggestionSource | null> {
	if (node.content_item_id) {
		const { data } = await supabase.from('content_items')
			.select('title,type,excerpt,body')
			.eq('id', node.content_item_id)
			.maybeSingle();
		return data ? { title: data.title, type: 'content', description: `${data.type}: ${data.excerpt ?? ''}`, body: data.body } : null;
	}
	if (node.course_id) {
		const { data } = await supabase.from('courses')
			.select('title,description,level')
			.eq('id', node.course_id)
			.maybeSingle();
		return data ? { title: data.title, type: 'course', description: `${data.level}: ${data.description ?? ''}` } : null;
	}
	if (node.lesson_id) {
		const { data } = await supabase.from('lessons')
			.select('title,description,body')
			.eq('id', node.lesson_id)
			.maybeSingle();
		return data ? { title: data.title, type: 'lesson', description: data.description, body: data.body } : null;
	}
	return null;
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });
	const context = await getAdminContext(request, cookies);
	if (!context.claims) return redirectWithoutCache('/login?status=required');
	if (!context.role) return new Response('Ingen adgang.', { status: 403 });
	const userId = context.claims.sub;

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return redirectStatus('suggestion-error');
	}
	const parsed = suggestionRequestSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return redirectStatus('suggestion-error');

	const apiKey = import.meta.env.OPENAI_API_KEY;
	if (!apiKey) return redirectStatus('suggestion-not-configured');

	const [nodeResult, candidateResult] = await Promise.all([
		context.supabase.from('knowledge_nodes')
			.select('id,content_item_id,course_id,lesson_id,entity_id')
			.eq('id', parsed.data.sourceNodeId)
			.maybeSingle(),
		context.supabase.from('knowledge_nodes')
			.select('id,entities!inner(id,entity_type,name,description,aliases,status)')
			.not('entity_id', 'is', null)
			.eq('entities.status', 'published')
			.limit(200),
	]);
	if (nodeResult.error || !nodeResult.data || nodeResult.data.entity_id) return redirectStatus('suggestion-error');
	if (candidateResult.error) return redirectStatus('suggestion-error');
	const sourceNode = nodeResult.data;

	const source = await loadSource(context.supabase, sourceNode);
	if (!source) return redirectStatus('suggestion-error');

	const candidates: SuggestionCandidate[] = (candidateResult.data ?? []).flatMap((node) => {
		const entity = Array.isArray(node.entities) ? node.entities[0] : node.entities;
		return entity ? [{
			nodeId: node.id,
			entityType: entity.entity_type,
			name: entity.name,
			description: entity.description,
			aliases: entity.aliases ?? [],
		}] : [];
	});
	if (candidates.length === 0) return redirectStatus('suggestion-no-entities');

	let providerResponse: Response;
	try {
		providerResponse = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: import.meta.env.OPENAI_MODEL || 'gpt-5.6-sol',
				store: false,
				safety_identifier: await safetyIdentifier(userId),
				instructions: buildKnowledgeGraphSuggestionInstructions(),
				input: buildKnowledgeGraphSuggestionInput(source, candidates),
				reasoning: { effort: 'low' },
				text: { format: knowledgeGraphResponseFormat },
				max_output_tokens: 1_500,
			}),
			signal: AbortSignal.timeout(30_000),
		});
	} catch {
		return redirectStatus('suggestion-provider-error');
	}
	if (!providerResponse.ok) {
		console.error('Knowledge Graph suggestion failed', { status: providerResponse.status });
		return redirectStatus('suggestion-provider-error');
	}

	const responsePayload: unknown = await providerResponse.json();
	const responseText = extractResponseText(responsePayload);
	if (!responseText) return redirectStatus('suggestion-provider-error');

	let rawSuggestions: unknown;
	try {
		rawSuggestions = JSON.parse(responseText);
	} catch {
		return redirectStatus('suggestion-provider-error');
	}
	const suggestions = aiRelationshipSuggestionsSchema.safeParse(rawSuggestions);
	if (!suggestions.success) return redirectStatus('suggestion-provider-error');

	const allowedTargets = new Set(candidates.map((candidate) => candidate.nodeId));
	const unique = new Map<string, (typeof suggestions.data.suggestions)[number]>();
	for (const suggestion of suggestions.data.suggestions) {
		if (!allowedTargets.has(suggestion.target_node_id)) continue;
		if (suggestion.target_node_id === sourceNode.id) continue;
		const key = `${suggestion.target_node_id}:${suggestion.relation_type}`;
		if (!unique.has(key)) unique.set(key, suggestion);
	}
	if (unique.size === 0) return redirectStatus('suggestion-empty');

	const rows = [...unique.values()].map((suggestion) => {
		const endpoints = normalizeRelationshipEndpoints(
			sourceNode.id,
			suggestion.target_node_id,
			suggestion.relation_type,
		);
		return {
			source_node_id: endpoints.sourceNodeId,
			target_node_id: endpoints.targetNodeId,
			relation_type: suggestion.relation_type,
			status: 'proposed',
			origin: 'ai',
			confidence: suggestion.confidence,
			rationale: suggestion.rationale,
			evidence: { excerpt: suggestion.evidence },
			created_by: userId,
		};
	});

	const { error } = await context.supabase.from('relationships').upsert(rows, {
		onConflict: 'source_node_id,target_node_id,relation_type',
		ignoreDuplicates: true,
	});
	return redirectStatus(error ? 'suggestion-error' : 'suggestions-created');
};
