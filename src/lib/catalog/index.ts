import resourcesData from '../../data/resources.json';
import toolsData from '../../data/tools.json';
import useCasesData from '../../data/use-cases.json';

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
	language: string;
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

export const tools = toolsData as Tool[];
export const useCases = useCasesData as UseCase[];
export const resources = resourcesData as Resource[];

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
