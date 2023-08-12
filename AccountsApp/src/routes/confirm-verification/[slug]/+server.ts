import { redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, cookies }: RequestEvent) => {
    const urlParts = url.toString().split('/')
    const token = urlParts[urlParts.length - 1]

    const verified = await locals.pb?.collection('users').confirmVerification(token)
    if (verified) {
        if (locals.pb?.authStore.isValid){
            throw redirect(303, '/')
        }
    }
    throw redirect(303, '/login')
}