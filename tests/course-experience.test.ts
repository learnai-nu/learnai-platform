import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const coursePage = readFileSync(new URL('../src/pages/kurser/[slug].astro', import.meta.url), 'utf8');
const lessonPage = readFileSync(
	new URL('../src/pages/kurser/[courseSlug]/lektioner/[lessonSlug].astro', import.meta.url),
	'utf8',
);
const styles = readFileSync(new URL('../src/styles/course-experience.css', import.meta.url), 'utf8');
const challengeCoach = readFileSync(new URL('../src/components/ChallengeCoach.tsx', import.meta.url), 'utf8');
const challengeApi = readFileSync(new URL('../src/pages/api/ai/challenge-coach.ts', import.meta.url), 'utf8');

describe('AI i praksis course experience', () => {
	it('turns the existing course data into a three-step practical learning route', () => {
		expect(coursePage).toContain("{ label: 'Forstå', description: 'Se hvad AI kan' }");
		expect(coursePage).toContain('const journeySteps = sortedModules.map');
		expect(coursePage).toContain('aria-label="Kursets læringstrin"');
		expect(coursePage).toContain('Du går herfra med');
		expect(coursePage).toContain('course-module-list');
		expect(coursePage).toContain('module.lessons.reduce');
		expect(coursePage).toContain('completedLessonIds.has');
	});

	it('keeps authentication, stored progress, and course data server-side', () => {
		expect(coursePage).toContain('createServerSupabaseClient');
		expect(coursePage).toContain('supabase.auth.getClaims()');
		expect(coursePage).toContain(".from('lesson_progress')");
		expect(lessonPage).toContain('createServerSupabaseClient');
		expect(lessonPage).toContain("action=\"/api/progress/complete\"");
		expect(lessonPage).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
	});

	it('adds a copyable prompt workbench with an accessible fallback', () => {
		expect(lessonPage).toContain('data-prompt-workbench');
		expect(lessonPage).toContain('navigator.clipboard.writeText(prompt)');
		expect(lessonPage).toContain('aria-live="polite"');
		expect(lessonPage).toContain('Markér teksten og kopiér den manuelt.');
	});

	it('provides sequential lesson navigation and responsive workbook styling', () => {
		expect(lessonPage).toContain('previousSequentialLesson');
		expect(lessonPage).toContain('nextSequentialLesson');
		expect(lessonPage).toContain('aria-label="Navigér mellem lektioner"');
		expect(styles).toContain('.prompt-workbench');
		expect(styles).toContain('@media (max-width: 640px)');
		expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
	});

	it('adds a private, three-question challenge dialogue to the first lesson', () => {
		expect(lessonPage).toContain('ChallengeCoach');
		expect(challengeCoach).toContain('Stil mig tre spørgsmål');
		expect(challengeCoach).toContain('Spørgsmål {questionIndex + 1} af 3');
		expect(challengeCoach).toContain('LearnAI gemmer ikke samtalen i din profil');
		expect(challengeCoach).toContain('Teksten behandles hos OpenAI');
		expect(challengeCoach).toContain('setClarifications(previousClarifications)');
		expect(challengeCoach).toContain('Dit svar er bevaret – prøv igen.');
		expect(challengeCoach).toContain("void submitAnswer('Det ved jeg ikke endnu.')");
		expect(challengeApi).toContain("store: false");
		expect(challengeApi).toContain("if (!userId)");
		expect(challengeApi).toContain("consume_ai_mentor_quota");
		expect(styles).toContain('.challenge-coach-steps');
		expect(styles).toContain('repeat(auto-fit, minmax(min(100%, 14rem), 1fr))');
	});
});
