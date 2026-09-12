import { Resend } from 'resend';

export const weeklyBriefSegmentName = 'LearnAI Ugebrief og podcast';

type WeeklyBriefEnv = Pick<
	ImportMetaEnv,
	'PUBLIC_SITE_URL' | 'RESEND_API_KEY' | 'RESEND_EMAIL_DOMAIN'
>;

type SegmentClient = Pick<Resend, 'segments' | 'contacts'>;

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function siteUrl(value?: string) {
	try {
		return new URL(value || 'https://learnai.nu').origin;
	} catch {
		return 'https://learnai.nu';
	}
}

function sender(domain?: string) {
	const normalized = domain?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
	if (!normalized || !/^[a-z0-9.-]+$/i.test(normalized)) return null;
	return `LearnAI <ugebrief@${normalized}>`;
}

export async function sha256(value: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createOpaqueToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createConfirmationMessage(token: string, firstName: string | null, baseUrl?: string) {
	const confirmUrl = new URL('/ugebrief/bekraeft', siteUrl(baseUrl));
	confirmUrl.searchParams.set('token', token);
	const greeting = firstName ? `Hej ${firstName}` : 'Hej';
	const subject = 'Bekræft dit LearnAI-ugebrief';
	const text = [
		greeting,
		'',
		'Bekræft, at du vil modtage LearnAI Ugebrief og podcast hver mandag:',
		confirmUrl.toString(),
		'',
		'Linket virker i 24 timer. Hvis du ikke har tilmeldt dig, kan du ignorere denne mail.',
	].join('\n');
	const html = `<!doctype html><html lang="da"><body style="margin:0;background:#f4f1eb;color:#172b46;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:40px 24px"><p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a96b22">LearnAI ugebrief</p><h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.08">Bekræft din tilmelding</h1><p>${escapeHtml(greeting)}</p><p>Bekræft, at du vil modtage LearnAI Ugebrief og podcast hver mandag.</p><p style="margin:30px 0"><a href="${escapeHtml(confirmUrl.toString())}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#0864c7;color:#fff;text-decoration:none;font-weight:700">Bekræft tilmelding</a></p><p style="font-size:14px;color:#526170">Linket virker i 24 timer. Hvis du ikke har tilmeldt dig, kan du ignorere denne mail.</p></div></body></html>`;
	return { subject, text, html };
}

export async function sendWeeklyBriefConfirmation(
	input: { email: string; firstName: string | null; token: string },
	env: WeeklyBriefEnv = import.meta.env,
) {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = sender(env.RESEND_EMAIL_DOMAIN);
	if (!apiKey || !from) return 'skipped' as const;

	const resend = new Resend(apiKey);
	const message = createConfirmationMessage(input.token, input.firstName, env.PUBLIC_SITE_URL);
	const { error } = await resend.emails.send(
		{ from, to: input.email, ...message },
		{ idempotencyKey: `weekly-brief-confirm/${await sha256(`${input.email}/${input.token}`)}` },
	);
	if (error) throw new Error('Resend afviste bekræftelsesmailen.');
	return 'sent' as const;
}

export async function ensureWeeklyBriefSegment(client: SegmentClient) {
	const listed = await client.segments.list({ limit: 100 });
	if (listed.error) throw new Error('Resend kunne ikke hente segmenter.');
	const existing = listed.data?.data.find((segment) => segment.name === weeklyBriefSegmentName);
	if (existing) return existing.id;

	const created = await client.segments.create({ name: weeklyBriefSegmentName });
	if (created.error || !created.data?.id) throw new Error('Resend kunne ikke oprette ugebrief-segmentet.');
	return created.data.id;
}

export async function syncWeeklyBriefContact(
	input: { email: string; firstName: string | null },
	env: Pick<ImportMetaEnv, 'RESEND_API_KEY'> = import.meta.env,
) {
	const apiKey = env.RESEND_API_KEY?.trim();
	if (!apiKey) throw new Error('RESEND_API_KEY mangler.');
	const resend = new Resend(apiKey);
	const segmentId = await ensureWeeklyBriefSegment(resend);
	const existing = await resend.contacts.get({ email: input.email });

	if (!existing.error && existing.data?.id) {
		const updated = await resend.contacts.update({
			email: input.email,
			firstName: input.firstName,
			unsubscribed: false,
		});
		if (updated.error) throw new Error('Resend kunne ikke opdatere kontakten.');
		const added = await resend.contacts.segments.add({ email: input.email, segmentId });
		if (added.error) throw new Error('Resend kunne ikke tilføje kontakten til ugebrief-segmentet.');
		return existing.data.id;
	}

	const created = await resend.contacts.create({
		email: input.email,
		firstName: input.firstName ?? undefined,
		unsubscribed: false,
		segments: [{ id: segmentId }],
	});
	if (created.error || !created.data?.id) throw new Error('Resend kunne ikke oprette kontakten.');
	return created.data.id;
}
