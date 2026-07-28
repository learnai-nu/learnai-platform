import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

const progressSchema = z.object({
	lessonId: z.uuid(),
	courseSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
	lessonSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
});

function redirectWithoutCache(location: string) {
	return new Response(null, {
		status: 303,
		headers: {
			Location: location,
			'Cache-Control': 'private, no-store, max-age=0',
		},
	});
}

export const POST: APIRoute = async ({ request, cookies }) => {
	const parsed = progressSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) return redirectWithoutCache('/kurser?status=invalid-progress');

	const { lessonId, courseSlug, lessonSlug } = parsed.data;
	const lessonUrl = `/kurser/${courseSlug}/lektioner/${lessonSlug}`;
	const supabase = createServerSupabaseClient(request, cookies);
	const { data: claimsData } = await supabase.auth.getClaims();
	const userId = claimsData?.claims?.sub;

	if (!userId) {
		return redirectWithoutCache(`/login?status=required`);
	}

	// Each lookup is made with the user's session. Existing RLS therefore decides
	// whether this user may access the lesson before any progress is written.
	const { data: lesson, error: lessonError } = await supabase
		.from('lessons')
		.select('id,module_id,slug')
		.eq('id', lessonId)
		.eq('slug', lessonSlug)
		.maybeSingle();

	if (lessonError || !lesson) {
		return redirectWithoutCache(`${lessonUrl}?status=not-allowed`);
	}

	const { data: courseModule, error: moduleError } = await supabase
		.from('course_modules')
		.select('course_id')
		.eq('id', lesson.module_id)
		.maybeSingle();

	if (moduleError || !courseModule) {
		return redirectWithoutCache(`${lessonUrl}?status=not-allowed`);
	}

	const { data: course, error: courseError } = await supabase
		.from('courses')
		.select('id,slug')
		.eq('id', courseModule.course_id)
		.eq('slug', courseSlug)
		.eq('status', 'published')
		.maybeSingle();

	if (courseError || !course) {
		return redirectWithoutCache(`${lessonUrl}?status=not-allowed`);
	}

	const now = new Date().toISOString();
	const { error: progressError } = await supabase.from('lesson_progress').upsert(
		{
			user_id: userId,
			lesson_id: lesson.id,
			completed: true,
			progress_percent: 100,
			completed_at: now,
			updated_at: now,
		},
		{ onConflict: 'user_id,lesson_id' },
	);

	if (progressError) {
		return redirectWithoutCache(`${lessonUrl}?status=save-error`);
	}

	return redirectWithoutCache(`/kurser/${course.slug}?status=lesson-completed`);
};
