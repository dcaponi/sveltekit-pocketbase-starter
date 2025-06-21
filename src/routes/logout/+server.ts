import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({locals}: RequestEvent) => {
    locals.authProvider.logout();
    return new Response(null, {status: 303, headers: {location: "/"}});
}