import { redirect } from '@sveltejs/kit';
import { decodeJwt, validateJwt } from '$lib/jwt';
import type { LayoutServerLoad } from './$types';
import { VITE_NONCE_SIGNING_SECRET } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['/protected']

    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname)) {
        throw redirect(302, '/login')
    }

    const currentUserToken = decodeJwt(locals.pb?.authStore.token || '');
    if (currentUserToken){
        let currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
        if (currentUser){
            // if theres an unresolved nonce/purchase...
            if (currentUser.nonce) {
                // go get the nonce token created in routes/buy/+page.server.ts
                const nonceToken = url.searchParams.get('nonce');
                if (nonceToken) {
                    // validate that its not tampered with
                    if (validateJwt(nonceToken, VITE_NONCE_SIGNING_SECRET)){
                        // decode the nonce tokens
                        const userToken = decodeJwt(currentUser.nonce)
                        const { nonce } = decodeJwt(nonceToken)
                        // make sure the random nonce values match
                        if (userToken.nonce === nonce) {
                            // credit the account
                            await locals.pb?.collection('users').update(currentUserToken.id, { nonce: '', credits: (currentUser.credits + userToken.credits)});
                            currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
                            // todo handle failed updates (maybe cross check with stripe periodically)
                        }
                    }
                }
                // todo handle stuck nonce (notify owner, put nonce in state or something)
            }
            return {
                loggedIn: locals.pb?.authStore.isValid,
            }
        }
    }
};

