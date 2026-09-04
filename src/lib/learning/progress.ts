export interface CourseLesson {
	id: string;
	slug: string;
	moduleSortOrder: number;
	lessonSortOrder: number;
}

export function sortCourseLessons(lessons: CourseLesson[]) {
	return [...lessons].sort(
		(a, b) =>
			a.moduleSortOrder - b.moduleSortOrder ||
			a.lessonSortOrder - b.lessonSortOrder ||
			a.id.localeCompare(b.id),
	);
}

export function calculateCourseProgress(lessons: CourseLesson[], completedLessonIds: Iterable<string>) {
	if (lessons.length === 0) return 0;

	const lessonIds = new Set(lessons.map((lesson) => lesson.id));
	const completedIds = new Set(completedLessonIds);
	const completedCount = [...completedIds].filter((id) => lessonIds.has(id)).length;

	return Math.round((completedCount / lessons.length) * 100);
}

export function findNextIncompleteLesson(
	lessons: CourseLesson[],
	completedLessonIds: Iterable<string>,
) {
	const completedIds = new Set(completedLessonIds);
	return sortCourseLessons(lessons).find((lesson) => !completedIds.has(lesson.id)) ?? null;
}

export interface DashboardCourseInput {
	id: string;
	title: string;
	slug: string;
	moduleCount: number;
	lessons: CourseLesson[];
}

export interface DashboardCourse {
	title: string;
	slug: string;
	moduleCount: number;
	lessonCount: number;
	percent: number;
	/** Where "Fortsæt kurset" goes: the next unfinished lesson, else the first. */
	continueSlug: string | null;
	lastActivity: string | null;
}

/**
 * The dashboard shows the courses a learner has actually started, with the same
 * progression the course page shows. Progress lives in lesson_progress, so a
 * course counts as started once any of its lessons has a row.
 */
export function summariseStartedCourses(
	courses: DashboardCourseInput[],
	progress: { lessonId: string; completed: boolean; updatedAt: string | null }[],
): DashboardCourse[] {
	const touched = new Map(progress.map((row) => [row.lessonId, row]));
	const completedLessonIds = progress.filter((row) => row.completed).map((row) => row.lessonId);

	return courses
		.flatMap<DashboardCourse>((course) => {
			if (!course.lessons.some((lesson) => touched.has(lesson.id))) return [];

			const activity = course.lessons
				.map((lesson) => touched.get(lesson.id)?.updatedAt ?? '')
				.filter((value) => value.length > 0)
				.sort();
			const next = findNextIncompleteLesson(course.lessons, completedLessonIds);

			return [{
				title: course.title,
				slug: course.slug,
				moduleCount: course.moduleCount,
				lessonCount: course.lessons.length,
				percent: calculateCourseProgress(course.lessons, completedLessonIds),
				continueSlug: (next ?? sortCourseLessons(course.lessons)[0])?.slug ?? null,
				lastActivity: activity.at(-1) ?? null,
			}];
		})
		.sort((a, b) => (b.lastActivity ?? '').localeCompare(a.lastActivity ?? ''));
}

export function continueLabel(percent: number) {
	if (percent === 0) return 'Start første lektion';
	if (percent === 100) return 'Se kurset igen';
	return 'Fortsæt kurset';
}
