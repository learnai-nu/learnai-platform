import { z } from 'zod';

export const waitlistSchema = z.object({
	email: z.string().trim().max(254).pipe(z.email()).transform((value) => value.toLowerCase()),
	firstName: z.string().trim().max(80).optional().transform((value) => value || null),
	consent: z.literal('yes'),
	website: z.string().max(0).optional(),
});

export const levelTwoWaitlistSource = 'course-ai-i-praksis-level-2-waitlist';
