import { describe, expect, it } from 'vitest';
import { weeklyBriefSchema, weeklyBriefSource } from '../src/lib/leads/weekly-brief';

describe('weekly brief signup', () => {
	it('normalizes a valid signup and keeps a distinct source', () => {
		const result = weeklyBriefSchema.parse({
			email: ' Lytter@Example.dk ',
			firstName: ' Anna ',
			consent: 'yes',
			website: '',
		});

		expect(result).toEqual({
			email: 'lytter@example.dk',
			firstName: 'Anna',
			consent: 'yes',
			website: '',
		});
		expect(weeklyBriefSource).toBe('learnai-weekly-brief-podcast');
	});

	it('rejects invalid e-mail, missing consent and bot-filled forms', () => {
		expect(weeklyBriefSchema.safeParse({ email: 'ikke-en-mail', consent: 'yes', website: '' }).success).toBe(false);
		expect(weeklyBriefSchema.safeParse({ email: 'test@example.dk', consent: '', website: '' }).success).toBe(false);
		expect(weeklyBriefSchema.safeParse({ email: 'test@example.dk', consent: 'yes', website: 'spam' }).success).toBe(false);
	});
});
