import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { generateElevenLabsAudio } from './generate-weekly-podcast.mjs';

function decodeToSpeech(html) {
	const preparedHtml = html
		.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, ' ')
		.replace(/<\/?(?:h[1-6]|p|li|ul|ol|blockquote)\b[^>]*>/gi, '\n');
	return sanitizeHtml(preparedHtml, {
		allowedTags: [],
		allowedAttributes: {},
		exclusiveFilter: (frame) => ['script', 'style', 'code', 'pre'].includes(frame.tag),
	})
		.replace(/https?:\/\/\S+/g, '')
		.replace(/\s+([,.!?;:])/g, '$1')
		.replace(/([.!?])\s*/g, '$1\n')
		.replace(/[ \t]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export function extractArticleNarration(html) {
	if (typeof html !== 'string' || html.length < 200) throw new Error('Artikelsiden er tom eller uventet kort.');
	const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
	const bodyMarker = html.search(/class=["'][^"']*\barticle-body\b/i);
	if (!titleMatch || bodyMarker < 0) throw new Error('Artiklens titel eller brødtekst blev ikke fundet.');
	const bodyStart = html.lastIndexOf('<div', bodyMarker);
	const tail = html.slice(bodyMarker);
	const boundaryMatch = tail.match(/<(?:section|div)[^>]*class=["'][^"']*\b(?:article-faq|article-sources|article-author|article-related)\b/i);
	const bodyEnd = boundaryMatch ? bodyMarker + (boundaryMatch.index ?? tail.length) : html.indexOf('</article>', bodyMarker);
	const title = decodeToSpeech(titleMatch[1]);
	const body = decodeToSpeech(html.slice(bodyStart, bodyEnd > bodyStart ? bodyEnd : undefined));
	const narration = `${title}.\n\n${body}`.replace(/\n{3,}/g, '\n\n').trim();
	if (narration.length > 10_000) {
		throw new Error(`Den rensede artikel er ${narration.length} tegn. Del den i afsnit før generering med Multilingual v2.`);
	}
	return narration;
}

export async function generateArticleAudio({ url, outputPath, narrationPath, fetchImpl = fetch }) {
	const articleUrl = new URL(url);
	if (articleUrl.protocol !== 'https:' || !['learnai.nu', 'www.learnai.nu'].includes(articleUrl.hostname)) {
		throw new Error('Kilden skal være en offentlig HTTPS-side på learnai.nu.');
	}
	const response = await fetchImpl(articleUrl, { headers: { accept: 'text/html' } });
	if (!response.ok) throw new Error(`Artiklen kunne ikke hentes (HTTP ${response.status}).`);
	const narration = extractArticleNarration(await response.text());
	if (narrationPath) await writeFile(narrationPath, `${narration}\n`, { flag: 'wx' });
	return generateElevenLabsAudio({ text: narration, outputPath, fetchImpl });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
	const [url, outputPath, narrationPath] = process.argv.slice(2).filter((argument, index) => index !== 0 || argument !== '--');
	generateArticleAudio({ url, outputPath, narrationPath })
		.then((result) => console.log(JSON.stringify(result)))
		.catch((error) => {
			console.error(error instanceof Error ? error.message : 'Artikeloplæsningen fejlede.');
			process.exitCode = 1;
		});
}
