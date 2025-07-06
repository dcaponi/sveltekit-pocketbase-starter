import { redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, cookies }: RequestEvent) => {
    const expectedState = cookies.get('state');
    const codeVerifier = cookies.get('cv');
    const providerName = cookies.get('prov');

    const query = new URLSearchParams(url.search);
    const state = query.get('state');
    const code = query.get('code');

    if (expectedState !== state) {
        console.log('state does not match expected', expectedState, state);
        redirect(303, '/login');
    }

    try {
        await locals.authProvider.getOauth2AccessToken(
            providerName ?? "unknown", 
            code ?? "", 
            codeVerifier ?? ""
        );
        return new Response(null, {
            status: 303,
            headers: {
                'location': "/protected",
                'set-cookie': locals.authProvider.getAuthCookie(),
            }
          });
    } catch (err) {
        console.log('Error logging in with 0Auth user', err);
    }

    redirect(303, '/');
};
