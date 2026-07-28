import { describe, expect, it } from 'vitest';
import { matchesAdminContentFilters } from '../src/lib/admin/filter';

const prompt = {
	title: 'Skriv et LinkedIn-opslag',
	type: 'prompt',
	status: 'review',
};

describe('admin content filters', () => {
	it('matches a case-insensitive Danish title query', () => {
		expect(matchesAdminContentFilters(prompt, {
			query: 'linkedin',
			type: '',
			status: '',
		})).toBe(true);
	});

	it('combines title, type and status filters', () => {
		expect(matchesAdminContentFilters(prompt, {
			query: 'opslag',
			type: 'prompt',
			status: 'review',
		})).toBe(true);
		expect(matchesAdminContentFilters(prompt, {
			query: 'opslag',
			type: 'guide',
			status: 'review',
		})).toBe(false);
	});

	it('matches all items when filters are empty', () => {
		expect(matchesAdminContentFilters(prompt, {
			query: '',
			type: '',
			status: '',
		})).toBe(true);
	});
});
