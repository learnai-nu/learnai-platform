import { describe, expect, it } from 'vitest';
import {
	createConfirmationMessage,
	createOpaqueToken,
	sha256,
} from '../src/lib/email/weekly-brief';
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

	it('creates an opaque confirmation token and stores only its digest', async () => {
		const token = createOpaqueToken();
		expect(token).toMatch(/^[a-f0-9]{64}$/);
		const digest = await sha256(token);
		expect(digest).toMatch(/^[a-f0-9]{64}$/);
		expect(digest).not.toBe(token);
	});

	it('renders a branded confirmation without trusting the first name as HTML', () => {
		const token = 'a'.repeat(64);
		const message = createConfirmationMessage(token, '<script>alert(1)</script>', 'https://learnai.nu');
		expect(message.subject).toBe('Bekræft dit LearnAI-ugebrief');
		expect(message.text).toContain(`/ugebrief/bekraeft?token=${token}`);
		expect(message.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(message.html).not.toContain('<script>alert(1)</script>');
	});
});
