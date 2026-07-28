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
	'hr',
	'br',
];

export function renderMarkdown(markdown: string) {
	const source = markdown.replace(/^[\u200B-\u200F\uFEFF]/, '');
	const rendered = marked.parse(source, {
		async: false,
		breaks: false,
		gfm: true,
	});

	if (typeof rendered !== 'string') return '';

	return sanitizeHtml(rendered, {
		allowedTags,
		allowedAttributes: {
			a: ['href', 'title', 'rel'],
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
		},
	});
}
