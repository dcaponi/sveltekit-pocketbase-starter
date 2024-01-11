import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({locals}: RequestEvent) => {
    locals.pb?.authStore.clear();
    return new Response(null, {status: 303});
}