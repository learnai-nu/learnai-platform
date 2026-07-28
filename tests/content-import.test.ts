import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('backup-import', () => {
	it('vælger kun publiceret dansk indhold og udelukker kontodata', () => {
		const directory = mkdtempSync(resolve(tmpdir(), 'learnai-import-'));
		const backupPath = resolve(directory, 'backup.json');
		const outputPath = resolve(directory, 'out');
		writeFileSync(backupPath, JSON.stringify({
			exported_at: '2026-07-28T12:34:00.399Z',
			articles: [
				{
					id: 'article-1',
					title: 'Dansk guide',
					slug: 'dansk-guide',
					intro: 'Kort intro',
					content: '## Guide\n\nIndhold',
					type: 'guide',
					category: 'AI-grundlag',
					tags: ['AI'],
					difficulty: 'begynder',
					locale: 'da',
					published: true,
					published_at: '2026-01-01T00:00:00Z',
				},
				{
					id: 'article-2',
					title: 'English guide',
					slug: 'english-guide',
					content: 'English',
					type: 'guide',
					locale: 'en',
					published: true,
				},
			],
			prompts: [
				{
					id: 'prompt-1',
					title: 'Mødereferat',
					slug: 'moedereferat',
					description: 'Lav et referat.',
					prompt_text: 'Skriv et referat af [noter].',
					ai_tool: 'ChatGPT',
					category_slug: 'Møder',
					difficulty: 'begynder',
					variables: [],
					locale: 'da',
					published: true,
				},
			],
			quiz_results: [{ email: 'skal-ikke-importeres@example.com' }],
			user_roles: [{ user_id: 'skal-ikke-importeres' }],
		}), 'utf8');

		execFileSync(process.execPath, [
			resolve(process.cwd(), 'scripts', 'prepare-content-import.mjs'),
			backupPath,
			outputPath,
		]);

		const report = JSON.parse(readFileSync(resolve(outputPath, 'report.json'), 'utf8'));
		const sql = readFileSync(resolve(outputPath, 'batch-001.sql'), 'utf8');
		expect(report.selection).toEqual({ articles: 1, prompts: 1, total: 2 });
		expect(report.excluded_sensitive_data).toEqual({ quiz_results: 1, user_roles: 1 });
		expect(sql).toContain('learnai-backup:article:article-1');
		expect(sql).toContain('learnai-backup:prompt:prompt-1');
		expect(sql).toContain("values ('AI', 'ai')");
		expect(sql).not.toContain('skal-ikke-importeres@example.com');
		expect(sql).not.toContain('skal-ikke-importeres');
	});
});
