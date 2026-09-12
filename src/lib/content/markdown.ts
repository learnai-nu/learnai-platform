import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const allowedTags = [
	'h1',
	'h2',
	'h3',
	'h4',
	'p',
	'ul',
	'ol',
	'li',
	'strong',
	'em',
	'del',
	'a',
	'blockquote',
	'pre',
	'code',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'figure',
	'figcaption',
	'img',
	'hr',
	'br',
];

export interface RenderMarkdownOptions {
	/**
	 * Give every heading a stable `id` so a table of contents can link to it and
	 * visitors can share a link straight to a section.
	 */
	headingIds?: boolean;
}

/** Slug that survives Danish letters, so anchors stay readable. */
export function slugifyHeading(text: string) {
	return text
		.toLowerCase()
		.replaceAll('æ', 'ae')
		.replaceAll('ø', 'oe')
		.replaceAll('å', 'aa')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

export function renderMarkdown(markdown: string, { headingIds = false }: RenderMarkdownOptions = {}) {
	const source = markdown.replace(/^[\u200B-\u200F\uFEFF]/, '');
	const rendered = marked.parse(source, {
		async: false,
		breaks: false,
		gfm: true,
	});

	if (typeof rendered !== 'string') return '';

	const withAnchors = headingIds ? addHeadingIds(rendered) : rendered;

	return sanitizeHtml(withAnchors, {
		allowedTags,
		allowedAttributes: {
			a: ['href', 'title', 'rel'],
			img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
			h2: ['id'],
			h3: ['id'],
			h4: ['id'],
			code: ['class'],
			th: ['align'],
			td: ['align'],
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowProtocolRelative: false,
		transformTags: {
			a: (_tagName, attributes) => ({
				tagName: 'a',
				attribs: {
					...attributes,
					rel: 'noopener noreferrer',
				},
			}),
			img: (_tagName, attributes) => ({
				tagName: 'img',
				attribs: {
					...attributes,
					loading: 'lazy',
					decoding: 'async',
				},
			}),
		},
	});
}

/** Duplicate headings get a numeric suffix so every anchor stays unique. */
function addHeadingIds(html: string) {
	const used = new Map<string, number>();
	return html.replace(/<(h[234])>([\s\S]*?)<\/\1>/g, (match, tag: string, inner: string) => {
		const text = inner.replace(/<[^>]*>/g, '').trim();
		const base = slugifyHeading(text);
		if (!base) return match;
		const seen = used.get(base) ?? 0;
		used.set(base, seen + 1);
		const id = seen === 0 ? base : `${base}-${seen + 1}`;
		return `<${tag} id="${id}">${inner}</${tag}>`;
	});
}
