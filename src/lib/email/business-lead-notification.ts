import { Resend } from 'resend';
import { companySizeLabels, type BusinessLead } from '../leads/business';

type NotificationEnv = Pick<
	ImportMetaEnv,
	'PUBLIC_SITE_URL' | 'RESEND_API_KEY' | 'LEAD_NOTIFICATION_FROM' | 'LEAD_NOTIFICATION_TO'
>;

export type BusinessLeadNotification = {
	subject: string;
	text: string;
	html: string;
};

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

function adminLeadUrl(siteUrl?: string) {
	try {
		return new URL('/admin/leads', siteUrl || 'https://learnai.nu').toString();
	} catch {
		return 'https://learnai.nu/admin/leads';
	}
}

export function createBusinessLeadNotification(
	lead: BusinessLead,
	siteUrl?: string,
): BusinessLeadNotification {
	const role = lead.roleTitle || 'Ikke oplyst';
	const size = lead.companySize ? companySizeLabels[lead.companySize] : 'Ikke oplyst';
	const goal = lead.goal || 'Ikke oplyst';
	const adminUrl = adminLeadUrl(siteUrl);
	const subject = 'Ny virksomhedshenvendelse på LearnAI.nu';
	const text = [
		'Der er kommet en ny henvendelse fra virksomhedssiden.',
		'',
		`Navn: ${lead.name}`,
		`Arbejdsmail: ${lead.email}`,
		`Virksomhed: ${lead.company}`,
		`Rolle: ${role}`,
		`Størrelse: ${size}`,
		'',
		'Mål eller udfordring:',
		goal,
		'',
		`Åbn leadet i administrationen: ${adminUrl}`,
	].join('\n');
	const rows = [
		['Navn', lead.name],
		['Arbejdsmail', lead.email],
		['Virksomhed', lead.company],
		['Rolle', role],
		['Størrelse', size],
	]	.map(([label, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`)
		.join('');
	const html = `<!doctype html><html lang="da"><body style="font-family:Arial,sans-serif;color:#17211b"><h1 style="font-size:22px">Ny virksomhedshenvendelse</h1><p>Der er kommet en ny henvendelse fra virksomhedssiden.</p><table>${rows}</table><h2 style="font-size:17px;margin-top:24px">Mål eller udfordring</h2><p style="white-space:pre-wrap">${escapeHtml(goal)}</p><p style="margin-top:28px"><a href="${escapeHtml(adminUrl)}">Åbn leadet i administrationen</a></p></body></html>`;

	return { subject, text, html };
}

export async function businessLeadIdempotencyKey(lead: BusinessLead) {
	const payload = JSON.stringify([
		lead.name,
		lead.email,
		lead.company,
		lead.roleTitle,
		lead.companySize,
		lead.goal,
	]);
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
	const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
	return `business-lead/${hash}`;
}

export async function sendBusinessLeadNotification(
	lead: BusinessLead,
	env: NotificationEnv = import.meta.env,
): Promise<'sent' | 'skipped'> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.LEAD_NOTIFICATION_FROM?.trim();
	const to = env.LEAD_NOTIFICATION_TO?.split(',').map((address) => address.trim()).filter(Boolean);
	if (!apiKey || !from || !to?.length) return 'skipped';

	const message = createBusinessLeadNotification(lead, env.PUBLIC_SITE_URL);
	const resend = new Resend(apiKey);
	const { error } = await resend.emails.send(
		{
			from,
			to,
			replyTo: lead.email,
			subject: message.subject,
			text: message.text,
			html: message.html,
		},
		{ idempotencyKey: await businessLeadIdempotencyKey(lead) },
	);
	if (error) throw new Error('Resend afviste e-mailnotifikationen.');
	return 'sent';
}
