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
		expect(html).toContain('<img src="x" loading="lazy" decoding="async" />');
		expect(html).not.toContain('href="javascript:');
		expect(html).not.toContain('onerror');
	});

	it('bevarer redaktionelle billeder med billedtekst og sikre attributter', () => {
		const html = renderMarkdown([
			'<figure>',
			'<img src="/images/guides/example.jpg" alt="En fagperson kontrollerer et udkast" width="1536" height="1024" onerror="alert(1)">',
			'<figcaption>Kontrollér udkastet mod kilden.</figcaption>',
			'</figure>',
		].join('\n'));

		expect(html).toContain('<figure>');
		expect(html).toContain('src="/images/guides/example.jpg"');
		expect(html).toContain('alt="En fagperson kontrollerer et udkast"');
		expect(html).toContain('width="1536" height="1024"');
		expect(html).toContain('loading="lazy" decoding="async"');
		expect(html).toContain('<figcaption>Kontrollér udkastet mod kilden.</figcaption>');
		expect(html).not.toContain('onerror');
	});

	it('formaterer Mentor-svar med fremhævelse og punktopstilling', () => {
		const html = renderMarkdown([
			'**Kort anbefaling:** Brug AI som støtte.',
			'',
			'- **Bevar fagligt tilsyn:** Kontrollér altid svaret.',
			'- **Beskyt oplysninger:** Del ikke persondata.',
		].join('\n'));

		expect(html).toContain('<p><strong>Kort anbefaling:</strong> Brug AI som støtte.</p>');
		expect(html).toContain('<ul>');
		expect(html).toContain('<li><strong>Bevar fagligt tilsyn:</strong> Kontrollér altid svaret.</li>');
		expect(html).not.toContain('**');
	});
});
