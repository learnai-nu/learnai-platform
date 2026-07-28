import { describe, expect, it } from 'vitest';
import {
	contentFormSchema,
	quizQuestionFormSchema,
} from '../src/lib/admin/contracts';
import {
	bodyToEditorText,
	editorTextToBody,
} from '../src/lib/admin/content';
import { hasSameOrigin } from '../src/lib/admin/security';
import { getContentManagerRole } from '../src/lib/auth/admin';

describe('admin authorization', () => {
	it('accepts only server-controlled content manager roles', () => {
		expect(getContentManagerRole({ app_metadata: { role: 'admin' } })).toBe('admin');
		expect(getContentManagerRole({ app_metadata: { role: 'editor' } })).toBe('editor');
		expect(getContentManagerRole({ user_metadata: { role: 'admin' } })).toBeNull();
		expect(getContentManagerRole({ app_metadata: { role: 'learner' } })).toBeNull();
	});

	it('requires an exact same-origin mutation', () => {
		const requestUrl = 'https://learnai.nu/api/admin/content/save';
		expect(hasSameOrigin(new Request(requestUrl, { headers: { Origin: 'https://learnai.nu' } }))).toBe(true);
		expect(hasSameOrigin(new Request(requestUrl, { headers: { Origin: 'https://example.com' } }))).toBe(false);
		expect(hasSameOrigin(new Request(requestUrl))).toBe(false);
	});
});

describe('admin content format', () => {
	it('preserves Markdown from the editor', () => {
		const editorText = [
			'## Kom godt i gang',
			'Et praktisk afsnit.',
			'> Kontrollér altid resultatet.',
			'- Første trin\n- Andet trin',
		].join('\n\n');
		const body = editorTextToBody(editorText);

		expect(body).toEqual({ format: 'markdown', markdown: editorText });
		expect(bodyToEditorText(body)).toBe(editorText);
	});
});

describe('admin form validation', () => {
	it('rejects invalid content slugs', () => {
		const result = contentFormSchema.safeParse({
			id: '',
			title: 'Ny guide',
			slug: 'Ny Guide',
			type: 'guide',
			status: 'draft',
			excerpt: '',
			bodyText: '',
			seoTitle: '',
			seoDescription: '',
		});
		expect(result.success).toBe(false);
	});

	it('accepts a bounded quiz question payload', () => {
		const result = quizQuestionFormSchema.safeParse({
			id: '',
			quizId: '7da53b88-d25f-4432-addb-32f3c83274ae',
			type: 'single_choice',
			question: 'Hvad er korrekt?',
			explanation: 'En forklaring.',
			points: '1',
			sortOrder: '0',
			options: [
				{ id: '', text: 'Svar A', isCorrect: true },
				{ id: '', text: 'Svar B', isCorrect: false },
			],
		});
		expect(result.success).toBe(true);
	});
});
