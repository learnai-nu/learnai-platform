import { describe, expect, it } from 'vitest';
import {
	calculateCourseProgress,
	findNextIncompleteLesson,
	sortCourseLessons,
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
