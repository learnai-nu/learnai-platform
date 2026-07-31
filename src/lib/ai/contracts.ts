import { z } from 'zod';

export const mentorRequestSchema = z.object({
	question: z.string().trim().min(3).max(1200),
});

export const mentorSourceSchema = z.object({
	title: z.string(),
	type: z.string(),
	url: z.string().startsWith('/laer/'),
});

export const mentorResponseSchema = z.object({
	answer: z.string().min(1),
	sources: z.array(mentorSourceSchema).max(8),
	remaining: z.number().int().min(0).max(19),
});

export const learningProfileSchema = z.object({
	displayName: z.string().trim().max(120),
	jobTitle: z.string().trim().max(120),
	company: z.string().trim().max(120),
	industry: z.string().trim().max(120),
	experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
	learningGoals: z.array(z.string().trim().min(1).max(160)).max(20),
	interests: z.array(z.string().trim().min(1).max(80)).max(20),
	preferredAiTools: z.array(z.string().trim().min(1).max(80)).max(20),
});

export type MentorResponse = z.infer<typeof mentorResponseSchema>;
export type LearningProfileInput = z.infer<typeof learningProfileSchema>;

export function splitProfileList(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') return [];
	return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}
