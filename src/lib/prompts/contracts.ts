import { z } from 'zod';

const promptFieldSchema = z.object({
	key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	token: z.string().min(3).max(120),
	label: z.string().min(1).max(120),
	placeholder: z.string().max(240).default(''),
	input_type: z.enum(['text', 'textarea', 'select']),
	required: z.boolean().default(true),
	options: z.array(z.string().min(1).max(120)).max(12).default([]),
});

export const promptDefinitionSchema = z.object({
	version: z.literal(1),
	template: z.string().min(10).max(20_000),
	fields: z.array(promptFieldSchema).min(1).max(24),
	privacy_notice: z.string().min(1).max(500),
	tool_note: z.string().max(500).nullable().default(null),
});

export type PromptDefinition = z.infer<typeof promptDefinitionSchema>;
export type PromptField = PromptDefinition['fields'][number];
export type PromptValues = Record<string, string>;

function record(value: unknown): Record<string, unknown> | null {
	return value && typeof value === 'object' && !Array.isArray(value)
		? value as Record<string, unknown>
		: null;
}

export function parsePromptDefinition(sourceMetadata: unknown): PromptDefinition | null {
	const metadata = record(sourceMetadata);
	if (!metadata) return null;
	const parsed = promptDefinitionSchema.safeParse(metadata.prompt_definition);
	return parsed.success ? parsed.data : null;
}

export function missingRequiredFields(definition: PromptDefinition, values: PromptValues) {
	return definition.fields
		.filter((field) => field.required && !values[field.key]?.trim())
		.map((field) => field.key);
}

export function buildPrompt(
	definition: PromptDefinition,
	values: PromptValues,
) {
	return definition.fields.reduce((result, field) => {
		const replacement = values[field.key]?.trim() || field.token;
		return result.split(field.token).join(replacement);
	}, definition.template);
}
