import { describe, expect, it } from 'vitest';
import { extractArticleNarration } from '../scripts/generate-article-audio.mjs';

describe('article audio generation', () => {
	it('extracts the published title and article body without surrounding furniture', () => {
		const html = `<!doctype html><html><body><article>
			<h1>Sådan bruger du AI</h1>
			<div class="article-body"><h2>Første skridt</h2><p>Begynd med en lille opgave.</p><figure><img src="x"><figcaption>Skærmbillede</figcaption></figure></div>
			<section class="article-sources"><h2>Kilder</h2><p>Skal ikke læses op.</p></section>
		</article></body></html>`;
		const narration = extractArticleNarration(html);
		expect(narration).toContain('Sådan bruger du AI.');
		expect(narration).toContain('Første skridt');
		expect(narration).toContain('Begynd med en lille opgave.');
		expect(narration).not.toContain('Skal ikke læses op');
		expect(narration).not.toContain('Skærmbillede');
	});

	it('rejects pages without a recognizable article body', () => {
		expect(() => extractArticleNarration('<html><body>' + 'x'.repeat(300) + '</body></html>')).toThrow('ikke fundet');
	});
});
