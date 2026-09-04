import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	buildFacet,
	complexityLabels,
	departmentLabels,
	label,
	resourceTypeLabels,
	resources,
	searchIndex,
	toolCategoryLabels,
	tools,
	useCases,
} from '../src/lib/catalog';

const toolsPage = readFileSync(new URL('../src/pages/tools.astro', import.meta.url), 'utf8');
const useCasesPage = readFileSync(new URL('../src/pages/use-cases.astro', import.meta.url), 'utf8');
const resourcesPage = readFileSync(new URL('../src/pages/resources.astro', import.meta.url), 'utf8');
const filterScript = readFileSync(new URL('../src/scripts/catalog-filter.ts', import.meta.url), 'utf8');

describe('catalog data migrated from the Lovable site', () => {
	it('keeps every published Danish entry', () => {
		expect(tools).toHaveLength(23);
		expect(useCases).toHaveLength(31);
		expect(resources).toHaveLength(22);
	});

	it('uses unique slugs so anchor links stay stable', () => {
		for (const collection of [tools, useCases, resources]) {
			const slugs = collection.map((entry) => entry.slug);
			expect(new Set(slugs).size).toBe(slugs.length);
		}
	});

	it('exposes an external link and a category on every tool', () => {
		for (const tool of tools) {
			expect(tool.url).toMatch(/^https:\/\//);
			expect(tool.categories.length).toBeGreaterThan(0);
		}
	});

	it('describes every use case with a problem, a solution and benefits', () => {
		for (const useCase of useCases) {
			expect(useCase.problem.length).toBeGreaterThan(0);
			expect(useCase.solution.length).toBeGreaterThan(0);
			expect(useCase.benefits.length).toBeGreaterThan(0);
			expect(departmentLabels[useCase.department]).toBeDefined();
			expect(complexityLabels[useCase.complexity]).toBeDefined();
		}
	});

	it('labels every resource type in Danish', () => {
		for (const resource of resources) {
			expect(resourceTypeLabels[resource.type]).toBeDefined();
			expect(resource.url).toMatch(/^https?:\/\//);
		}
	});

	it('strips the imported emoji prefixes from list items', () => {
		const listItems = [
			...tools.flatMap((tool) => tool.keyFeatures),
			...useCases.flatMap((useCase) => useCase.benefits),
		];
		expect(listItems.some((item) => item.startsWith('✅') || item.startsWith('🚀'))).toBe(false);
		expect(listItems.some((item) => /^Gevinst \d+:/.test(item))).toBe(false);
		expect(listItems.some((item) => /^\+ \d+ flere funktioner$/.test(item))).toBe(false);
	});
});

describe('catalog helpers', () => {
	it('counts facet values and sorts the most common first', () => {
		const facet = buildFacet(tools, (tool) => tool.categories, toolCategoryLabels);
		expect(facet[0]!.count).toBeGreaterThanOrEqual(facet[facet.length - 1]!.count);
		expect(facet.map((option) => option.value)).toContain('text');
		expect(facet.find((option) => option.value === 'text')?.label).toBe('Tekst og skrivning');
	});

	it('falls back to the raw value for unknown labels', () => {
		expect(label(toolCategoryLabels, 'quantum')).toBe('quantum');
	});

	it('builds a lowercase search index from mixed values', () => {
		expect(searchIndex('ChatGPT', ['Tekst', null as unknown as string], undefined)).toContain('chatgpt tekst');
	});
});

describe('catalog pages', () => {
	it('prerenders all three catalogues', () => {
		for (const page of [toolsPage, useCasesPage, resourcesPage]) {
			expect(page).toContain('export const prerender = true;');
			expect(page).toContain('data-catalog-search');
			expect(page).toContain('createItemListSchema');
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
