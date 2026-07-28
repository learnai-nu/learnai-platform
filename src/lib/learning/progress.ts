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
