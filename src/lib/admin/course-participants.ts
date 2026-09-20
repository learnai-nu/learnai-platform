import { z } from 'zod';

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
export const participantStatusLabels = {
	all: 'Alle deltagere', enrolled: 'Tilmeldte', not_started: 'Ikke startet',
	in_progress: 'I gang', completed: 'Fuldført', converted: 'Tilmeldte, der har fuldført',
	unregistered: 'Uden registreret tilmelding',
} as const;
export type ParticipantFilter = keyof typeof participantStatusLabels;

const filterSchema = z.object({
	course: z.union([uuid, z.literal('')]).default(''),
	status: z.enum(['all', 'enrolled', 'not_started', 'in_progress', 'completed', 'converted', 'unregistered']).default('all'),
	q: z.string().trim().max(100).default(''),
	page: z.coerce.number().int().min(1).max(100000).default(1),
});

export function parseParticipantFilters(params: URLSearchParams) {
	return filterSchema.safeParse(Object.fromEntries(params));
}

export function participantHref(course = '', status: ParticipantFilter = 'all', q = '', page = 1) {
	const params = new URLSearchParams();
	if (course) params.set('course', course);
	if (status !== 'all') params.set('status', status);
	if (q) params.set('q', q);
	if (page > 1) params.set('page', String(page));
	return `/admin/deltagere${params.size ? `?${params}` : ''}`;
}

export const courseParticipantsSchema = z.object({
	total: z.number().int().nonnegative(), pageSize: z.literal(50),
	items: z.array(z.object({
		userId: uuid, courseId: uuid, courseTitle: z.string(),
		name: z.string().nullable(), email: z.string().nullable(),
		enrolledAt: z.string().nullable(), lastActivity: z.string().nullable(), enrolled: z.boolean(),
		status: z.enum(['not_started', 'in_progress', 'completed']),
		lessonCount: z.number().int().nonnegative(), completedCount: z.number().int().nonnegative(),
		lessons: z.array(z.object({ id: uuid, title: z.string(), moduleTitle: z.string(), completed: z.boolean(), started: z.boolean() })),
	})),
});

export function participantProgress(completed: number, total: number) {
	// A rounded 100% must never imply completion while a lesson is outstanding.
	if (total === 0) return 0;
	return completed === total ? 100 : Math.min(99, Math.round(completed / total * 100));
}
