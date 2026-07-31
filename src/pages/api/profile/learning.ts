import type { APIRoute } from 'astro';
import { learningProfileSchema, splitProfileList } from '../../../lib/ai/contracts';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { hasSameOrigin } from '../../../lib/admin/security';

export const prerender = false;

function redirect(location: string) {
	return new Response(null, {
		status: 303,
		headers: { Location: location, 'Cache-Control': 'private, no-store, max-age=0' },
	});
}

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Ugyldig request.', { status: 403 });
	const supabase = createServerSupabaseClient(request, cookies);
	const { data: claimsData } = await supabase.auth.getClaims();
	const userId = claimsData?.claims?.sub;
	if (!userId) return redirect('/login?status=required');

	const formData = await request.formData();
	const parsed = learningProfileSchema.safeParse({
		displayName: formData.get('displayName') ?? '',
		jobTitle: formData.get('jobTitle') ?? '',
		company: formData.get('company') ?? '',
		industry: formData.get('industry') ?? '',
		experienceLevel: formData.get('experienceLevel'),
		learningGoals: splitProfileList(formData.get('learningGoals')),
		interests: splitProfileList(formData.get('interests')),
		preferredAiTools: splitProfileList(formData.get('preferredAiTools')),
	});
	if (!parsed.success) return redirect('/dashboard/profil?status=invalid');

	const input = parsed.data;
	const { error } = await supabase.from('profiles').update({
		display_name: input.displayName || null,
		job_title: input.jobTitle || null,
		company: input.company || null,
		industry: input.industry || null,
		experience_level: input.experienceLevel,
		learning_goals: input.learningGoals,
		interests: input.interests,
		preferred_ai_tools: input.preferredAiTools,
		onboarding_completed_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}).eq('id', userId);

	return redirect(error ? '/dashboard/profil?status=save-error' : '/mentor?status=profile-saved');
};
