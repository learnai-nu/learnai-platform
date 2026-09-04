/**
 * The header is rendered on both prerendered and server-rendered pages, so the
 * signed-in state is resolved in the browser. Without JavaScript the header
 * keeps its "Log ind" link, which still does the right thing: /login redirects
 * an authenticated visitor on to the dashboard.
 */
import { createBrowserSupabaseClient } from '../lib/supabase/client';

const menus = [...document.querySelectorAll<HTMLElement>('[data-account-menu]')];

function nameFromEmail(email: string | undefined) {
	return email?.split('@')[0] ?? 'Din profil';
}

async function resolveAccount() {
	if (menus.length === 0) return;

	const supabase = createBrowserSupabaseClient();
	const { data, error } = await supabase.auth.getUser();
	const user = error ? null : data.user;
	if (!user) return;

	let name = nameFromEmail(user.email);
	const { data: profile } = await supabase
		.from('profiles')
		.select('display_name')
		.eq('id', user.id)
		.maybeSingle();
	if (profile?.display_name) name = profile.display_name;

	for (const menu of menus) {
		const label = menu.querySelector<HTMLElement>('[data-account-name]');
		if (label) label.textContent = name;
		menu.hidden = false;
		for (const anonymous of menu.parentElement?.querySelectorAll<HTMLElement>('[data-account-anonymous]') ?? []) {
			anonymous.hidden = true;
		}
	}
}

resolveAccount().catch(() => {
	/* Leave the anonymous header in place if Supabase cannot be reached. */
});
