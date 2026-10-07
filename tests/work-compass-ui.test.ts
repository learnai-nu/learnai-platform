import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const component = readFileSync(new URL('../src/components/WorkCompass.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/work-compass.css', import.meta.url), 'utf8');

describe('AI work compass vertical slice', () => {
	it('supports keyboard focus, progress semantics, and reduced motion', () => {
		expect(component).toContain('headingRef.current?.focus({ preventScroll: true })');
		expect(component).toContain('role="progressbar"');
		expect(component).toContain('aria-pressed');
		expect(component).toContain("lang={locale === 'da' ? 'da' : 'en'}");
		expect(component).toContain('type="radio"');
		expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
	});

	it('provides transparent results and a three-step learning route', () => {
		expect(component).toContain('methodTitle');
		expect(component).toContain('learningOrder');
		expect(component).not.toContain('/kurser');
		expect(component).toContain('/mentor');
		expect(component).toContain('/laer');
		expect(styles).toContain('.work-compass-learning-plan');
	});

	it('lets learners take the result with them without persistence or a network call', () => {
		expect(component).toContain('navigator.clipboard.writeText');
		expect(component).toContain('window.print()');
		expect(component).toContain('aria-live="polite"');
		expect(component).not.toContain('localStorage');
		expect(component).not.toContain('fetch(');
		expect(styles).toContain('@media print');
	});

	it('uses the LearnAI workbook tokens instead of workshop brand colors', () => {
		expect(styles).toContain('--compass-blue: var(--orbit-primary)');
		expect(styles).toContain('--compass-yellow: var(--orbit-decision)');
		expect(styles).not.toContain('#ffff00');
	});
});
