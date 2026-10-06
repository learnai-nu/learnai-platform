export const ANALYTICS_EVENTS = {
	primaryCtaClicked: 'primary_cta_clicked',
	workCompassCompleted: 'work_compass_completed',
	aiMentorAnswered: 'ai_mentor_answered',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
