import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/lib/content/markdown';

describe('sikker Markdown-rendering', () => {
	it('bevarer læringsindholdets centrale Markdown-format', () => {
		const html = renderMarkdown([
			'## Overskrift',
			'',
			'**Vigtigt** og [kilde](https://example.com).',
			'',
			'| A | B |',
			'| - | - |',
			'| 1 | 2 |',
		].join('\n'));

		expect(html).toContain('<h2>Overskrift</h2>');
		expect(html).toContain('<strong>Vigtigt</strong>');
		expect(html).toContain('<table>');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it('fjerner aktivt og usikkert HTML', () => {
		const html = renderMarkdown([
			'<script>alert(1)</script>',
			'<img src="x" onerror="alert(1)">',
			'[farligt](javascript:alert(1))',
		].join('\n'));

		expect(html).not.toContain('<script');
		expect(html).not.toContain('<img');
		expect(html).not.toContain('href="javascript:');
		expect(html).not.toContain('onerror');
	});
});
