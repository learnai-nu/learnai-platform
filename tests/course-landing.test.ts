import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../src/pages/kurser/ai-i-praksis.astro', import.meta.url), 'utf8');
const script = readFileSync(new URL('../src/scripts/course-landing.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/course-landing.css', import.meta.url), 'utf8');
const featured = readFileSync(new URL('../src/components/marketing/FeaturedCourses.astro', import.meta.url), 'utf8');

describe('landingsside for det gratis kursus', () => {
	it('kører på SiteLayout i stedet for sit eget dokument', () => {
		expect(page).toContain("import SiteLayout from '../../layouts/SiteLayout.astro'");
		expect(page).toContain('<SiteLayout');
		expect(page).not.toContain('<!doctype html>');
		expect(page).not.toContain('<body');
		expect(page).not.toMatch(/<header class=/);
		expect(page).not.toMatch(/<footer class=/);
	});

	it('er indekserbar og beskrevet for søgemaskiner', () => {
		expect(page).not.toContain('noindex');
		expect(page).toContain('createCourseSchema');
		expect(page).toContain("'@type': 'FAQPage'");
		expect(page).toContain('breadcrumbs={[');
	});

	it('henter kursusindholdet fra Supabase frem for hårdkodede lektioner', () => {
		expect(page).toContain("createServerSupabaseClient(Astro.request, Astro.cookies)");
		expect(page).toContain(".from('courses')");
		expect(page).toContain("course_modules(title,sort_order,lessons(");
		expect(page).toContain("eq('status', 'published')");
		expect(page).toContain('courseLessonTitle');
		expect(page).toContain('courseLessonMinutes');
	});

	it('viser en besked frem for en tom liste, hvis indholdet mangler', () => {
		expect(page).toContain('const contentMissing =');
		expect(page).toContain('Kursusindholdet kunne ikke hentes');
	});

	it('sender besøgende videre til det rigtige kursus', () => {
		expect(page).toContain("const courseSlug = 'ai-i-praksis-dit-foerste-kursus'");
		expect(page).toContain('${coursePath}/lektioner/${firstLesson.slug}');
	});

	it('lover ikke længere at være et udkast', () => {
		for (const source of [page, script, styles]) {
			expect(source).not.toMatch(/designudkast|Lokal demo|\/udkast\//i);
		}
		expect(styles).not.toContain('draft-');
		expect(page).not.toContain('opretter ingen profil og sender ingen e-mail');
	});

	it('holder øvelsen ærlig om, hvad den gør', () => {
		expect(page).toContain('Intet sendes til AI');
		expect(page).toContain('Forberedt eksempel · Svaret ændres ikke af din prompt');
		expect(page).toContain('Øvelsen sender ikke prompten til AI');
	});

	it('lader øvelsen betjene med tastatur og lukke sig selv', () => {
		expect(script).toContain('showModal()');
		expect(script).toContain("dialog?.addEventListener('close'");
		expect(script).toContain('exerciseOpener?.focus');
		expect(page).toContain('data-close-exercise');
	});

	it('gør "Start kurset" til en synlig handling ved siden af øvelsen', () => {
		expect(page).toContain('class="landing-button landing-button-secondary"');
		expect(page).not.toContain('class="landing-text-link" href={coursePath}');
		expect(styles).toContain('.landing-button-secondary');
	});

	it('lader begge svar i øvelsen føre videre til kurset', () => {
		// Den, der gætter forkert, har mest at hente i lektionen.
		expect(script).toContain('finish.hidden = false;');
		expect(script).not.toContain('finish.hidden = !correct');
		expect(script).toContain('Det er præcis det, lektionen træner');
		expect(page).toContain('data-finish-label');
	});

	it('beskriver udbyttet frem for tilmeldingens trin', () => {
		expect(page).toContain('Prøv øvelsen med det samme');
		expect(page).toContain('Fortsæt hvor du slap');
		expect(page).not.toContain('Bekræft din e-mail');
		expect(page).not.toContain('Opret en gratis profil');
	});

	it('nummererer ikke fanerne, når standardvisningen er den anden', () => {
		expect(page).toContain('aria-controls="preview-mail">Mailtråden<');
		expect(page).toContain('aria-controls="preview-result">Overblikket<');
		expect(page).not.toMatch(/<span>0[12]<\/span> (Mailtråden|Overblikket)/);
	});

	it('lover det samme i slutafsnittets overskrift som i dens knap', () => {
		expect(page).toContain('Begynd med lektion 1.');
		expect(page).not.toContain('Prøv én opgave.<br />Se, hvad du lærer.');
	});

	it('sætter kursusfakta før handlingen på mobil', () => {
		expect(styles).toContain('.landing-hero-copy > .landing-hero-meta { order: 5; }');
		expect(styles).toContain('.landing-hero-copy > .landing-hero-actions { order: 6; }');
	});

	it('retter forsidens varighed, så den matcher kursusindholdet', () => {
		expect(featured).toContain("duration: '60 min.'");
		expect(featured).not.toContain("duration: '55 min.'");
	});
});
