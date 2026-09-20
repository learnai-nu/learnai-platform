import { describe, expect, it } from 'vitest';
import { completionRate, courseStatisticsSchema, totalCourseStatistics, type CourseStatistics } from '../src/lib/admin/course-statistics';

function course(overrides: Partial<CourseStatistics> = {}): CourseStatistics {
	return { id: '00000000-0000-4000-8000-000000000001', title: 'Kursus', enrolled: 0, notStarted: 0, inProgress: 0, completed: 0, completedEnrolled: 0, withoutEnrollment: 0, ...overrides };
}

describe('course statistics', () => {
	it('distinguishes no denominator from zero completions', () => {
		expect(completionRate(0, 0)).toBeNull();
		expect(completionRate(4, 0)).toBe(0);
		expect(completionRate(4, 1)).toBe(0.25);
	});

	it('weights conversion by enrollments and excludes activity without enrollment', () => {
		const total = totalCourseStatistics([
			course({ enrolled: 1, completed: 3, completedEnrolled: 1, withoutEnrollment: 2 }),
			course({ enrolled: 9, notStarted: 5, inProgress: 4 }),
		]);
		expect(total).toEqual({ enrolled: 10, notStarted: 5, inProgress: 4, completed: 3, completedEnrolled: 1, withoutEnrollment: 2 });
		expect(completionRate(total.enrolled, total.completedEnrolled)).toBe(0.1);
	});

	it('rejects malformed data instead of displaying misleading zeroes', () => {
		expect(courseStatisticsSchema.safeParse(null).success).toBe(false);
		expect(courseStatisticsSchema.safeParse([course({ enrolled: -1 })]).success).toBe(false);
		expect(courseStatisticsSchema.safeParse([course()]).success).toBe(true);
	});
});
