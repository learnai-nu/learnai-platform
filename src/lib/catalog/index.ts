import type { SupabaseClient } from '@supabase/supabase-js';

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
	url: string;
	description: string;
	rating: number | null;
	topics: string[];
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

/** Postgres numerics arrive as strings through PostgREST. */
function numeric(value: unknown): number | null {
	const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The three catalogues are read with the visitor's own Supabase session, so RLS
 * decides what is returned. Anonymous visitors see published Danish rows only.
 */
async function readCatalog(supabase: SupabaseClient, table: string, columns: string) {
	const { data, error } = await supabase
		.from(table)
		.select(columns)
		.eq('locale', 'da')
		.eq('published', true)
		.order('sort_order', { ascending: true });
	return { rows: (data ?? []) as unknown as Row[], error };
}

export async function fetchTools(supabase: SupabaseClient) {
	const { rows, error } = await readCatalog(
		supabase,
		'tools',
		'slug,name,tagline,description,icon_url,categories,badges,key_features,pricing_display,external_url,featured',
	);
	const tools: Tool[] = rows.map((row) => ({
		slug: text(row.slug),
		name: text(row.name),
		tagline: text(row.tagline),
		description: text(row.description),
		iconUrl: optional(row.icon_url),
		categories: strings(row.categories),
		badges: strings(row.badges),
		keyFeatures: strings(row.key_features),
		pricing: optional(row.pricing_display),
		url: optional(row.external_url),
		featured: row.featured === true,
	}));
	return { tools, error };
}

export async function fetchUseCases(supabase: SupabaseClient) {
	const { rows, error } = await readCatalog(
		supabase,
		'use_cases',
		'slug,title,reference,department,complexity,strategic_value,problem_statement,solution,business_benefits,recommended_tools,featured',
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

export async function fetchResources(supabase: SupabaseClient) {
	const { rows, error } = await readCatalog(
		supabase,
		'resources',
		'slug,title,type,url,description,rating,topics',
	);
	const resources: Resource[] = rows.map((row) => ({
		slug: text(row.slug),
		title: text(row.title),
		type: text(row.type),
		url: text(row.url),
		description: text(row.description),
		rating: numeric(row.rating),
		topics: strings(row.topics),
	}));
	return { resources, error };
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
