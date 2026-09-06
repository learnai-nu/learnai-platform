import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
	businessLeadSchema,
	companySizes,
	leadStatusSchema,
	leadStatuses,
	toBusinessLeadRow,
} from '../src/lib/leads/business';

const valid = {
	name: 'Mette Larsen',
	email: '  Mette@Example.DK ',
	company: 'Eksempel A/S',
	roleTitle: 'HR-chef',
	companySize: '50-249',
	goal: 'Vi har Copilot, men kun få bruger det.',
	consent: 'yes',
	website: '',
};

describe('business lead contract', () => {
	it('normalises a complete submission', () => {
		const parsed = businessLeadSchema.parse(valid);
		expect(toBusinessLeadRow(parsed)).toEqual({
			name: 'Mette Larsen',
			work_email: 'mette@example.dk',
			company: 'Eksempel A/S',
			role_title: 'HR-chef',
			company_size: '50-249',
			goal: 'Vi har Copilot, men kun få bruger det.',
			source: 'virksomheder',
		});
	});

	it('accepts a submission without the optional fields', () => {
		const parsed = businessLeadSchema.parse({
			name: valid.name,
			email: valid.email,
			company: valid.company,
			consent: 'yes',
		});
		expect(toBusinessLeadRow(parsed)).toMatchObject({ role_title: null, company_size: null, goal: '' });
	});

	it('requires consent', () => {
		expect(businessLeadSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false);
	});

	it('rejects a filled honeypot', () => {
		expect(businessLeadSchema.safeParse({ ...valid, website: 'https://spam.example' }).success).toBe(false);
	});

	it('rejects an invalid e-mail', () => {
		expect(businessLeadSchema.safeParse({ ...valid, email: 'ikke-en-mail' }).success).toBe(false);
	});

	it('drops an unknown company size instead of failing the submission', () => {
		const parsed = businessLeadSchema.parse({ ...valid, companySize: '9000+' });
		expect(parsed.companySize).toBeNull();
	});

	it('only accepts the known statuses', () => {
		expect(leadStatusSchema.safeParse({ id: crypto.randomUUID(), status: 'contacted' }).success).toBe(true);
		expect(leadStatusSchema.safeParse({ id: crypto.randomUUID(), status: 'slettet' }).success).toBe(false);
		expect(leadStatusSchema.safeParse({ id: 'ikke-et-uuid', status: 'new' }).success).toBe(false);
	});
});

describe('database contract', () => {
	const migration = readFileSync('supabase/migrations/20260906090000_business_leads.sql', 'utf8');

	it('keeps the enums and the form in sync', () => {
		for (const size of companySizes) expect(migration).toContain(`'${size}'`);
		for (const status of leadStatuses) expect(migration).toContain(`'${status}'`);
	});

	it('keeps RLS as the authorisation boundary', () => {
		expect(migration).toContain('alter table public.business_leads enable row level security');
		expect(migration).toContain('force row level security');
	});

	it('lets the public insert but never read', () => {
		expect(migration).toContain('grant insert (name, work_email, company, role_title, company_size, goal, source)');
		expect(migration).toMatch(/business_leads_admin_read[\s\S]*private\.is_admin\(\)/);
		expect(migration).not.toMatch(/grant select[^\n]*to anon/);
	});

	it('reserves lead access for administrators, not editors', () => {
		expect(migration).toContain("= 'admin'");
		expect(migration).not.toContain('is_content_manager');
	});
});

describe('page wiring', () => {
	const page = readFileSync('src/pages/virksomheder.astro', 'utf8');

	it('posts the form to the lead endpoint', () => {
		expect(page).toContain('action="/api/leads/virksomheder"');
		expect(page).toContain('method="post"');
	});

	it('carries a honeypot and a consent checkbox', () => {
		expect(page).toContain('name="website"');
		expect(page).toContain('name="consent"');
	});

	it('offers a low-commitment path next to the primary call to action', () => {
		expect(page).toContain('href="#kontakt"');
		expect(page).toContain('/kurser/ai-i-praksis');
	});

	it('no longer renders from the generic slug page', () => {
		expect(readFileSync('src/pages/[slug].astro', 'utf8')).not.toContain('virksomheder: {');
	});
});
