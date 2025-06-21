import { redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }: RequestEvent) => {
    const urlParts = url.toString().split('/')
    const token = urlParts[urlParts.length - 1]

    const verified = await locals.authProvider.verifyUserEmail(token)
    if (verified) {
        if (locals.authProvider.getCurrentUser()){
            redirect(303, '/');
        }
    }
    redirect(303, '/login');
}