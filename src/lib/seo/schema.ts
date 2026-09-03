export const schemaLanguage = 'da-DK';

export type PageSchemaType =
	| 'WebPage'
	| 'AboutPage'
	| 'ContactPage'
	| 'CollectionPage';

export type SchemaValue =
	| string
	| number
	| boolean
	| null
	| SchemaNode
	| SchemaValue[];

export interface SchemaNode {
	'@type': string | string[];
	'@id'?: string;
	[key: string]: SchemaValue | undefined;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

interface SitePageGraphOptions {
	siteUrl: URL;
	canonicalUrl: URL;
	title: string;
	description: string;
	pageType?: PageSchemaType;
	breadcrumbs?: BreadcrumbItem[];
	mainEntity?: SchemaNode;
	additionalNodes?: SchemaNode[];
}

interface ArticleSchemaOptions {
	canonicalUrl: URL;
	type: 'Article' | 'NewsArticle';
	headline: string;
	description: string;
	datePublished?: string | null;
	dateModified?: string | null;
}

interface CourseSchemaOptions {
	canonicalUrl: URL;
	name: string;
	description: string;
	durationMinutes?: number | null;
	priceDkk?: number | null;
	level?: string | null;
}

interface LearningResourceSchemaOptions {
	canonicalUrl: URL;
	name: string;
	description: string;
	courseUrl: URL;
	courseName: string;
	durationMinutes?: number | null;
}

function absoluteUrl(value: string, base: URL): string {
	return new URL(value, base).toString();
}

export function createCanonicalUrl(requestUrl: URL, siteUrl: URL = requestUrl): URL {
	const canonicalUrl = new URL(requestUrl.pathname, siteUrl);
	if (canonicalUrl.pathname !== '/') canonicalUrl.pathname = canonicalUrl.pathname.replace(/\/+$/, '');
	return canonicalUrl;
}

function uniqueNodes(nodes: SchemaNode[]): SchemaNode[] {
	const seen = new Set<string>();
	return nodes.filter((node) => {
		const key = node['@id'] ?? `${String(node['@type'])}:${String(node.url ?? '')}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export function serializeJsonLd(value: unknown): string {
	return JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

export function buildSitePageGraph({
	siteUrl,
	canonicalUrl,
	title,
	description,
	pageType = 'WebPage',
	breadcrumbs = [],
	mainEntity,
	additionalNodes = [],
}: SitePageGraphOptions) {
	const homeUrl = absoluteUrl('/', siteUrl);
	const organizationId = `${homeUrl}#organization`;
	const websiteId = `${homeUrl}#website`;
	const webpageId = `${canonicalUrl.toString()}#webpage`;
	const breadcrumbId = `${canonicalUrl.toString()}#breadcrumb`;
	const organization: SchemaNode = {
		'@type': 'Organization',
		'@id': organizationId,
		name: 'LearnAI.nu',
		url: homeUrl,
	};
	const website: SchemaNode = {
		'@type': 'WebSite',
		'@id': websiteId,
		name: 'LearnAI.nu',
		url: homeUrl,
		inLanguage: schemaLanguage,
		publisher: { '@type': 'Organization', '@id': organizationId },
	};
	const webpage: SchemaNode = {
		'@type': pageType,
		'@id': webpageId,
		url: canonicalUrl.toString(),
		name: title,
		description,
		inLanguage: schemaLanguage,
		isPartOf: { '@type': 'WebSite', '@id': websiteId },
		...(breadcrumbs.length ? { breadcrumb: { '@type': 'BreadcrumbList', '@id': breadcrumbId } } : {}),
		...(mainEntity?.['@id'] ? { mainEntity: { '@type': mainEntity['@type'], '@id': mainEntity['@id'] } } : {}),
	};
	const breadcrumb: SchemaNode | null = breadcrumbs.length
		? {
			'@type': 'BreadcrumbList',
			'@id': breadcrumbId,
			itemListElement: breadcrumbs.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: createCanonicalUrl(new URL(item.url, siteUrl), siteUrl).toString(),
			})),
		}
		: null;

	return {
		'@context': 'https://schema.org',
		'@graph': uniqueNodes([
			organization,
			website,
			webpage,
			...(breadcrumb ? [breadcrumb] : []),
			...(mainEntity ? [mainEntity] : []),
			...additionalNodes,
		]),
	};
}

export function createItemListSchema(
	canonicalUrl: URL,
	items: Array<{ name: string; url: string }>,
): SchemaNode {
	return {
		'@type': 'ItemList',
		'@id': `${canonicalUrl.toString()}#itemlist`,
		name: 'Indhold på siden',
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: createCanonicalUrl(new URL(item.url, canonicalUrl), canonicalUrl).toString(),
		})),
	};
}

export function createArticleSchema({
	canonicalUrl,
	type,
	headline,
	description,
	datePublished,
	dateModified,
}: ArticleSchemaOptions): SchemaNode {
	const organizationId = `${absoluteUrl('/', canonicalUrl)}#organization`;
	return {
		'@type': type,
		'@id': `${canonicalUrl.toString()}#article`,
		headline,
		description,
		url: canonicalUrl.toString(),
		mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalUrl.toString()}#webpage` },
		inLanguage: schemaLanguage,
		...(datePublished ? { datePublished } : {}),
		...(dateModified ? { dateModified } : {}),
		author: { '@type': 'Organization', '@id': organizationId, name: 'LearnAI.nu' },
		publisher: { '@type': 'Organization', '@id': organizationId },
	};
}

export function createCourseSchema({
	canonicalUrl,
	name,
	description,
	durationMinutes,
	priceDkk,
	level,
}: CourseSchemaOptions): SchemaNode {
	const organizationId = `${absoluteUrl('/', canonicalUrl)}#organization`;
	return {
		'@type': 'Course',
		'@id': `${canonicalUrl.toString()}#course`,
		name,
		description,
		url: canonicalUrl.toString(),
		inLanguage: schemaLanguage,
		provider: { '@type': 'Organization', '@id': organizationId, name: 'LearnAI.nu' },
		...(typeof durationMinutes === 'number' && durationMinutes > 0
			? { timeRequired: `PT${durationMinutes}M` }
			: {}),
		...(level ? { educationalLevel: level } : {}),
		...(typeof priceDkk === 'number'
			? {
				offers: {
					'@type': 'Offer',
					price: priceDkk,
					priceCurrency: 'DKK',
					url: canonicalUrl.toString(),
					availability: 'https://schema.org/InStock',
				},
			}
			: {}),
	};
}

export function createLearningResourceSchema({
	canonicalUrl,
	name,
	description,
	courseUrl,
	courseName,
	durationMinutes,
}: LearningResourceSchemaOptions): SchemaNode {
	return {
		'@type': 'LearningResource',
		'@id': `${canonicalUrl.toString()}#learning-resource`,
		name,
		description,
		url: canonicalUrl.toString(),
		inLanguage: schemaLanguage,
		learningResourceType: 'lesson',
		isPartOf: {
			'@type': 'Course',
			'@id': `${courseUrl.toString()}#course`,
			name: courseName,
			url: courseUrl.toString(),
		},
		...(typeof durationMinutes === 'number' && durationMinutes > 0
			? { timeRequired: `PT${durationMinutes}M` }
			: {}),
	};
}
