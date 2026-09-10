import { siteAuthor, siteOrganisation } from '../navigation/site-nav';

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
	/** Section label ("Guide", "Nyhed") — mirrors `article:section`. */
	articleSection?: string | null;
	keywords?: string[];
	image?: string | null;
	imageAlt?: string | null;
	wordCount?: number | null;
	readingMinutes?: number | null;
	/** Works the article draws on, rendered as `citation` nodes. */
	citations?: ArticleCitation[];
	/** Entities the article is about, from the internal knowledge graph. */
	about?: string[];
	mentions?: string[];
}

export interface ArticleCitation {
	name: string;
	url?: string | null;
	publisher?: string | null;
	author?: string | null;
	year?: string | null;
}

export interface FaqEntry {
	question: string;
	answer: string;
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
	const personId = `${homeUrl}#person`;
	const organization: SchemaNode = {
		'@type': 'Organization',
		'@id': organizationId,
		name: siteOrganisation.name,
		legalName: siteOrganisation.legalName,
		url: homeUrl,
		description: siteOrganisation.description,
		email: siteOrganisation.email,
		// Agents check for a reachable contact and a location before they treat a
		// site as a legitimate business worth recommending.
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'customer support',
				email: siteOrganisation.email,
				areaServed: 'DK',
				availableLanguage: ['Danish', 'English'],
			},
			{
				'@type': 'ContactPoint',
				contactType: 'sales',
				email: siteOrganisation.businessEmail,
				areaServed: 'DK',
				availableLanguage: ['Danish', 'English'],
			},
		],
		address: {
			'@type': 'PostalAddress',
			addressCountry: siteOrganisation.address.addressCountry,
			addressRegion: siteOrganisation.address.addressRegion,
		},
		sameAs: [...siteOrganisation.sameAs],
		foundingDate: siteOrganisation.foundingDate,
		logo: {
			'@type': 'ImageObject',
			'@id': `${homeUrl}#logo`,
			url: absoluteUrl('/favicon.svg', siteUrl),
			contentUrl: absoluteUrl('/favicon.svg', siteUrl),
			caption: 'LearnAI.nu',
		},
		areaServed: { '@type': 'Country', name: 'Danmark' },
		knowsLanguage: { '@type': 'Language', name: 'Dansk' },
		founder: { '@type': 'Person', '@id': personId },
	};
	const website: SchemaNode = {
		'@type': 'WebSite',
		'@id': websiteId,
		name: 'LearnAI.nu',
		url: homeUrl,
		inLanguage: schemaLanguage,
		publisher: { '@type': 'Organization', '@id': organizationId },
		// Lets Google offer a search box for the site directly in the results.
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${absoluteUrl('/search', siteUrl)}?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
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
			createPersonSchema(siteUrl),
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

/**
 * The person behind LearnAI as a reusable `Person` node.
 *
 * Search engines weigh who stands behind a page, so the same author node is
 * referenced from the organisation (as founder) and from every article.
 */
export function createPersonSchema(siteUrl: URL): SchemaNode {
	const homeUrl = absoluteUrl('/', siteUrl);
	return {
		'@type': 'Person',
		'@id': `${homeUrl}#person`,
		name: siteAuthor.name,
		jobTitle: siteAuthor.role,
		description: siteAuthor.summary,
		url: absoluteUrl(siteAuthor.href, siteUrl),
		worksFor: { '@type': 'Organization', '@id': `${homeUrl}#organization` },
		knowsAbout: [...siteAuthor.knowsAbout],
		hasCredential: siteAuthor.credentials.map((credential) => ({
			'@type': 'EducationalOccupationalCredential',
			credentialCategory: 'Professional Experience',
			name: credential,
		})),
		sameAs: [...siteAuthor.sameAs],
	};
}

export function createArticleSchema({
	canonicalUrl,
	type,
	headline,
	description,
	datePublished,
	dateModified,
	articleSection,
	keywords = [],
	image,
	imageAlt,
	wordCount,
	readingMinutes,
	citations = [],
	about = [],
	mentions = [],
}: ArticleSchemaOptions): SchemaNode {
	const homeUrl = absoluteUrl('/', canonicalUrl);
	const organizationId = `${homeUrl}#organization`;
	const imageUrl = image ? absoluteUrl(image, canonicalUrl) : null;
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
		...(articleSection ? { articleSection } : {}),
		...(keywords.length ? { keywords } : {}),
		...(imageUrl
			? {
				image: {
					'@type': 'ImageObject',
					url: imageUrl,
					contentUrl: imageUrl,
					...(imageAlt ? { caption: imageAlt } : {}),
				},
				thumbnailUrl: imageUrl,
			}
			: {}),
		...(typeof wordCount === 'number' && wordCount > 0 ? { wordCount } : {}),
		...(typeof readingMinutes === 'number' && readingMinutes > 0
			? { timeRequired: `PT${readingMinutes}M` }
			: {}),
		...(citations.length ? { citation: citations.map(createCitationNode) } : {}),
		...(about.length ? { about: about.map((name) => ({ '@type': 'Thing', name })) } : {}),
		...(mentions.length ? { mentions: mentions.map((name) => ({ '@type': 'Thing', name })) } : {}),
		// The author is the person; the publisher stays the organisation.
		author: { '@type': 'Person', '@id': `${homeUrl}#person`, name: siteAuthor.name },
		publisher: { '@type': 'Organization', '@id': organizationId },
	};
}

function createCitationNode(citation: ArticleCitation): SchemaNode {
	return {
		'@type': 'CreativeWork',
		name: citation.name,
		...(citation.url ? { url: citation.url } : {}),
		...(citation.author ? { author: { '@type': 'Person', name: citation.author } } : {}),
		...(citation.publisher ? { publisher: { '@type': 'Organization', name: citation.publisher } } : {}),
		...(citation.year ? { datePublished: citation.year } : {}),
	};
}

/** A `FAQPage` node — the questions must be visible on the page itself. */
export function createFaqSchema(canonicalUrl: URL, entries: FaqEntry[]): SchemaNode {
	return {
		'@type': 'FAQPage',
		'@id': `${canonicalUrl.toString()}#faq`,
		inLanguage: schemaLanguage,
		mainEntity: entries.map((entry) => ({
			'@type': 'Question',
			name: entry.question,
			acceptedAnswer: { '@type': 'Answer', text: entry.answer },
		})),
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
