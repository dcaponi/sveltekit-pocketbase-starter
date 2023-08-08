import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export type OutputType = { [key: string]: {
    authProviderRedirect: string;
    authProviderState: string;
    authCodeVerifier: string;
}};

export const load: PageServerLoad<OutputType> = async ({ locals, url, cookies }) => {
    const authToken = cookies.get('pb_auth');
    if (authToken) {
        throw redirect(302, '/')
    }
    
    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    if (!authMethods) {
        return {};
    }

    const redirectURL = `${url.origin}/callback`;

    let output: OutputType = {}
    authMethods.authProviders.forEach(provider => {
        output[provider.name] = {
            authProviderRedirect: `${provider.authUrl}${redirectURL}`,
            authProviderState: provider.state,
            authCodeVerifier: provider.codeVerifier,
        };
    });

    return output
};
