import type { APIRoute } from 'astro';
import {
	eventFormSchema,
	resourceFormSchema,
	toolFormSchema,
	useCaseFormSchema,
} from '../../../../lib/admin/contracts';
import {
	adminStatusUrl,
	hasSameOrigin,
	redirectWithoutCache,
} from '../../../../lib/admin/security';
import { getAdminContext } from '../../../../lib/auth/admin';

/**
 * Fælles gem-endpoint for de tre kataloger. Skrivningen sker med redaktørens
 * egen session, så RLS afgør adgangen — rollen tjekkes her for at kunne vise
 * en pæn fejl frem for en databasefejl.
 */
const catalogs = {
	tool: {
		table: 'tools',
		basePath: '/admin/vaerktoejer',
		schema: toolFormSchema,
		arrayFields: ['categories', 'badges'],
		toRow: (value: Record<string, unknown>) => ({
			slug: value.slug,
			locale: value.locale,
			name: value.name,
			tagline: value.tagline,
			description: value.description,
			icon_url: value.iconUrl || null,
			categories: value.categories,
			badges: value.badges,
			key_features: value.keyFeatures,
			pricing_display: value.pricingDisplay || null,
			external_url: value.externalUrl || null,
			featured: value.featured === 'true',
			published: value.published === 'true',
			sort_order: value.sortOrder,
		}),
	},
	'use-case': {
		table: 'use_cases',
		basePath: '/admin/use-cases',
		schema: useCaseFormSchema,
		arrayFields: [],
		toRow: (value: Record<string, unknown>) => ({
			slug: value.slug,
			locale: value.locale,
			title: value.title,
			reference: value.reference || null,
			department: value.department,
			complexity: value.complexity,
			strategic_value: value.strategicValue,
			problem_statement: value.problemStatement,
			solution: value.solution,
			business_benefits: value.businessBenefits,
			recommended_tools: value.recommendedTools,
			featured: value.featured === 'true',
			published: value.published === 'true',
			sort_order: value.sortOrder,
		}),
	},
	resource: {
		table: 'resources',
		basePath: '/admin/ressourcer',
		schema: resourceFormSchema,
		arrayFields: [],
		toRow: (value: Record<string, unknown>) => ({
			slug: value.slug,
			locale: value.locale,
			title: value.title,
			type: value.type,
			url: value.url,
			description: value.description,
			rating: value.rating === '' ? null : value.rating,
			topics: value.topics,
			content_language: value.contentLanguage,
			published: value.published === 'true',
			sort_order: value.sortOrder,
		}),
	},
	event: {
		table: 'events',
		basePath: '/admin/events',
		schema: eventFormSchema,
		arrayFields: [],
		toRow: (value: Record<string, unknown>) => ({
			slug: value.slug,
			locale: value.locale,
			title: value.title,
			description: value.description,
			event_date: value.eventDate,
			time_start: value.timeStart || null,
			time_end: value.timeEnd || null,
			location_type: value.locationType,
			location_name: value.locationName || null,
			registration_url: value.registrationUrl || null,
			organizer: value.organizer || null,
			price: value.price || null,
			published: value.published === 'true',
			sort_order: value.sortOrder,
		}),
	},
} as const;

type CatalogKey = keyof typeof catalogs;

function isCatalogKey(value: unknown): value is CatalogKey {
	return typeof value === 'string' && value in catalogs;
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });

	const context = await getAdminContext(request, cookies);
	if (!context.claims) return redirectWithoutCache('/login?status=required');
	if (!context.role) return new Response('Ingen adgang.', { status: 403 });

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return redirectWithoutCache(adminStatusUrl('/admin', 'error'));
	}

	const kind = formData.get('catalog');
	if (!isCatalogKey(kind)) return new Response('Ukendt katalog.', { status: 400 });
	const catalog = catalogs[kind];

	const input: Record<string, unknown> = Object.fromEntries(formData);
	for (const field of catalog.arrayFields) input[field] = formData.getAll(field);

	const parsed = catalog.schema.safeParse(input);
	if (!parsed.success) {
		const fallbackId = formData.get('id');
		const target =
			typeof fallbackId === 'string' && fallbackId
				? `${catalog.basePath}/${fallbackId}`
				: `${catalog.basePath}/ny`;
		return redirectWithoutCache(adminStatusUrl(target, 'error'));
	}

	const value = parsed.data as Record<string, unknown>;
	const row = catalog.toRow(value);

	if (typeof value.id === 'string' && value.id) {
		const { error } = await context.supabase.from(catalog.table).update(row).eq('id', value.id);
		if (error) return redirectWithoutCache(adminStatusUrl(`${catalog.basePath}/${value.id}`, 'error'));
		return redirectWithoutCache(adminStatusUrl(catalog.basePath, 'saved'));
	}

	const { data, error } = await context.supabase
		.from(catalog.table)
		.insert({ ...row, published: false })
		.select('id')
		.single();

	if (error || !data) return redirectWithoutCache(adminStatusUrl(`${catalog.basePath}/ny`, 'error'));
	return redirectWithoutCache(adminStatusUrl(`${catalog.basePath}/${data.id}`, 'created'));
};
