import type { LayoutServerLoad } from './$types';
export type OutputType = { isLoggedIn: boolean };

export const load: LayoutServerLoad<OutputType> = async ({ locals }) => {
    return {
            isLoggedIn: locals.pb?.authStore.isValid ? true : false,
    };
};
