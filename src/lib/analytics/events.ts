export const ANALYTICS_EVENTS = {
	courseCtaClicked: 'course_cta_clicked',
	courseExerciseStarted: 'course_exercise_started',
	courseExerciseCompleted: 'course_exercise_completed',
	workCompassCompleted: 'work_compass_completed',
	aiMentorAnswered: 'ai_mentor_answered',
	lessonCompleted: 'lesson_completed',
	businessContactOpened: 'business_contact_opened',
	businessLeadSubmitted: 'business_lead_submitted',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
