import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	businessLeadIdempotencyKey,
	createBusinessLeadNotification,
	sendBusinessLeadNotification,
} from '../src/lib/email/business-lead-notification';
import { businessLeadSchema } from '../src/lib/leads/business';

const lead = businessLeadSchema.parse({
	name: 'Mette <Larsen>',
	email: 'mette@example.dk',
	company: 'Eksempel & Søn A/S',
	roleTitle: 'HR-chef',
	companySize: '50-249',
	goal: 'Vi vil bruge <AI> sikkert.',
	consent: 'yes',
	website: '',
});

describe('business lead notifications', () => {
	it('renders useful text and escaped HTML', () => {
		const message = createBusinessLeadNotification(lead, 'https://learnai.nu');
		expect(message.subject).toBe('Ny virksomhedshenvendelse på LearnAI.nu');
		expect(message.text).toContain('mette@example.dk');
		expect(message.text).toContain('https://learnai.nu/admin/leads');
		expect(message.html).toContain('Mette &lt;Larsen&gt;');
		expect(message.html).toContain('Eksempel &amp; Søn A/S');
		expect(message.html).not.toContain('Vi vil bruge <AI> sikkert.');
	});

	it('creates a stable, non-PII idempotency key', async () => {
		const first = await businessLeadIdempotencyKey(lead);
		const second = await businessLeadIdempotencyKey(lead);
		expect(first).toBe(second);
		expect(first).toMatch(/^business-lead\/[a-f0-9]{64}$/);
		expect(first).not.toContain(lead.email);
	});

	it('skips delivery cleanly until all server variables are configured', async () => {
		await expect(sendBusinessLeadNotification(lead, {})).resolves.toBe('skipped');
	});

	it('keeps a saved lead successful when notification delivery fails', () => {
		const route = readFileSync('src/pages/api/leads/virksomheder.ts', 'utf8');
		expect(route).toContain('await sendBusinessLeadNotification(parsed.data)');
		expect(route).toMatch(/catch \{[\s\S]*redirectWithoutCache\(`\$\{page\}\?status=success/);
		expect(route).not.toContain('console.error(error)');
	});
});
