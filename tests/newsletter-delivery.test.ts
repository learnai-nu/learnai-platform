import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function validIssue() {
	return {
		year: 2026,
		week: 36,
		subject: 'LearnAI – AI-nyheder uge 36, 2026',
		previewText: 'Ugens vigtigste AI-historier og podcast.',
		period: '31. august–6. september 2026',
		intro: 'Her er ugens dokumenterede overblik.',
		topStory: 'Ugens vigtigste historie',
		issueUrl: 'https://learnai.nu/laer',
		podcastUrl: 'https://learnai.nu/audio/news/2026/week-36/podcast.m4a',
		podcastTitle: 'Uge 36: modellerne flytter ind i arbejdet',
		podcastDuration: '8 min.',
		categories: [{
			title: 'Marketing',
			summary: 'Tre bevægelser er værd at følge.',
			stories: [{ title: 'En dokumenteret historie', summary: 'Kort betydning.', url: 'https://learnai.nu/laer/uge-36-marketing' }],
		}],
		sources: [{ title: 'Original kilde', publisher: 'OpenAI', url: 'https://openai.com/news/' }],
	};
}

function runDryIssue(issue: unknown) {
	const directory = mkdtempSync(join(tmpdir(), 'learnai-newsletter-'));
	temporaryDirectories.push(directory);
	const file = join(directory, 'issue.json');
	writeFileSync(file, JSON.stringify(issue));
	const result = spawnSync(process.execPath, ['scripts/send-weekly-brief.mjs', file, '--dry-run'], { encoding: 'utf8' });
	if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Ugebrevet blev afvist.');
	return result.stdout;
}

describe('weekly brief delivery contract', () => {
	it('validates a complete issue without contacting Resend', () => {
		const result = JSON.parse(runDryIssue(validIssue()));
		expect(result).toEqual({
			status: 'validated',
			broadcastName: 'learnai-weekly-brief-2026-W36',
			categories: 1,
			sources: 1,
			hasPodcast: true,
		});
	});

	it('requires the podcast link to point straight at a LearnAI audio file', () => {
		const issue = validIssue();
		issue.podcastUrl = 'https://learnai.nu/podcast';
		expect(() => runDryIssue(issue)).toThrow(/audio/);
		issue.podcastUrl = 'https://example.com/audio/podcast.m4a';
		expect(() => runDryIssue(issue)).toThrow(/learnai\.nu/);
	});

	it('still accepts issues that carry the old article links', () => {
		expect(() => runDryIssue(validIssue())).not.toThrow();
	});

	it('requires an explicit send flag before any external delivery', () => {
		const source = readFileSync('scripts/send-weekly-brief.mjs', 'utf8');
		expect(source).toContain("mode !== '--send'");
		expect(source).toContain("mode === '--dry-run'");
		expect(source).toContain("mode === '--preview'");
	});

	it('sends a private mail to WEEKLY_BRIEF_TO instead of a broadcast to subscribers', () => {
		const source = readFileSync('scripts/send-weekly-brief.mjs', 'utf8');
		expect(source).toContain('process.env.WEEKLY_BRIEF_TO');
		expect(source).toContain('resend.emails.send(');
		expect(source).not.toContain('broadcasts');
		expect(source).not.toContain('segments');
	});

	it('renders the supplied branded HTML as a safe dynamic preview', () => {
		const directory = mkdtempSync(join(tmpdir(), 'learnai-newsletter-preview-'));
		temporaryDirectories.push(directory);
		const input = join(directory, 'issue.json');
		const output = join(directory, 'issue.html');
		writeFileSync(input, JSON.stringify(validIssue()));
		const result = spawnSync(process.execPath, ['scripts/send-weekly-brief.mjs', input, '--preview', output], { encoding: 'utf8' });
		expect(result.status).toBe(0);
		const html = readFileSync(output, 'utf8');
		expect(html).toContain('LearnAI<span style="color:#004fa6;">.nu</span>');
		expect(html).toContain('Ugebrief &middot; Uge 36');
		expect(html).toContain('01 &nbsp;Marketing');
		expect(html).toContain('Uge 36: modellerne flytter ind i arbejdet');
		expect(html).toContain('href="https://learnai.nu/audio/news/2026/week-36/podcast.m4a"');
		expect(html).toContain('href="https://openai.com/news/"');
		// The site is closed: no links to article pages, the podcast page or the course.
		expect(html).not.toContain('href="https://learnai.nu/laer');
		expect(html).not.toContain('href="https://learnai.nu/podcast"');
		expect(html).not.toContain('/kurser/');
		expect(html).not.toContain('RESEND_UNSUBSCRIBE_URL');
		expect(html).not.toContain('Postadresse indsættes');
	});
});
