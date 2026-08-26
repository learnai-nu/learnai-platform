export const challengeCoachCourseSlug = 'ai-i-praksis-dit-foerste-kursus';
export const challengeCoachLessonSlug = 'hvad-er-generativ-ai';

export const challengeCoachLessonTitle = 'Få sparring på en aktuel udfordring';
export const challengeCoachLessonDescription =
	'Beskriv noget, du står med lige nu. AI stiller tre opklarende spørgsmål, før du får et konkret forslag.';

export function isChallengeCoachLesson(courseSlug: string | undefined, lessonSlug: string | undefined) {
	return courseSlug === challengeCoachCourseSlug && lessonSlug === challengeCoachLessonSlug;
}

export function courseLessonTitle(courseSlug: string, lessonSlug: string, fallback: string) {
	return isChallengeCoachLesson(courseSlug, lessonSlug) ? challengeCoachLessonTitle : fallback;
}

export const challengeCoachFallbackBlocks = [
	{
		type: 'paragraph',
		text: 'Du behøver ikke begynde med et langt dokument eller en perfekt prompt. Tag i stedet udgangspunkt i en aktuel udfordring, hvor du har brug for et nyt perspektiv.',
	},
	{
		type: 'paragraph',
		text: 'Beskriv situationen med dine egne ord. AI stiller derefter tre spørgsmål for at forstå den bedre, før du får en anbefaling og et konkret første skridt.',
	},
	{
		type: 'callout',
		text: 'Undgå personfølsomme, fortrolige og kundespecifikke oplysninger. Beskriv roller og situationer generelt, hvis andre personer indgår.',
	},
];
