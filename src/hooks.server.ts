import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { VITE_POCKETBASE_URL, VITE_STRIPE_SECRET_KEY } from '$env/static/private';
import { 
    OpenAIConversationProvider, 
    TwilioCommunicationsProvider, 
    StripePaymentProvider,
    PBAuthenticator,
    PBDataStore,
} from '$lib';

export const handle: Handle = async ({ event, resolve }) => {
    const pocketbaseClient = new PocketBase(VITE_POCKETBASE_URL);

    event.locals.authProvider = new PBAuthenticator(pocketbaseClient);
    event.locals.authProvider.authRefreshFromCookie(event.request.headers.get('cookie') || '')

    try {
        if (event.locals.authProvider.isValid) {
            await event.locals.authProvider.authRefresh();
        }
    } catch (err) {
        event.locals.authProvider.clear();
        // throw redirect(302, '/') // use if all the things need login to work
    }

    event.locals.datastoreProvider = new PBDataStore(pocketbaseClient);
    event.locals.aiConversationProvider = new OpenAIConversationProvider();
    // event.locals.communicationsProvider = new TwilioCommunicationsProvider();
    event.locals.paymentProvider = new StripePaymentProvider(VITE_STRIPE_SECRET_KEY);

    const response = await resolve(event);
    response.headers.set(
        'set-cookie',
        event.locals.authProvider.getAuthCookie()
    );

    return response;
};