import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (locals.authenticated) {
        if (locals.sessionRole === 'owner') {
            throw redirect(303, '/dashboard');
        }
        throw redirect(303, '/me/inbox');
    }

    const db = platform?.env?.DB;

    let requiresSetupToken = false;
    if (db) {
        try {
            const row = await db.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number | string | null }>();
            requiresSetupToken = Number(row?.count ?? 0) === 0;
        } catch {
            requiresSetupToken = false;
        }
    }

    return {
        turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
        requiresSetupToken
    };
};
