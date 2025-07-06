import { fail, redirect, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const currentUser = await locals.authProvider.getCurrentUser();

    if (currentUser) redirect(302, '/');
    
    const providers = await locals.authProvider.listThirdPartyAuthMethods();
    return { providers }
};

export const actions = {
    signup: async ({ locals, request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString() || '';
        const password = data.get('password')?.toString() || '';
        const passwordConfirm = data.get('passwordConfirm')?.toString() || '';

        if (password !== passwordConfirm) {
            return fail(422, { email, error: true, message: "password and password confirm must match" });
        }
        try {
            await locals.authProvider.createUserWithEmailPassword(email, password, passwordConfirm);
            locals.authProvider.requestEmailVerification(email);
            loginWithEmailPassword(locals, cookies, email, password);
        } catch (e: any) {
            console.error("[Signup Error]: ", e.response.data)
            return fail(422, {error: true, message: e.response.data})
        }

        return loginWithEmailPassword(locals, cookies, email, password)
    },
    login: async ({ locals, request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString() || '';
        const password = data.get('password')?.toString() || '';

        return loginWithEmailPassword(locals, cookies, email, password)
    }
}

const loginWithEmailPassword = async (locals: App.Locals, cookies: Cookies, email: string, password: string) => {
    try {
        await locals.authProvider.login(email, password);

        if(await locals.authProvider.getCurrentUser()){
            cookies.set('pb_auth', locals.authProvider.getAuthCookie(), {path: "/"});
            throw redirect(303, "/");
        }
    } catch (e: any) {
        console.error(e)
        if(e.status >= 400 && e.status <= 500){
            return fail(e.status, { 
                email, 
                error: true, 
                message: "failed to authenticate" 
            });
        }
        if (e.status >=500){
            return fail(e.status, { 
                email, 
                error: true, 
                message: "authentication server could not be reached" 
            });
        }
    }
}