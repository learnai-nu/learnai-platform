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

	it('retter forsidens varighed, så den matcher kursusindholdet', () => {
		expect(featured).toContain("duration: '60 min.'");
		expect(featured).not.toContain("duration: '55 min.'");
	});
});
