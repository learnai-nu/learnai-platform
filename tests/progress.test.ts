import { describe, expect, it } from 'vitest';
import {
	calculateCourseProgress,
	continueLabel,
	findNextIncompleteLesson,
	sortCourseLessons,
	summariseStartedCourses,
	type CourseLesson,
} from '../src/lib/learning/progress';

const lessons: CourseLesson[] = [
	{ id: 'lesson-3', slug: 'tredje', moduleSortOrder: 2, lessonSortOrder: 1 },
	{ id: 'lesson-2', slug: 'anden', moduleSortOrder: 1, lessonSortOrder: 2 },
	{ id: 'lesson-1', slug: 'foerste', moduleSortOrder: 1, lessonSortOrder: 1 },
];

describe('course progress', () => {
	it('sorterer lektioner efter modul og lektion', () => {
		expect(sortCourseLessons(lessons).map((lesson) => lesson.id)).toEqual([
			'lesson-1',
			'lesson-2',
			'lesson-3',
		]);
	});

	it('returnerer 0 for et tomt kursus', () => {
		expect(calculateCourseProgress([], [])).toBe(0);
	});

	it('beregner afrundet kursusprogression og ignorerer fremmede lektioner', () => {
		expect(calculateCourseProgress(lessons, ['lesson-1', 'ukendt'])).toBe(33);
		expect(calculateCourseProgress(lessons, ['lesson-1', 'lesson-2'])).toBe(67);
	});

	it('finder den første ufærdige lektion i korrekt rækkefølge', () => {
		expect(findNextIncompleteLesson(lessons, ['lesson-1'])?.id).toBe('lesson-2');
	});

	it('returnerer null, når alle lektioner er færdige', () => {
		expect(findNextIncompleteLesson(lessons, lessons.map((lesson) => lesson.id))).toBeNull();
	});
});

describe('dashboardets kursusliste', () => {
	const courses = [
		{
			id: 'kursus-1',
			title: 'AI i praksis',
			slug: 'ai-i-praksis',
			moduleCount: 3,
			lessons: [
				{ id: 'l1', slug: 'en', moduleSortOrder: 1, lessonSortOrder: 1 },
				{ id: 'l2', slug: 'to', moduleSortOrder: 1, lessonSortOrder: 2 },
				{ id: 'l3', slug: 'tre', moduleSortOrder: 2, lessonSortOrder: 1 },
				{ id: 'l4', slug: 'fire', moduleSortOrder: 2, lessonSortOrder: 2 },
			],
		},
		{
			id: 'kursus-2',
			title: 'Prompting',
			slug: 'prompting',
			moduleCount: 1,
			lessons: [{ id: 'p1', slug: 'start', moduleSortOrder: 1, lessonSortOrder: 1 }],
		},
	];

	it('only lists courses the learner has actually started', () => {
		const summaries = summariseStartedCourses(courses, [
			{ lessonId: 'l1', completed: true, updatedAt: '2026-09-01T10:00:00Z' },
		]);
		expect(summaries.map((course) => course.slug)).toEqual(['ai-i-praksis']);
	});

	it('reports the same percentage and counts as the course page', () => {
		const [course] = summariseStartedCourses(courses, [
			{ lessonId: 'l1', completed: true, updatedAt: '2026-09-01T10:00:00Z' },
			{ lessonId: 'l2', completed: true, updatedAt: '2026-09-02T10:00:00Z' },
		]);
		expect(course).toMatchObject({ percent: 50, moduleCount: 3, lessonCount: 4, continueSlug: 'tre' });
	});

	it('counts a started but unfinished lesson as zero progress', () => {
		const [course] = summariseStartedCourses(courses, [
			{ lessonId: 'l1', completed: false, updatedAt: '2026-09-01T10:00:00Z' },
		]);
		expect(course!.percent).toBe(0);
		expect(course!.continueSlug).toBe('en');
	});

	it('points a finished course back at its first lesson', () => {
		const progress = courses[0]!.lessons.map((lesson) => ({
			lessonId: lesson.id,
			completed: true,
			updatedAt: '2026-09-03T10:00:00Z',
		}));
		const [course] = summariseStartedCourses(courses, progress);
		expect(course!.percent).toBe(100);
		expect(course!.continueSlug).toBe('en');
	});

	it('puts the most recently touched course first', () => {
		const summaries = summariseStartedCourses(courses, [
			{ lessonId: 'l1', completed: true, updatedAt: '2026-09-01T10:00:00Z' },
			{ lessonId: 'p1', completed: false, updatedAt: '2026-09-04T10:00:00Z' },
		]);
		expect(summaries.map((course) => course.slug)).toEqual(['prompting', 'ai-i-praksis']);
	});

	it('labels the action by how far the learner has come', () => {
		expect(continueLabel(0)).toBe('Start første lektion');
		expect(continueLabel(50)).toBe('Fortsæt kurset');
		expect(continueLabel(100)).toBe('Se kurset igen');
	});
});
