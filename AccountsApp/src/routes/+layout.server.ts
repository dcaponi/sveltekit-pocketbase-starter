import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['/protected']

    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname)) {
        throw redirect(302, '/login')
    }
};
