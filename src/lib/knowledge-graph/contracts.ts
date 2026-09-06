import { z } from 'zod';

export const entityTypes = [
	'tool',
	'topic',
	'concept',
	'audience',
	'use_case',
	'industry',
	'skill',
] as const;

export const relationshipTypes = [
	'about',
	'mentions',
	'uses',
	'demonstrates',
	'targets',
	'prerequisite_for',
	'related_to',
	'updates',
	'derived_from',
	'part_of',
] as const;

export const relationshipDecisions = ['approved', 'rejected', 'archived'] as const;

const optionalUuid = z.union([z.uuid(), z.literal('')]).optional();
const slugSchema = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const entityFormSchema = z.object({
	id: optionalUuid,
	entityType: z.enum(entityTypes),
	name: z.string().trim().min(2).max(160),
	slug: slugSchema,
	description: z.string().trim().max(2_000).optional().default(''),
	aliasesText: z.string().max(4_000).optional().default(''),
	status: z.enum(['draft', 'review', 'published', 'archived']),
	sourceTagId: optionalUuid,
});

export const suggestionRequestSchema = z.object({
	sourceNodeId: z.uuid(),
});

export const relationshipReviewSchema = z.object({
	relationshipId: z.uuid(),
	decision: z.enum(relationshipDecisions),
});

export const aiRelationshipSuggestionSchema = z.object({
	target_node_id: z.uuid(),
	relation_type: z.enum(relationshipTypes),
	confidence: z.number().min(0).max(1),
	rationale: z.string().trim().min(1).max(500),
	evidence: z.string().trim().min(1).max(500),
});

export const aiRelationshipSuggestionsSchema = z.object({
	suggestions: z.array(aiRelationshipSuggestionSchema).max(12),
});

export function splitAliases(value: string) {
	return [...new Set(value
		.split(/[\n,]/)
		.map((alias) => alias.trim())
		.filter((alias) => alias.length > 0 && alias.length <= 160))]
		.slice(0, 20);
}

export function normalizeRelationshipEndpoints(
	sourceNodeId: string,
	targetNodeId: string,
	relationType: string,
) {
	if (relationType === 'related_to' && targetNodeId < sourceNodeId) {
		return { sourceNodeId: targetNodeId, targetNodeId: sourceNodeId };
	}
	return { sourceNodeId, targetNodeId };
}
