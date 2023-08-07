import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export type OutputType = { authProviderRedirect: string; authProviderState: string };

export const load: PageServerLoad<OutputType> = async ({ locals, url, cookies }) => {
    const authToken = cookies.get('pb_auth');
    if (authToken) {
        throw redirect(302, '/')
    }
    
    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    if (!authMethods) {
        return {
            authProviderRedirect: '',
            authProviderState: ''
        };
    }

    const redirectURL = `${url.origin}/callback`;
    const googleAuthProvider = authMethods.authProviders[0];
    const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;
    const state = googleAuthProvider.state;

    return {
        authProviderRedirect: authProviderRedirect,
        authProviderState: state,
        authCodeVerifier: googleAuthProvider.codeVerifier,
    };
};
