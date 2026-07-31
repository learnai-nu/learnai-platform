import { describe, expect, it } from 'vitest';
import { levelTwoWaitlistSource, waitlistSchema } from '../src/lib/leads/waitlist';

describe('level two waitlist', () => {
	it('normalizes a valid signup', () => {
		const result = waitlistSchema.parse({
			email: ' Jesper@LearnAI.nu ',
			firstName: ' Jesper ',
			consent: 'yes',
			website: '',
		});

		expect(result).toEqual({
			email: 'jesper@learnai.nu',
			firstName: 'Jesper',
			consent: 'yes',
			website: '',
		});
		expect(levelTwoWaitlistSource).toBe('course-ai-i-praksis-level-2-waitlist');
	});

	it('rejects missing consent and bot-filled forms', () => {
		expect(waitlistSchema.safeParse({ email: 'test@example.com', consent: '', website: '' }).success).toBe(false);
		expect(waitlistSchema.safeParse({ email: 'test@example.com', consent: 'yes', website: 'spam' }).success).toBe(false);
	});
});
