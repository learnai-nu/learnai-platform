import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	eventFormSchema,
	resourceFormSchema,
	toolFormSchema,
	useCaseFormSchema,
} from '../src/lib/admin/contracts';
import {
	buildFacet,
	fetchEvents,
	labels,
	splitEvents,
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
const englishMigration = readFileSync(
	new URL('../supabase/migrations/20260904120000_catalog_english_and_events.sql', import.meta.url),
	'utf8',
);
const toolsPage = readFileSync(new URL('../src/components/catalog/ToolsCatalog.astro', import.meta.url), 'utf8');
const useCasesPage = readFileSync(new URL('../src/components/catalog/UseCasesCatalog.astro', import.meta.url), 'utf8');
const resourcesPage = readFileSync(new URL('../src/components/catalog/ResourcesCatalog.astro', import.meta.url), 'utf8');
const eventsPage = readFileSync(new URL('../src/components/catalog/EventsCatalog.astro', import.meta.url), 'utf8');
const localePages = ['tools', 'use-cases', 'resources', 'events'].flatMap((name) => [
	readFileSync(new URL(`../src/pages/${name}.astro`, import.meta.url), 'utf8'),
	readFileSync(new URL(`../src/pages/en/${name}.astro`, import.meta.url), 'utf8'),
]);
const filterScript = readFileSync(new URL('../src/scripts/catalog-filter.ts', import.meta.url), 'utf8');
const saveRoute = readFileSync(new URL('../src/pages/api/admin/catalog/save.ts', import.meta.url), 'utf8');
const adminPages = ['vaerktoejer', 'use-cases', 'ressourcer'].flatMap((section) => [
	readFileSync(new URL(`../src/pages/admin/${section}/index.astro`, import.meta.url), 'utf8'),
	readFileSync(new URL(`../src/pages/admin/${section}/[id].astro`, import.meta.url), 'utf8'),
]);

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
			expect(migration).toContain(`create table if not exists public.${table} (`);
			expect(migration).toContain(`alter table public.${table} enable row level security;`);
			expect(migration).toContain(`create policy ${table}_public_read on public.${table}`);
			expect(migration).toContain(`create policy ${table}_manager_write on public.${table}`);
		}
	});

	it('namespaces its enums so they cannot collide with other features', () => {
		// public.resource_type already exists in production and belongs elsewhere.
		for (const type of ['catalog_locale', 'catalog_use_case_department', 'catalog_use_case_complexity', 'catalog_use_case_value', 'catalog_resource_type']) {
			expect(migration).toContain(`create type public.${type} as enum`);
		}
		expect(migration).not.toMatch(/public\.resource_type\b/);
		expect(migration).not.toMatch(/public\.use_case_(department|complexity|value)\b/);
	});

	it('can be re-run on a partially migrated database', () => {
		// Postgres has no "create type if not exists", so the enums are guarded instead.
		expect(migration.match(/exception when duplicate_object then null; end \$\$;/g)).toHaveLength(5);
		for (const table of ['tools', 'use_cases', 'resources']) {
			expect(migration).toContain(`create index if not exists ${table}_published_idx`);
			expect(migration).toContain(`drop trigger if exists ${table}_touch_updated_at on public.${table};`);
			for (const policy of ['public_read', 'manager_read', 'manager_write']) {
				expect(migration).toContain(`drop policy if exists ${table}_${policy} on public.${table};`);
			}
		}
		expect(migration).not.toMatch(/^create type /m);
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

	it('drops urls that are not http(s), whoever wrote the row', async () => {
		const { client } = fakeSupabase([
			{ slug: 'ondt', name: 'Ondt', categories: [], badges: [], key_features: [], external_url: 'javascript:alert(1)', icon_url: 'data:text/html,<script>', featured: false },
		]);
		const { tools } = await fetchTools(client);
		expect(tools[0]!.url).toBeNull();
		expect(tools[0]!.iconUrl).toBeNull();
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
		for (const page of [toolsPage, useCasesPage, resourcesPage, eventsPage]) {
			expect(page).toContain('createServerSupabaseClient(Astro.request, Astro.cookies)');
			expect(page).toContain('createItemListSchema');
		}
		for (const page of [toolsPage, useCasesPage, resourcesPage]) {
			expect(page).toContain('data-catalog-search');
		}
		for (const page of localePages) {
			expect(page).toContain('export const prerender = false;');
		}
	});

	it('serves both languages from the same component with hreflang alternates', () => {
		for (const page of [toolsPage, useCasesPage, resourcesPage, eventsPage]) {
			expect(page).toContain("locale === 'en'");
			expect(page).toMatch(/alternates=\{\[\{ locale: 'da'/);
		}
		expect(localePages.filter((page) => page.includes('locale="en"'))).toHaveLength(4);
		expect(localePages.filter((page) => page.includes('locale="da"'))).toHaveLength(4);
	});

	it('shows a fejlbesked when Supabase is unavailable', () => {
		for (const page of [toolsPage, useCasesPage, resourcesPage, eventsPage]) {
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
		for (const page of [toolsPage, resourcesPage, eventsPage]) {
			expect(page).toContain('rel="noopener noreferrer"');
		}
	});
});

describe('katalog-admin', () => {
	const tool = {
		slug: 'nyt-vaerktoej',
		name: 'Nyt værktøj',
		description: 'Beskrivelse',
		categories: ['text'],
		badges: [],
		keyFeatures: ' Første funktion \n\n Anden funktion \n',
		externalUrl: 'https://example.com',
		published: 'true',
		sortOrder: '3',
	};

	it('splits line-separated fields into arrays and drops blank lines', () => {
		const parsed = toolFormSchema.parse(tool);
		expect(parsed.keyFeatures).toEqual(['Første funktion', 'Anden funktion']);
		expect(parsed.sortOrder).toBe(3);
		expect(parsed.published).toBe('true');
	});

	it('defaults optional tool fields instead of failing', () => {
		const parsed = toolFormSchema.parse({ slug: 'x-y', name: 'Xy', sortOrder: '0' });
		expect(parsed).toMatchObject({ categories: [], badges: [], keyFeatures: [], featured: 'false', iconUrl: '' });
	});

	it('rejects slugs and urls that would break the public pages', () => {
		expect(toolFormSchema.safeParse({ ...tool, slug: 'Ugyldig Slug' }).success).toBe(false);
		expect(toolFormSchema.safeParse({ ...tool, externalUrl: 'javascript:alert(1)' }).success).toBe(false);
	});

	it('validates the enum columns on use cases', () => {
		const base = {
			slug: 'ai-support',
			title: 'AI i support',
			department: 'operations',
			complexity: 'low',
			strategicValue: 'efficiency',
			problemStatement: 'Problem',
			solution: 'Løsning',
			sortOrder: '0',
		};
		expect(useCaseFormSchema.safeParse(base).success).toBe(true);
		expect(useCaseFormSchema.safeParse({ ...base, department: 'finance' }).success).toBe(false);
		expect(useCaseFormSchema.safeParse({ ...base, complexity: 'ekstrem' }).success).toBe(false);
	});

	it('keeps an empty rating empty and bounds the scale', () => {
		const base = { slug: 'prompt', title: 'Prompt', type: 'podcast', url: 'https://example.com', sortOrder: '0' };
		expect(resourceFormSchema.parse(base).rating).toBe('');
		expect(resourceFormSchema.parse({ ...base, rating: '4.7' }).rating).toBe(4.7);
		expect(resourceFormSchema.safeParse({ ...base, rating: '9' }).success).toBe(false);
		expect(resourceFormSchema.safeParse({ ...base, type: 'tiktok' }).success).toBe(false);
	});

	it('guards the save endpoint on origin and role, and creates drafts', () => {
		expect(saveRoute).toContain('hasSameOrigin(request)');
		expect(saveRoute).toContain('if (!context.role) return new Response(\'Ingen adgang.\', { status: 403 });');
		expect(saveRoute).toContain('.insert({ ...row, published: false })');
	});

	it('requires a session and a role on every admin page', () => {
		for (const page of adminPages) {
			expect(page).toContain('export const prerender = false;');
			expect(page).toContain("Astro.response.headers.set('Cache-Control', 'private, no-store, max-age=0')");
			expect(page).toContain('getAdminContext(Astro.request, Astro.cookies)');
			expect(page).toContain('if (!context.role) return new Response');
		}
	});
});

describe('engelsk katalog og events', () => {
	it('seeds both languages and the events table', () => {
		const seeded = (table: string) => {
			const block = englishMigration.split(`insert into public.${table} `)[1] ?? '';
			const rows = block.split('on conflict')[0]!.split('\n').filter((line) => line.startsWith('  ('));
			// The locale is the second-to-last value on each row, right before sort_order.
			const localeOf = (row: string) => row.match(/'(da|en)', \d+\),?$/)?.[1];
			return {
				da: rows.filter((row) => localeOf(row) === 'da').length,
				en: rows.filter((row) => localeOf(row) === 'en').length,
			};
		};
		expect(seeded('tools')).toEqual({ da: 23, en: 23 });
		expect(seeded('use_cases')).toEqual({ da: 31, en: 31 });
		expect(seeded('resources')).toEqual({ da: 22, en: 22 });
		expect(seeded('events')).toEqual({ da: 8, en: 8 });
	});

	it('guards the events table the same way as the other catalogues', () => {
		expect(englishMigration).toContain('create table if not exists public.events (');
		expect(englishMigration).toContain('alter table public.events enable row level security;');
		expect(englishMigration).toContain('create policy events_public_read on public.events');
		expect(englishMigration).toContain('for select to anon, authenticated using (published)');
		expect(englishMigration).toContain('create policy events_manager_write on public.events');
		expect(englishMigration).toContain('private.is_content_manager()');
		expect(englishMigration.match(/on conflict \(slug, locale\) do nothing;/g)).toHaveLength(4);
	});

	it('strips the Lovable "-en" slug suffix so the languages pair up', () => {
		expect(englishMigration).toContain("('chatgpt', 'ChatGPT', 'The world's leading".replace("'s", "''s"));
		expect(englishMigration).not.toMatch(/\('[a-z0-9-]+-en',/);
	});

	it('cleans English bullet prefixes too', () => {
		expect(englishMigration).not.toContain('✅');
		expect(englishMigration).not.toContain('🚀');
		expect(englishMigration).not.toMatch(/'Benefit \d+:/);
		expect(englishMigration).not.toMatch(/'\+ \d+ more features'/);
	});

	it('translates the enum labels without translating the stored values', () => {
		expect(labels('da', 'department').hr).toBe('HR og ledelse');
		expect(labels('en', 'department').hr).toBe('HR and leadership');
		expect(labels('en', 'resourceType').bog).toBe('Book');
		expect(labels('en', 'eventLocation').fysisk).toBe('In person');
	});

	it('asks Supabase for the requested language', async () => {
		const { client, calls } = fakeSupabase([]);
		await fetchEvents(client, 'en');
		expect(calls.table).toBe('events');
		expect(calls.locale).toBe('en');
		expect(calls.published).toBe(true);
		expect(calls.order).toEqual(['event_date', { ascending: true }]);
	});

	it('splits events into upcoming and past around today', () => {
		const events = [
			{ slug: 'gammel', date: '2026-01-10T00:00:00+00:00' },
			{ slug: 'i-dag', date: '2026-09-04T00:00:00+00:00' },
			{ slug: 'senere', date: '2026-11-01T00:00:00+00:00' },
		] as Parameters<typeof splitEvents>[0];
		const { upcoming, past } = splitEvents(events, new Date('2026-09-04T09:00:00Z'));
		expect(upcoming.map((event) => event.slug)).toEqual(['i-dag', 'senere']);
		expect(past.map((event) => event.slug)).toEqual(['gammel']);
	});

	it('validates the event form and requires a real date', () => {
		const base = {
			slug: 'ai-konference',
			title: 'AI-konference',
			eventDate: '2026-11-01',
			locationType: 'fysisk',
			sortOrder: '0',
			locale: 'en',
		};
		expect(eventFormSchema.parse(base).locale).toBe('en');
		expect(eventFormSchema.safeParse({ ...base, eventDate: 'i morgen' }).success).toBe(false);
		expect(eventFormSchema.safeParse({ ...base, locationType: 'metaverse' }).success).toBe(false);
		expect(eventFormSchema.safeParse({ ...base, registrationUrl: 'javascript:alert(1)' }).success).toBe(false);
	});

	it('lets editors pick the language on every catalogue form', () => {
		expect(resourceFormSchema.parse({ slug: 'x-y', title: 'Xy', type: 'bog', url: 'https://example.com', sortOrder: '0' }).locale).toBe('da');
		for (const section of ['vaerktoejer', 'use-cases', 'ressourcer', 'events']) {
			const page = readFileSync(new URL(`../src/pages/admin/${section}/[id].astro`, import.meta.url), 'utf8');
			expect(page).toContain('<select name="locale">');
		}
	});
});
