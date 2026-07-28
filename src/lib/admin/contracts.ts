import { z } from 'zod';

const optionalUuid = z.union([z.uuid(), z.literal('')]).optional();
const slugSchema = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = (max: number) => z.string().trim().max(max).optional().default('');
const integerField = (minimum: number, maximum: number) =>
	z.coerce.number().int().min(minimum).max(maximum);

export const contentFormSchema = z.object({
	id: optionalUuid,
	title: z.string().trim().min(2).max(200),
	slug: slugSchema,
	type: z.enum(['article', 'guide', 'news', 'prompt', 'tool']),
	status: z.enum(['draft', 'review', 'published', 'archived']),
	excerpt: optionalText(600),
	bodyText: z.string().max(100_000),
	seoTitle: optionalText(200),
	seoDescription: optionalText(500),
});

export const courseFormSchema = z.object({
	id: optionalUuid,
	title: z.string().trim().min(2).max(200),
	slug: slugSchema,
	status: z.enum(['draft', 'review', 'published', 'archived']),
	level: z.enum(['beginner', 'intermediate', 'advanced']),
	description: optionalText(2_000),
	estimatedMinutes: z.union([integerField(1, 100_000), z.literal('')]),
	priceDkk: z.coerce.number().min(0).max(1_000_000),
	isFeatured: z.enum(['true', 'false']).default('false'),
});

export const moduleFormSchema = z.object({
	id: optionalUuid,
	courseId: z.uuid(),
	title: z.string().trim().min(2).max(200),
	description: optionalText(2_000),
	sortOrder: integerField(0, 10_000),
});

export const lessonFormSchema = z.object({
	id: optionalUuid,
	courseId: z.uuid(),
	moduleId: z.uuid(),
	title: z.string().trim().min(2).max(200),
	slug: slugSchema,
	description: optionalText(2_000),
	bodyText: z.string().max(100_000),
	estimatedMinutes: z.union([integerField(1, 100_000), z.literal('')]),
	sortOrder: integerField(0, 10_000),
	isPreview: z.enum(['true', 'false']).default('false'),
});

export const quizFormSchema = z.object({
	id: optionalUuid,
	lessonId: z.uuid(),
	title: z.string().trim().min(2).max(200),
	description: optionalText(2_000),
	passingScore: integerField(0, 100),
	maxAttempts: z.union([integerField(1, 1_000), z.literal('')]),
});

export const quizOptionInputSchema = z.object({
	id: optionalUuid,
	text: z.string().trim().min(1).max(500),
	isCorrect: z.boolean(),
});

export const quizQuestionFormSchema = z.object({
	id: optionalUuid,
	quizId: z.uuid(),
	type: z.enum(['single_choice', 'multiple_choice', 'true_false', 'free_text']),
	question: z.string().trim().min(2).max(2_000),
	explanation: optionalText(5_000),
	points: integerField(1, 1_000),
	sortOrder: integerField(0, 10_000),
	options: z.array(quizOptionInputSchema).max(6),
});

const adminQuizOptionSchema = z.object({
	id: z.uuid(),
	option_text: z.string(),
	sort_order: z.number().int(),
	is_correct: z.boolean(),
});

const adminQuizQuestionSchema = z.object({
	id: z.uuid(),
	type: z.enum(['single_choice', 'multiple_choice', 'true_false', 'free_text']),
	question: z.string(),
	explanation: z.string().nullable(),
	points: z.number().int(),
	sort_order: z.number().int(),
	options: z.array(adminQuizOptionSchema),
});

export const adminQuizSchema = z.object({
	id: z.uuid(),
	lesson_id: z.uuid(),
	title: z.string(),
	description: z.string().nullable(),
	passing_score: z.number().int(),
	max_attempts: z.number().int().nullable(),
	questions: z.array(adminQuizQuestionSchema),
});

export type AdminQuiz = z.infer<typeof adminQuizSchema>;
