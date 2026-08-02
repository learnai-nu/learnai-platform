import type { LearningProfileInput } from './contracts';

export interface LearningSource {
	title: string;
	slug: string;
	type: string;
	excerpt: string | null;
	body: unknown;
}

interface OpenAIAnnotation {
	type?: string;
	filename?: string;
}

interface OpenAIContentPart {
	text?: string;
	annotations?: OpenAIAnnotation[];
}

export function sourceUrl(slug: string) {
	return `/laer/${encodeURIComponent(slug)}`;
}

function compactBody(body: unknown, maxLength = 3200) {
	const text = typeof body === 'string' ? body : JSON.stringify(body);
	return text.replace(/\s+/g, ' ').slice(0, maxLength);
}

export function buildMentorContext(sources: LearningSource[]) {
	return sources.map((source, index) => [
		`[${index + 1}] ${source.title}`,
		`Type: ${source.type}`,
		`URL: ${sourceUrl(source.slug)}`,
		`Resumé: ${source.excerpt ?? 'Intet resumé'}`,
		`Indhold: ${compactBody(source.body)}`,
	].join('\n')).join('\n\n');
}

export function buildMentorInstructions(profile: Partial<LearningProfileInput>, knowledgeBaseEnabled = false) {
	const profileLines = [
		profile.jobTitle && `Rolle: ${profile.jobTitle}`,
		profile.industry && `Branche: ${profile.industry}`,
		profile.experienceLevel && `AI-niveau: ${profile.experienceLevel}`,
		profile.learningGoals?.length && `Læringsmål: ${profile.learningGoals.join(', ')}`,
		profile.interests?.length && `Interesser: ${profile.interests.join(', ')}`,
		profile.preferredAiTools?.length && `Værktøjer: ${profile.preferredAiTools.join(', ')}`,
	].filter(Boolean).join('\n');

	const grounding = knowledgeBaseEnabled
		? `Brug kun fakta fra den vedlagte LearnAI-kontekst og dokumenter fundet via LearnAI Knowledge Base. Søg altid i Knowledge Basen før du svarer. Hvis kilderne ikke er tilstrækkelige, sig det tydeligt.
Henvis til kilder fra den vedlagte kontekst med [1], [2] osv., og nævn dokumentkilder ved filnavn.`
		: `Brug kun fakta fra den vedlagte LearnAI-kontekst. Hvis konteksten ikke er tilstrækkelig, sig det tydeligt.
Henvis til kilder med [1], [2] osv.`;

	return `Du er LearnAI Mentor for danske vidensmedarbejdere. Svar på dansk, konkret og venligt.
${grounding}
Opfind aldrig kilder, links, funktioner eller produktfakta.
Giv en kort anbefaling, 2-4 konkrete næste skridt og relevante kildehenvisninger.
Fortæl ikke, at du har adgang til private data. Giv ikke juridisk, medicinsk eller finansiel ekspertrådgivning.

Brugerprofil:
${profileLines || 'Ingen personlig profil endnu.'}`;
}

export function extractResponseText(payload: unknown) {
	if (!payload || typeof payload !== 'object') return null;
	const record = payload as Record<string, unknown>;
	if (typeof record.output_text === 'string' && record.output_text.trim()) {
		return record.output_text.trim();
	}
	if (!Array.isArray(record.output)) return null;
	const parts: string[] = [];
	for (const item of record.output) {
		if (!item || typeof item !== 'object') continue;
		const content = (item as Record<string, unknown>).content;
		if (!Array.isArray(content)) continue;
		for (const part of content) {
			if (!part || typeof part !== 'object') continue;
			const text = (part as Record<string, unknown>).text;
			if (typeof text === 'string') parts.push(text);
		}
	}
	return parts.join('\n').trim() || null;
}

export function extractFileCitations(payload: unknown) {
	if (!payload || typeof payload !== 'object') return [];
	const output = (payload as Record<string, unknown>).output;
	if (!Array.isArray(output)) return [];
	const filenames = new Set<string>();
	for (const item of output) {
		if (!item || typeof item !== 'object') continue;
		const content = (item as Record<string, unknown>).content;
		if (!Array.isArray(content)) continue;
		for (const rawPart of content) {
			if (!rawPart || typeof rawPart !== 'object') continue;
			const part = rawPart as OpenAIContentPart;
			for (const annotation of part.annotations ?? []) {
				if (annotation.type === 'file_citation' && annotation.filename?.trim()) {
					filenames.add(annotation.filename.trim());
				}
			}
		}
	}
	return [...filenames];
}

export async function safetyIdentifier(userId: string) {
	const bytes = new TextEncoder().encode(`learnai:${userId}`);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
