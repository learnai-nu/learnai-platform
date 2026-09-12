import { readFile } from 'node:fs/promises';
import { Resend } from 'resend';

const segmentName = 'LearnAI Ugebrief og podcast';
const [inputPath, mode] = process.argv.slice(2);

function fail(message) {
	throw new Error(message);
}

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function safeUrl(value, { learnAiOnly = false } = {}) {
	const url = new URL(value);
	if (url.protocol !== 'https:') fail('Alle links skal bruge HTTPS.');
	if (learnAiOnly && url.hostname !== 'learnai.nu') fail('Artikel- og podcastlinks skal pege på learnai.nu.');
	return url.toString();
}

function validateIssue(value) {
	if (!value || typeof value !== 'object') fail('Ugebrevet skal være et JSON-objekt.');
	if (!Number.isInteger(value.year) || value.year < 2026) fail('year er ugyldigt.');
	if (!Number.isInteger(value.week) || value.week < 1 || value.week > 53) fail('week er ugyldigt.');
	for (const key of ['subject', 'previewText', 'period', 'intro', 'topStory']) {
		if (typeof value[key] !== 'string' || !value[key].trim()) fail(`${key} mangler.`);
	}
	if (!Array.isArray(value.categories) || value.categories.length < 1 || value.categories.length > 6) {
		fail('categories skal indeholde 1–6 kategorier.');
	}
	for (const category of value.categories) {
		if (!category?.title || !category?.summary || !Array.isArray(category.stories)) fail('En kategori er ufuldstændig.');
		if (category.stories.length < 1 || category.stories.length > 5) fail('Hver kategori skal have 1–5 historier.');
		for (const story of category.stories) {
			if (!story?.title || !story?.summary) fail('En historie er ufuldstændig.');
			safeUrl(story.url, { learnAiOnly: true });
		}
	}
	if (!Array.isArray(value.sources) || value.sources.length < 1) fail('sources mangler.');
	for (const source of value.sources) {
		if (!source?.title || !source?.publisher) fail('En kilde er ufuldstændig.');
		safeUrl(source.url);
	}
	if (value.podcastUrl) safeUrl(value.podcastUrl, { learnAiOnly: true });
	if (value.issueUrl) safeUrl(value.issueUrl, { learnAiOnly: true });
	return value;
}

function renderIssue(issue) {
	const categoryHtml = issue.categories.map((category) => {
		const stories = category.stories.map((story) => `<li style="margin:0 0 16px"><a href="${escapeHtml(safeUrl(story.url, { learnAiOnly: true }))}" style="color:#0864c7;font-weight:700">${escapeHtml(story.title)}</a><br><span style="color:#45566a">${escapeHtml(story.summary)}</span></li>`).join('');
		return `<section style="margin:34px 0"><h2 style="font-family:Georgia,serif;font-size:25px;color:#172b46">${escapeHtml(category.title)}</h2><p>${escapeHtml(category.summary)}</p><ul style="padding-left:20px">${stories}</ul></section>`;
	}).join('');
	const sources = issue.sources.map((source) => `<li style="margin-bottom:8px"><a href="${escapeHtml(safeUrl(source.url))}" style="color:#0864c7">${escapeHtml(source.title)}</a> — ${escapeHtml(source.publisher)}</li>`).join('');
	const podcast = issue.podcastUrl ? `<p style="margin:30px 0"><a href="${escapeHtml(safeUrl(issue.podcastUrl, { learnAiOnly: true }))}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#0864c7;color:#fff;text-decoration:none;font-weight:700">Lyt til ugens podcast</a></p>` : '';
	const issueLink = issue.issueUrl ? `<p><a href="${escapeHtml(safeUrl(issue.issueUrl, { learnAiOnly: true }))}" style="color:#0864c7">Læs hele ugen på LearnAI.nu</a></p>` : '';
	const html = `<!doctype html><html lang="da"><body style="margin:0;background:#f4f1eb;color:#17211b;font-family:Arial,sans-serif;line-height:1.6"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(issue.previewText)}</div><main style="max-width:680px;margin:0 auto;padding:42px 24px;background:#fff"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#a96b22">LearnAI · uge ${issue.week} · ${escapeHtml(issue.period)}</p><h1 style="font-family:Georgia,serif;font-size:38px;line-height:1.08;color:#172b46">${escapeHtml(issue.topStory)}</h1><p style="font-size:18px;color:#45566a">Hej {{{contact.first_name|der}}},</p><p>${escapeHtml(issue.intro)}</p>${podcast}${categoryHtml}${issueLink}<hr style="border:0;border-top:1px solid #d9dde2;margin:36px 0"><h2 style="font-size:18px;color:#172b46">Kilder</h2><ul style="padding-left:20px;font-size:14px">${sources}</ul><p style="margin-top:36px;font-size:13px;color:#657181">Du modtager mailen, fordi du har bekræftet din tilmelding til LearnAI Ugebrief og podcast. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#657181">Afmeld eller ændr dine valg</a>.</p></main></body></html>`;

	const textCategories = issue.categories.map((category) => [category.title, category.summary, ...category.stories.map((story) => `- ${story.title}: ${story.summary}\n  ${safeUrl(story.url, { learnAiOnly: true })}`)].join('\n')).join('\n\n');
	const textSources = issue.sources.map((source) => `- ${source.title} — ${source.publisher}: ${safeUrl(source.url)}`).join('\n');
	const text = [`LearnAI · uge ${issue.week} · ${issue.period}`, '', issue.topStory, '', 'Hej,', '', issue.intro, issue.podcastUrl ? `\nLyt til ugens podcast: ${safeUrl(issue.podcastUrl, { learnAiOnly: true })}` : '', '', textCategories, issue.issueUrl ? `\nLæs hele ugen: ${safeUrl(issue.issueUrl, { learnAiOnly: true })}` : '', '', 'Kilder', textSources, '', 'Afmeld eller ændr dine valg: {{{RESEND_UNSUBSCRIBE_URL}}}'].filter(Boolean).join('\n');
	return { html, text };
}

async function ensureSegment(resend) {
	const listed = await resend.segments.list({ limit: 100 });
	if (listed.error) fail('Resend kunne ikke hente segmenter.');
	const existing = listed.data?.data.find((segment) => segment.name === segmentName);
	if (existing) return existing.id;
	const created = await resend.segments.create({ name: segmentName });
	if (created.error || !created.data?.id) fail('Resend kunne ikke oprette ugebrief-segmentet.');
	return created.data.id;
}

if (!inputPath) fail('Brug: node scripts/send-weekly-brief.mjs <issue.json> [--dry-run|--send]');
const issue = validateIssue(JSON.parse(await readFile(inputPath, 'utf8')));
const message = renderIssue(issue);
const broadcastName = `learnai-weekly-brief-${issue.year}-W${String(issue.week).padStart(2, '0')}`;

if (mode === '--dry-run') {
	console.log(JSON.stringify({ status: 'validated', broadcastName, categories: issue.categories.length, sources: issue.sources.length, hasPodcast: Boolean(issue.podcastUrl) }));
	process.exit(0);
}
if (mode !== '--send') fail('Vælg eksplicit --dry-run eller --send.');

const apiKey = process.env.RESEND_API_KEY?.trim();
const domain = process.env.RESEND_EMAIL_DOMAIN?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
if (!apiKey || !domain || !/^[a-z0-9.-]+$/i.test(domain)) fail('RESEND_API_KEY eller RESEND_EMAIL_DOMAIN mangler.');
const resend = new Resend(apiKey);
const existing = await resend.broadcasts.list({ limit: 100 });
if (existing.error) fail('Resend kunne ikke kontrollere tidligere udsendelser.');
const match = existing.data?.data.find((broadcast) => broadcast.name === broadcastName);
if (match && match.status !== 'draft') {
	console.log(JSON.stringify({ status: 'already_sent', broadcastName }));
	process.exit(0);
}
if (match?.id) {
	const sent = await resend.broadcasts.send(match.id);
	if (sent.error) fail('Resend kunne ikke sende den eksisterende kladde.');
	console.log(JSON.stringify({ status: 'sent', broadcastName }));
	process.exit(0);
}

const segmentId = await ensureSegment(resend);
const created = await resend.broadcasts.create({
	segmentId,
	name: broadcastName,
	from: `LearnAI <ugebrief@${domain}>`,
	replyTo: `hej@${domain}`,
	subject: issue.subject,
	previewText: issue.previewText,
	html: message.html,
	text: message.text,
	send: true,
}, { idempotencyKey: broadcastName });
if (created.error) fail('Resend afviste udsendelsen.');
console.log(JSON.stringify({ status: 'sent', broadcastName }));
