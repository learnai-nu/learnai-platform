import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	buildFacet,
	complexityLabels,
	departmentLabels,
	fetchResources,
	fetchTools,
	fetchUseCases,
	label,
	resourceTypeLabels,
	searchIndex,
	toolCategoryLabels,
} from '../src/lib/catalog';

const migration = readFileSync(
	new URL('../supabase/migrations/20260904090000_catalog_from_lovable.sql', import.meta.url),
	'utf8',
);
const toolsPage = readFileSync(new URL('../src/pages/tools.astro', import.meta.url), 'utf8');
const useCasesPage = readFileSync(new URL('../src/pages/use-cases.astro', import.meta.url), 'utf8');
const resourcesPage = readFileSync(new URL('../src/pages/resources.astro', import.meta.url), 'utf8');
const filterScript = readFileSync(new URL('../src/scripts/catalog-filter.ts', import.meta.url), 'utf8');

/** Minimal stand-in for the PostgREST query builder the catalogue helpers use. */
function fakeSupabase(rows: unknown[], error: unknown = null) {
	const calls: Record<string, unknown> = {};
	const builder = {
		select(columns: string) {
			calls.columns = columns;
			return builder;
		},
		eq(column: string, value: unknown) {
			calls[column] = value;
			return builder;
		},
		order(column: string, options: unknown) {
			calls.order = [column, options];
			return Promise.resolve({ data: rows, error });
		},
	};
	return {
		calls,
		client: {
			from(table: string) {
				calls.table = table;
				return builder;
			},
		} as never,
	};
}

describe('catalog migration', () => {
	it('creates the three catalogue tables with row level security', () => {
		for (const table of ['tools', 'use_cases', 'resources']) {
			expect(migration).toContain(`create table public.${table} (`);
			expect(migration).toContain(`alter table public.${table} enable row level security;`);
			expect(migration).toContain(`create policy ${table}_public_read on public.${table}`);
			expect(migration).toContain(`create policy ${table}_manager_write on public.${table}`);
		}
	});

	it('only lets anonymous visitors read published rows', () => {
		const publicPolicies = migration.match(/create policy \w+_public_read[^;]+;/g) ?? [];
		expect(publicPolicies).toHaveLength(3);
		for (const policy of publicPolicies) {
			expect(policy).toContain('for select to anon, authenticated using (published)');
		}
		expect(migration).toContain('private.is_content_manager()');
		expect(migration).not.toMatch(/grant .* on public\.(tools|use_cases|resources) to anon.*insert/);
	});

	it('seeds every published Danish row from the Lovable export', () => {
		const seeded = (table: string) => {
			const block = migration.split(`insert into public.${table} `)[1] ?? '';
			return block.split('on conflict')[0]!.split('\n').filter((line) => line.startsWith('  (')).length;
		};
		expect(seeded('tools')).toBe(23);
		expect(seeded('use_cases')).toBe(31);
		expect(seeded('resources')).toBe(22);
		expect(migration.match(/on conflict \(slug, locale\) do nothing;/g)).toHaveLength(3);
	});

	it('keeps the imported bullet lists free of decorative prefixes', () => {
		expect(migration).not.toContain('✅');
		expect(migration).not.toContain('🚀');
		expect(migration).not.toMatch(/'\+ \d+ flere funktioner'/);
	});
});

describe('catalog queries', () => {
	it('asks Supabase for published Danish tools in editorial order', async () => {
		const { client, calls } = fakeSupabase([
			{
				slug: 'chatgpt',
				name: 'ChatGPT',
				tagline: 'AI-assistent',
				description: 'Beskrivelse',
				icon_url: null,
				categories: ['text', 'coding'],
				badges: ['recommended'],
				key_features: ['Custom GPTs'],
				pricing_display: 'Fra $20/md',
				external_url: 'https://chatgpt.com/',
				featured: true,
			},
		]);
		const { tools, error } = await fetchTools(client);
		expect(error).toBeNull();
		expect(calls.table).toBe('tools');
		expect(calls.locale).toBe('da');
		expect(calls.published).toBe(true);
		expect(calls.order).toEqual(['sort_order', { ascending: true }]);
		expect(tools[0]).toMatchObject({ slug: 'chatgpt', iconUrl: null, featured: true, keyFeatures: ['Custom GPTs'] });
	});

	it('maps use case columns onto the page model', async () => {
		const { client } = fakeSupabase([
			{
				slug: 'ai-support',
				title: 'AI i support',
				reference: '#4',
				department: 'operations',
				complexity: 'low',
				strategic_value: 'efficiency',
				problem_statement: 'Problem',
				solution: 'Løsning',
				business_benefits: ['Hurtigere svar'],
				recommended_tools: ['ChatGPT'],
				featured: false,
			},
		]);
		const { useCases } = await fetchUseCases(client);
		expect(useCases[0]).toMatchObject({
			strategicValue: 'efficiency',
			problem: 'Problem',
			solution: 'Løsning',
			benefits: ['Hurtigere svar'],
		});
	});

	it('parses numeric ratings that PostgREST returns as strings', async () => {
		const { client } = fakeSupabase([
			{ slug: 'prompt', title: 'Prompt', type: 'podcast', url: 'https://example.com', description: '', rating: '4.7', topics: [] },
			{ slug: 'uden', title: 'Uden vurdering', type: 'bog', url: 'https://example.com', description: '', rating: null, topics: null },
		]);
		const { resources } = await fetchResources(client);
		expect(resources[0]!.rating).toBe(4.7);
		expect(resources[1]!.rating).toBeNull();
		expect(resources[1]!.topics).toEqual([]);
	});

	it('returns the Supabase error instead of throwing', async () => {
		const { client } = fakeSupabase([], { message: 'nedetid' });
		const { tools, error } = await fetchTools(client);
		expect(tools).toEqual([]);
		expect(error).toEqual({ message: 'nedetid' });
	});
});

describe('catalog helpers', () => {
	const tools = [
		{ categories: ['text', 'coding'] },
		{ categories: ['text'] },
	];

	it('counts facet values and sorts the most common first', () => {
		const facet = buildFacet(tools, (tool) => tool.categories, toolCategoryLabels);
		expect(facet[0]).toEqual({ value: 'text', label: 'Tekst og skrivning', count: 2 });
		expect(facet[1]!.count).toBe(1);
	});

	it('falls back to the raw value for unknown labels', () => {
		expect(label(toolCategoryLabels, 'quantum')).toBe('quantum');
		expect(label(departmentLabels, 'hr')).toBe('HR og ledelse');
		expect(label(complexityLabels, 'low')).toBe('Let at komme i gang');
		expect(label(resourceTypeLabels, 'podcast')).toBe('Podcast');
	});

	it('builds a lowercase search index from mixed values', () => {
		expect(searchIndex('ChatGPT', ['Tekst'], undefined)).toContain('chatgpt tekst');
	});
});

describe('catalog pages', () => {
	it('renders server-side so redaktionelle ændringer slår igennem med det samme', () => {
		for (const page of [toolsPage, useCasesPage, resourcesPage]) {
			expect(page).toContain('export const prerender = false;');
			expect(page).toContain('createServerSupabaseClient(Astro.request, Astro.cookies)');
			expect(page).toContain('createItemListSchema');
			expect(page).toContain('data-catalog-search');
		}
	});

	it('shows a fejlbesked when Supabase is unavailable', () => {
		for (const page of [toolsPage, useCasesPage, resourcesPage]) {
			expect(page).toContain('{error ? (');
			expect(page).toContain('role="alert"');
		}
	});

	it('marks up cards so the client-side filter can hide them', () => {
		expect(toolsPage).toContain('data-facet-category');
		expect(useCasesPage).toContain('data-facet-department');
		expect(resourcesPage).toContain('data-facet-type');
		expect(filterScript).toContain('data-catalog-item');
	});

	it('opens external links safely', () => {
		for (const page of [toolsPage, resourcesPage]) {
			expect(page).toContain('rel="noopener noreferrer"');
		}
	});
});
