import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export type OutputType = { isLoggedIn: boolean };

export const load: LayoutServerLoad<OutputType> = async ({ locals, url }) => {
    const protectedRoutes = ['/protected']

    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname)) {
        throw redirect(302, '/login')
    }
    return {
            isLoggedIn: locals.pb?.authStore.isValid ? true : false,
    };
};
