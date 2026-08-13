import { describe, expect, it } from 'vitest';
import { learningProfileSchema, mentorRequestSchema, mentorResponseSchema, splitProfileList } from '../src/lib/ai/contracts';
import { buildMentorContext, buildMentorInstructions, extractFileCitations, extractResponseText, sourceUrl } from '../src/lib/ai/mentor';

describe('AI Mentor contracts', () => {
	it('accepts a bounded question and rejects oversized input', () => {
		expect(mentorRequestSchema.safeParse({ question: 'Hvad skal jeg lære?' }).success).toBe(true);
		expect(mentorRequestSchema.safeParse({ question: 'x'.repeat(1201) }).success).toBe(false);
	});

	it('accepts only internal LearnAI source URLs', () => {
		expect(mentorResponseSchema.safeParse({
			answer: 'Start her.',
			answerHtml: '<p>Start her.</p>',
			sources: [{ title: 'Guide', type: 'guide', url: '/laer/guide' }],
			remaining: 19,
		}).success).toBe(true);
		expect(mentorResponseSchema.safeParse({
			answer: 'Start her.',
			answerHtml: '<p>Start her.</p>',
			sources: [{ title: 'Guide', type: 'guide', url: 'https://example.com' }],
			remaining: 19,
		}).success).toBe(false);
		expect(mentorResponseSchema.safeParse({
			answer: 'Start her.',
			answerHtml: '<p>Start her.</p>',
			sources: [{ title: 'Rapport.pdf', type: 'videnskilde' }],
			remaining: 19,
		}).success).toBe(true);
	});

	it('normalizes unique comma- and newline-separated profile values', () => {
		expect(splitProfileList('ChatGPT, Claude\nChatGPT')).toEqual(['ChatGPT', 'Claude']);
	});

	it('bounds the personal learning profile', () => {
		expect(learningProfileSchema.safeParse({
			displayName: 'Jesper', jobTitle: 'Leder', company: 'LearnAI', industry: 'Uddannelse',
			experienceLevel: 'intermediate', learningGoals: ['Prompting'], interests: [], preferredAiTools: ['ChatGPT'],
		}).success).toBe(true);
	});
});

describe('AI Mentor grounding', () => {
	const source = { title: 'Promptguide', slug: 'promptguide', type: 'guide', excerpt: 'Praktisk prompting', body: { blocks: ['Indhold'] } };

	it('builds numbered context with internal links', () => {
		const context = buildMentorContext([source]);
		expect(context).toContain('[1] Promptguide');
		expect(context).toContain('/laer/promptguide');
		expect(sourceUrl('promptguide')).toBe('/laer/promptguide');
	});

	it('requires source-grounded Danish answers', () => {
		const instructions = buildMentorInstructions({ jobTitle: 'Leder', learningGoals: ['Automatisering'] }, true);
		expect(instructions).toContain('Brug kun fakta');
		expect(instructions).toContain('Henvis til kilder');
		expect(instructions).toContain('Knowledge Base');
		expect(instructions).toContain('Rolle: Leder');
	});

	it('extracts text from raw Responses API output', () => {
		expect(extractResponseText({ output: [{ content: [{ type: 'output_text', text: 'Svar' }] }] })).toBe('Svar');
		expect(extractResponseText({ output: [] })).toBeNull();
	});

	it('extracts and deduplicates file citations from Responses API output', () => {
		expect(extractFileCitations({
			output: [{ content: [{ annotations: [
				{ type: 'file_citation', filename: 'Rapport.pdf' },
				{ type: 'file_citation', filename: 'Rapport.pdf' },
				{ type: 'file_citation', filename: 'Guide.docx' },
			] }] }],
		})).toEqual(['Rapport.pdf', 'Guide.docx']);
	});
});
