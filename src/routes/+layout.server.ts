import { redirect } from '@sveltejs/kit';
import { decodeJwt } from '$lib/jwt';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['protected']

    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname.split("/").filter(Boolean)[0])) {
        throw redirect(302, '/login')
    }

    const currentUserToken = decodeJwt(locals.pb?.authStore.token || '');
    if (currentUserToken){
        let currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
        if (currentUser){
            if (currentUser.nonce) {
                const nonce = url.searchParams.get('nonce')
                const userToken = decodeJwt(currentUser.nonce)
                if (userToken.nonce === nonce) {
                    await locals.pb?.collection('users').update(currentUserToken.id, { nonce: '', credits: (currentUser.credits + userToken.credits)});
                    currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
                }
            }
            return {
                loggedIn: locals.pb?.authStore.isValid,
            }
        }
    }
    return {
        loggedIn: false
    }
};
