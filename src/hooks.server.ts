import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { 
    ELEVENLABS_API_KEY, 
    VITE_POCKETBASE_URL, 
    VITE_STRIPE_SECRET_KEY 
} from '$env/static/private';
import { 
    StripePaymentProvider,
    PBAuthenticator,
    PBDataStore,
    TikTokSpeechGenerationProvider,
    ElevenLabsSpeechGenerationProvider,
    SpotifyProvider,
} from '$lib';

export const handle: Handle = async ({ event, resolve }) => {
    const pocketbaseClient = new PocketBase(VITE_POCKETBASE_URL);

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

    event.locals.datastoreProvider = new PBDataStore(pocketbaseClient);

    event.locals.speechGenerationProvider = new TikTokSpeechGenerationProvider();

    if (user?.tokens?.["spotify"])
        event.locals.musicProvider = new SpotifyProvider(user.tokens["spotify"]);

    // event.locals.speechGenerationProvider = new ElevenLabsSpeechGenerationProvider(ELEVENLABS_API_KEY);
    event.locals.paymentProvider = new StripePaymentProvider(VITE_STRIPE_SECRET_KEY);

    const response = await resolve(event);
    response.headers.set(
        'set-cookie',
        event.locals.authProvider.getAuthCookie()
    );

    return response;
};