import type { SupabaseClient } from '@supabase/supabase-js';

export type Locale = 'da' | 'en';

export const locales: Locale[] = ['da', 'en'];

export function isLocale(value: unknown): value is Locale {
	return value === 'da' || value === 'en';
}

export interface Tool {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	iconUrl: string | null;
	categories: string[];
	badges: string[];
	keyFeatures: string[];
	pricing: string | null;
	url: string | null;
	featured: boolean;
}

export interface UseCase {
	slug: string;
	title: string;
	reference: string | null;
	department: string;
	complexity: string;
	strategicValue: string;
	problem: string;
	solution: string;
	benefits: string[];
	recommendedTools: string[];
	featured: boolean;
}

export interface Resource {
	slug: string;
	title: string;
	type: string;
	url: string | null;
	description: string;
	rating: number | null;
	topics: string[];
	/** The language of the resource itself, which can differ from the page it appears on. */
	contentLanguage: Locale;
}

export interface CatalogEvent {
	slug: string;
	title: string;
	description: string;
	date: string;
	timeStart: string | null;
	timeEnd: string | null;
	locationType: string;
	locationName: string | null;
	registrationUrl: string | null;
	organizer: string | null;
	price: string | null;
}

export const toolCategoryLabels: Record<string, string> = {
	text: 'Tekst og skrivning',
	coding: 'Kodning',
	images: 'Billeder',
	video: 'Video',
	audio: 'Lyd og stemme',
	research: 'Research',
	automation: 'Automatisering',
	other: 'Andet',
};

export const toolBadgeLabels: Record<string, string> = {
	recommended: 'Anbefalet',
	tried_tested: 'Testet af os',
	new: 'Ny',
	popular: 'Populær',
};

export const departmentLabels: Record<string, string> = {
	hr: 'HR og ledelse',
	it: 'IT og udvikling',
	marketing: 'Marketing og salg',
	operations: 'Drift og administration',
};

export const complexityLabels: Record<string, string> = {
	low: 'Let at komme i gang',
	medium: 'Mellem',
	high: 'Kræver forarbejde',
};

export const strategicValueLabels: Record<string, string> = {
	efficiency: 'Effektivitet',
	quality: 'Kvalitet',
	growth: 'Vækst',
};

export const resourceTypeLabels: Record<string, string> = {
	podcast: 'Podcast',
	youtube: 'YouTube-kanal',
	bog: 'Bog',
	kursus: 'Kursus',
	nyhedsbrev: 'Nyhedsbrev',
	rapport: 'Rapport',
};

const englishLabels = {
	toolCategory: {
		text: 'Text and writing',
		coding: 'Coding',
		images: 'Images',
		video: 'Video',
		audio: 'Audio and voice',
		research: 'Research',
		automation: 'Automation',
		other: 'Other',
	},
	toolBadge: {
		recommended: 'Recommended',
		tried_tested: 'Tried and tested',
		new: 'New',
		popular: 'Popular',
	},
	department: {
		hr: 'HR and leadership',
		it: 'IT and development',
		marketing: 'Marketing and sales',
		operations: 'Operations and admin',
	},
	complexity: {
		low: 'Easy to start',
		medium: 'Medium',
		high: 'Needs groundwork',
	},
	strategicValue: {
		efficiency: 'Efficiency',
		quality: 'Quality',
		growth: 'Growth',
	},
	resourceType: {
		podcast: 'Podcast',
		youtube: 'YouTube channel',
		bog: 'Book',
		kursus: 'Course',
		nyhedsbrev: 'Newsletter',
		rapport: 'Report',
	},
	eventLocation: {
		fysisk: 'In person',
		online: 'Online',
		hybrid: 'Hybrid',
	},
	contentLanguage: { da: 'Danish', en: 'English' },
} satisfies Record<string, Record<string, string>>;

export const eventLocationLabels: Record<string, string> = {
	fysisk: 'Fysisk',
	online: 'Online',
	hybrid: 'Hybrid',
};

export const contentLanguageLabels: Record<string, string> = { da: 'Dansk', en: 'Engelsk' };

const danishLabels = {
	toolCategory: toolCategoryLabels,
	toolBadge: toolBadgeLabels,
	department: departmentLabels,
	complexity: complexityLabels,
	strategicValue: strategicValueLabels,
	resourceType: resourceTypeLabels,
	eventLocation: eventLocationLabels,
	contentLanguage: contentLanguageLabels,
};

export type LabelSet = keyof typeof danishLabels;

/** The enum values are stored language-neutral; only their labels are translated. */
export function labels(locale: Locale, set: LabelSet): Record<string, string> {
	return locale === 'en' ? englishLabels[set] : danishLabels[set];
}

export function label(map: Record<string, string>, value: string) {
	return map[value] ?? value;
}

type Row = Record<string, unknown>;

function strings(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function text(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function optional(value: unknown): string | null {
	return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Only http(s) URLs reach an href or src attribute, whoever wrote the row. */
function webUrl(value: unknown): string | null {
	const url = optional(value);
	return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Postgres numerics arrive as strings through PostgREST. */
function numeric(value: unknown): number | null {
	const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The catalogues are read with the visitor's own Supabase session, so RLS
 * decides what is returned. Anonymous visitors see published rows only.
 */
async function readCatalog(
	supabase: SupabaseClient,
	table: string,
	columns: string,
	locale: Locale,
	orderBy = 'sort_order',
) {
	const { data, error } = await supabase
		.from(table)
		.select(columns)
		.eq('locale', locale)
		.eq('published', true)
		.order(orderBy, { ascending: true });
	return { rows: (data ?? []) as unknown as Row[], error };
}

export async function fetchTools(supabase: SupabaseClient, locale: Locale = 'da') {
	const { rows, error } = await readCatalog(
		supabase,
		'tools',
		'slug,name,tagline,description,icon_url,categories,badges,key_features,pricing_display,external_url,featured',
		locale,
	);
	const tools: Tool[] = rows.map((row) => ({
		slug: text(row.slug),
		name: text(row.name),
		tagline: text(row.tagline),
		description: text(row.description),
		iconUrl: webUrl(row.icon_url),
		categories: strings(row.categories),
		badges: strings(row.badges),
		keyFeatures: strings(row.key_features),
		pricing: optional(row.pricing_display),
		url: webUrl(row.external_url),
		featured: row.featured === true,
	}));
	return { tools, error };
}

export async function fetchUseCases(supabase: SupabaseClient, locale: Locale = 'da') {
	const { rows, error } = await readCatalog(
		supabase,
		'use_cases',
		'slug,title,reference,department,complexity,strategic_value,problem_statement,solution,business_benefits,recommended_tools,featured',
		locale,
	);
	const useCases: UseCase[] = rows.map((row) => ({
		slug: text(row.slug),
		title: text(row.title),
		reference: optional(row.reference),
		department: text(row.department),
		complexity: text(row.complexity),
		strategicValue: text(row.strategic_value),
		problem: text(row.problem_statement),
		solution: text(row.solution),
		benefits: strings(row.business_benefits),
		recommendedTools: strings(row.recommended_tools),
		featured: row.featured === true,
	}));
	return { useCases, error };
}

export async function fetchResources(supabase: SupabaseClient, locale: Locale = 'da') {
	const { rows, error } = await readCatalog(
		supabase,
		'resources',
		'slug,title,type,url,description,rating,topics,content_language',
		locale,
	);
	const resources: Resource[] = rows.map((row) => ({
		slug: text(row.slug),
		title: text(row.title),
		type: text(row.type),
		url: webUrl(row.url),
		description: text(row.description),
		rating: numeric(row.rating),
		topics: strings(row.topics),
		contentLanguage: row.content_language === 'en' ? 'en' : 'da',
	}));
	return { resources, error };
}

export async function fetchEvents(supabase: SupabaseClient, locale: Locale = 'da') {
	const { rows, error } = await readCatalog(
		supabase,
		'events',
		'slug,title,description,event_date,time_start,time_end,location_type,location_name,registration_url,organizer,price',
		locale,
		'event_date',
	);
	const events: CatalogEvent[] = rows.map((row) => ({
		slug: text(row.slug),
		title: text(row.title),
		description: text(row.description),
		date: text(row.event_date),
		timeStart: optional(row.time_start),
		timeEnd: optional(row.time_end),
		locationType: text(row.location_type),
		locationName: optional(row.location_name),
		registrationUrl: webUrl(row.registration_url),
		organizer: optional(row.organizer),
		price: optional(row.price),
	}));
	return { events, error };
}

/** Events are split so a visitor sees what is coming before what has been. */
export function splitEvents(events: CatalogEvent[], now = new Date()) {
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const upcoming = events.filter((event) => new Date(event.date).getTime() >= startOfToday);
	const past = events
		.filter((event) => new Date(event.date).getTime() < startOfToday)
		.reverse();
	return { upcoming, past };
}

export interface FacetOption {
	value: string;
	label: string;
	count: number;
}

/** Builds the filter chips for a catalogue: one option per value that actually occurs, most used first. */
export function buildFacet<T>(
	items: T[],
	pick: (item: T) => string[] | string,
	labels: Record<string, string>,
): FacetOption[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		const value = pick(item);
		for (const key of Array.isArray(value) ? value : [value]) {
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([value, count]) => ({ value, label: label(labels, value), count }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'da'));
}

/** Free-text haystack used by the client-side search on the catalogue pages. */
export function searchIndex(...parts: (string | string[] | null | undefined)[]) {
	return parts
		.flatMap((part) => (Array.isArray(part) ? part : [part ?? '']))
		.join(' ')
		.toLowerCase();
}
