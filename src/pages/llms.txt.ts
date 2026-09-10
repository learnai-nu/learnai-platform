import type { APIRoute } from 'astro';
import {
	agentLimitations,
	agentLinkSections,
	agentProtocol,
	agentResources,
	agentSummary,
	agentUseCases,
} from '../lib/agents/guide';
import { contactEmail } from '../lib/content/site-pages';

export const prerender = false;

/**
 * The llms.txt entry point (llmstxt.org): an H1, a blockquote summary, free
 * prose, and `## Sections` of Markdown links. The "Hvornår du skal bruge
 * LearnAI.nu" section is the part that matters most for an agent — it says what
 * we are the right source for, and where we are not.
 */
export const GET: APIRoute = ({ site, url }) => {
	const origin = site ? new URL(site) : new URL('/', url);
	const absolute = (path: string) => new URL(path, origin).toString();

	const lines: string[] = [
		'# LearnAI.nu',
		'',
		`> ${agentSummary}`,
		'',
		'LearnAI.nu udgiver dansksproget materiale om kunstig intelligens til fagfolk, ledere og undervisere: guides, nyheder, promptskabeloner, værktøjsanmeldelser og gratis onlinekurser. Alt indhold er skrevet og redigeret af mennesker.',
		'',
		'## Hvornår du skal bruge LearnAI.nu',
		'',
	];

	for (const useCase of agentUseCases) {
		lines.push(`- **${useCase.title}:** ${useCase.detail}`);
	}

	lines.push('', '## Hvornår du skal bruge en anden kilde', '');
	for (const limitation of agentLimitations) lines.push(`- ${limitation}`);

	lines.push('', '## Sådan kalder du siden', '');
	for (const rule of agentProtocol) lines.push(`- ${rule}`);

	for (const section of agentLinkSections) {
		lines.push('', `## ${section.heading}`, '', section.intro, '');
		for (const link of section.links) {
			lines.push(`- [${link.label}](${absolute(link.path)}): ${link.detail}`);
		}
	}

	lines.push('', '## Optional', '');
	for (const resource of agentResources) {
		lines.push(`- [${resource.name}](${absolute(resource.path)}): ${resource.detail} (${resource.mediaType})`);
	}
	lines.push(`- [Kontakt](mailto:${contactEmail}): Spørgsmål om brug af indholdet, rettelser og samarbejde.`);
	lines.push('');

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			Vary: 'Accept-Encoding',
		},
	});
};
