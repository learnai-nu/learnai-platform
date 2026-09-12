import { readFile, writeFile } from 'node:fs/promises';
import { Resend } from 'resend';

const segmentName = 'LearnAI Ugebrief og podcast';
const [inputPath, mode, previewPath] = process.argv.slice(2);

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
	for (const key of ['podcastTitle', 'podcastDuration', 'courseTitle', 'courseUrl']) {
		if (value[key] !== undefined && (typeof value[key] !== 'string' || !value[key].trim())) {
			fail(`${key} skal være en ikke-tom tekst.`);
		}
	}
	if (value.courseUrl) safeUrl(value.courseUrl, { learnAiOnly: true });
	return value;
}

function renderIssue(issue) {
	const categoryHtml = issue.categories.map((category, categoryIndex) => {
		const categoryNumber = String(categoryIndex + 1).padStart(2, '0');
		const stories = category.stories.map((story, storyIndex) => `<tr><td style="padding:${storyIndex === 0 ? '2px' : '20px'} 0 0;${storyIndex === 0 ? '' : 'border-top:1px solid #e7e5e3;'}"><h3 style="margin:0 0 7px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;font-weight:bold;color:#1c1b17;mso-line-height-rule:exactly;">${escapeHtml(story.title)}</h3><p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#57554f;mso-line-height-rule:exactly;">${escapeHtml(story.summary)}</p><p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;"><a href="${escapeHtml(safeUrl(story.url, { learnAiOnly: true }))}" style="color:#004fa6;text-decoration:none;font-weight:bold;">Læs historien &#8599;</a></p></td></tr>`).join('');
		return `<tr><td style="padding:0 32px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid #e7e5e3;padding:26px 0 6px;"><p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#004fa6;mso-line-height-rule:exactly;">${categoryNumber} &nbsp;${escapeHtml(category.title)}</p><h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:27px;font-weight:normal;color:#1c1b17;mso-line-height-rule:exactly;">${escapeHtml(category.summary)}</h2><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${stories}</table></td></tr></table></td></tr>`;
	}).join('');

	const sources = issue.sources.map((source) => `<tr><td style="padding:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#57554f;"><a href="${escapeHtml(safeUrl(source.url))}" style="color:#004fa6;text-decoration:underline;font-weight:bold;">${escapeHtml(source.title)}</a><br>${escapeHtml(source.publisher)}</td></tr>`).join('');
	const podcastTitle = issue.podcastTitle || 'Hør ugebrevet i stedet for at læse det';
	const podcastMeta = issue.podcastDuration ? ` &middot; ${escapeHtml(issue.podcastDuration)}` : '';
	const podcast = issue.podcastUrl ? `<tr><td style="padding:0 32px 34px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#fbf1dc" style="background-color:#fbf1dc;border:1px solid #1c1b17;"><tr><td style="padding:26px 26px 24px;"><p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#8a6534;mso-line-height-rule:exactly;">&gt; Podcast &middot; Afsnit ${issue.week}${podcastMeta}</p><h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:29px;font-weight:normal;color:#1c1b17;mso-line-height-rule:exactly;">${escapeHtml(podcastTitle)}</h2><p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#1c1b17;mso-line-height-rule:exactly;">Ugens vigtigste historier i et format, du kan tage med på vej til arbejde.</p><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#1c1b17" style="background-color:#1c1b17;border-radius:999px;"><a href="${escapeHtml(safeUrl(issue.podcastUrl, { learnAiOnly: true }))}" style="display:block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:19px;font-weight:bold;color:#ffffff;text-decoration:none;mso-line-height-rule:exactly;">&#9654;&nbsp; Lyt til afsnittet</a></td></tr></table></td></tr></table></td></tr>` : '';
	const issueLink = issue.issueUrl ? `<p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;"><a href="${escapeHtml(safeUrl(issue.issueUrl, { learnAiOnly: true }))}" style="color:#004fa6;text-decoration:none;font-weight:bold;">Læs hele ugen på LearnAI.nu &#8599;</a></p>` : '';
	const courseTitle = issue.courseTitle || 'Har du ikke taget det gratis kursus endnu?';
	const courseUrl = issue.courseUrl || 'https://learnai.nu/kurser/ai-i-praksis-dit-foerste-kursus';

	const html = `<!doctype html>
<html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(issue.subject)}</title><style>@media only screen and (max-width:620px){.wrap{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}.h1{font-size:28px!important;line-height:31px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#f5f3ee;"><span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(issue.previewText)}</span><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f5f3ee" style="background-color:#f5f3ee;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrap" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #1c1b17;">
<tr><td bgcolor="#f5f3ee" class="pad" style="background-color:#f5f3ee;padding:20px 32px;border-bottom:1px solid #e7e5e3;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="left" width="300" style="width:300px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="34" bgcolor="#1c1b17" align="center" valign="middle" style="width:34px;height:34px;background-color:#1c1b17;border-radius:3px;font-family:'Courier New',Courier,monospace;font-size:17px;line-height:34px;font-weight:bold;color:#ffffff;mso-line-height-rule:exactly;">&gt;_</td><td width="10" style="width:10px;">&nbsp;</td><td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:19px;line-height:24px;font-weight:bold;letter-spacing:-.5px;color:#1c1b17;mso-line-height-rule:exactly;">LearnAI<span style="color:#004fa6;">.nu</span></td></tr></table></td><td align="right" style="font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#57554f;mso-line-height-rule:exactly;">Ugebrief &middot; Uge ${issue.week}</td></tr></table></td></tr>
<tr><td class="pad" style="padding:38px 32px 26px;"><p style="margin:0 0 14px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#004fa6;mso-line-height-rule:exactly;">&gt; ${escapeHtml(issue.period)}</p><h1 class="h1" style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:37px;font-weight:normal;letter-spacing:-.5px;color:#1c1b17;mso-line-height-rule:exactly;">${escapeHtml(issue.topStory)}</h1><p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#1c1b17;mso-line-height-rule:exactly;">Hej {{{contact.first_name|der}}},</p><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#57554f;mso-line-height-rule:exactly;">${escapeHtml(issue.intro)}</p>${issueLink}</td></tr>
${categoryHtml}${podcast}
<tr><td class="pad" style="padding:0 32px 34px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid #e7e5e3;padding:26px 0 0;"><p style="margin:0 0 14px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#004fa6;">Kilder</p><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${sources}</table></td></tr></table></td></tr>
<tr><td bgcolor="#1c1b17" class="pad" style="background-color:#1c1b17;padding:30px 32px;"><p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#b98b4e;mso-line-height-rule:exactly;">Dit n&aelig;ste skridt</p><h2 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:29px;font-weight:normal;color:#ffffff;mso-line-height-rule:exactly;">${escapeHtml(courseTitle)}</h2><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:999px;"><a href="${escapeHtml(safeUrl(courseUrl, { learnAiOnly: true }))}" style="display:block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:19px;font-weight:bold;color:#1c1b17;text-decoration:none;mso-line-height-rule:exactly;">Start gratis &#8250;</a></td></tr></table></td></tr>
<tr><td class="pad" style="padding:26px 32px 34px;"><p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#57554f;mso-line-height-rule:exactly;">Du får denne mail, fordi du har bekræftet din tilmelding til LearnAI Ugebrief og podcast.</p><p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#57554f;mso-line-height-rule:exactly;"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#57554f;text-decoration:underline;">Afmeld</a> &nbsp;&middot;&nbsp; <a href="https://learnai.nu/privatliv" style="color:#57554f;text-decoration:underline;">Privatliv</a> &nbsp;&middot;&nbsp; <a href="https://learnai.nu/" style="color:#57554f;text-decoration:underline;">learnai.nu</a></p><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#57554f;mso-line-height-rule:exactly;">LearnAI.nu &middot; Jesper Schneider &middot; Danmark<br>&copy; ${issue.year} LearnAI.nu</p></td></tr>
</table></td></tr></table></body></html>`;

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

if (!inputPath) fail('Brug: node scripts/send-weekly-brief.mjs <issue.json> [--dry-run|--preview|--send] [preview.html]');
const issue = validateIssue(JSON.parse(await readFile(inputPath, 'utf8')));
const message = renderIssue(issue);
const broadcastName = `learnai-weekly-brief-${issue.year}-W${String(issue.week).padStart(2, '0')}`;

if (mode === '--dry-run') {
	console.log(JSON.stringify({ status: 'validated', broadcastName, categories: issue.categories.length, sources: issue.sources.length, hasPodcast: Boolean(issue.podcastUrl) }));
	process.exit(0);
}
if (mode === '--preview') {
	if (!previewPath) fail('Angiv en outputsti til HTML-previewet.');
	await writeFile(previewPath, message.html, 'utf8');
	console.log(JSON.stringify({ status: 'previewed', broadcastName, previewPath }));
	process.exit(0);
}
if (mode !== '--send') fail('Vælg eksplicit --dry-run, --preview eller --send.');

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
