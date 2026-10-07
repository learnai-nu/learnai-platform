import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ANALYTICS_EVENTS } from '../src/lib/analytics/events';

const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const siteLayout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const adminLayout = readFileSync(new URL('../src/layouts/AdminLayout.astro', import.meta.url), 'utf8');
const client = readFileSync(new URL('../src/scripts/analytics.ts', import.meta.url), 'utf8');
const mentor = readFileSync(new URL('../src/components/AIMentor.tsx', import.meta.url), 'utf8');
const compass = readFileSync(new URL('../src/components/WorkCompass.tsx', import.meta.url), 'utf8');
describe('LearnAI analytics', () => {
	it('loads first-party pageview and performance tracking from the shared layout', () => {
		expect(packageJson).toContain('"@vercel/analytics"');
		expect(packageJson).toContain('"@vercel/speed-insights"');
		expect(siteLayout).toContain("import Analytics from '@vercel/analytics/astro'");
		expect(siteLayout).toContain("import SpeedInsights from '@vercel/speed-insights/astro'");
		expect(siteLayout).toContain('{analytics && <Analytics />}');
		expect(siteLayout).toContain('{analytics && <SpeedInsights />}');
	});

	it('keeps administrative surfaces outside analytics', () => {
		expect(siteLayout).toContain('analytics?: boolean');
		expect(adminLayout).toContain('analytics={false}');
	});

	it('keeps custom event properties generic and limited', () => {
		expect(client).toContain('properties.source');
		expect(client).toContain('properties.detail');
		expect(client).not.toContain('textContent');
		expect(client).not.toContain('FormData');
		expect(client).not.toContain('.value');
	});

	it('tracks product use without sending user content or assessment results', () => {
		expect(mentor).toContain('track(ANALYTICS_EVENTS.aiMentorAnswered');
		expect(mentor).toContain('{ has_sources: parsed.data.sources.length > 0 }');
		expect(compass).toContain('track(ANALYTICS_EVENTS.workCompassCompleted, { locale })');
		expect(compass).not.toContain('track(ANALYTICS_EVENTS.workCompassCompleted, { answers');
	});

	it('uses a stable event vocabulary', () => {
		expect(Object.values(ANALYTICS_EVENTS)).toEqual([
			'primary_cta_clicked',
			'work_compass_completed',
			'ai_mentor_answered',
		]);
	});
});
