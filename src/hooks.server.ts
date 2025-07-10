import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { 
    VITE_POCKETBASE_URL, 
    VITE_STRIPE_SECRET_KEY 
} from '$env/static/private';
import { 
    StripePaymentProvider,
    PBAuthenticator,
    PBDataStore,
    TikTokSpeechGenerationProvider,
    SpotifyProvider,
} from '$lib';

export const handle: Handle = async ({ event, resolve }) => {
    const pocketbaseClient = new PocketBase(VITE_POCKETBASE_URL);

    // This uses pocketbase as the backend for CRUD and Auth (so it is pretty pocketbase heavy)
    // You can bring your own provider like auth0 but there needs to be an auth0 auth provider 
    // that implements the AuthProvider and TokenHandler interface
    event.locals.authProvider = new PBAuthenticator(pocketbaseClient);
    event.locals.authProvider.authRefreshFromCookie(event.request.headers.get('cookie') || '');

    const user = await event.locals.authProvider.getCurrentUser();
    
    try {
        if (user) {
            await event.locals.authProvider.authRefresh();
        }
    } catch (err) {
        event.locals.authProvider.logout();
        // throw redirect(302, '/') // use if all the things need login to work
    }

    // If you use pocketbase as your CRUD backend that goes here. You can also add a provider for your own api
    // just be sure to implement the IDatastoreProvider interface
    event.locals.datastoreProvider = new PBDataStore(pocketbaseClient);

    // speech generator provider added as example
    event.locals.speechGenerationProvider = new TikTokSpeechGenerationProvider();

    // if your 3rd party provider requires user auth(n) use the access token gained from oauth2 with pocketbase
    if (user?.tokens?.["spotify"])
        event.locals.musicProvider = new SpotifyProvider(user.tokens["spotify"]);

    // Payment provider here
    event.locals.paymentProvider = new StripePaymentProvider(VITE_STRIPE_SECRET_KEY);

    const response = await resolve(event);
    response.headers.set(
        'set-cookie',
        event.locals.authProvider.getAuthCookie()
    );

    return response;
};