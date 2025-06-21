
import { fail, redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";
import type { Product } from '$lib/payments/provider';

export const load: PageServerLoad = async ({locals}) =>  {
    const offerings = await locals.paymentProvider.getProductChoices();
    return { offerings } 
}

export const actions = {
    purchase: async ({request, locals}) => {
        const user = await locals.authProvider.getCurrentUser();
        if (!user) redirect(301, '/');

        const rawData = await request.formData();
        const chosenOffering = rawData.get('chosenOffering');
        if (!chosenOffering) return fail(500, {
          field: "offering",
          error:{ field:'offering', message:'offering missing - this is unexpected'}
        })

        const chosen = JSON.parse(chosenOffering.toString()) as Product
        const checkoutSessionURL = await locals.paymentProvider.getCheckoutSession(chosen, "account")
        redirect(303, checkoutSessionURL || 'http://localhost:5173/');
    },
}