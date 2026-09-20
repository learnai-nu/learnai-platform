import { z } from 'zod';

const count = z.number().int().nonnegative();
export const courseStatisticsSchema = z.array(z.object({
	id: z.uuid(),
	title: z.string(),
	enrolled: count,
	notStarted: count,
	inProgress: count,
	completed: count,
	completedEnrolled: count,
	withoutEnrollment: count,
}));

export type CourseStatistics = z.infer<typeof courseStatisticsSchema>[number];

export function completionRate(enrolled: number, completedEnrolled: number) {
	return enrolled === 0 ? null : completedEnrolled / enrolled;
}

export function totalCourseStatistics(courses: CourseStatistics[]) {
	return courses.reduce((total, course) => ({
		enrolled: total.enrolled + course.enrolled,
		notStarted: total.notStarted + course.notStarted,
		inProgress: total.inProgress + course.inProgress,
		completed: total.completed + course.completed,
		completedEnrolled: total.completedEnrolled + course.completedEnrolled,
		withoutEnrollment: total.withoutEnrollment + course.withoutEnrollment,
	}), { enrolled: 0, notStarted: 0, inProgress: 0, completed: 0, completedEnrolled: 0, withoutEnrollment: 0 });
}
