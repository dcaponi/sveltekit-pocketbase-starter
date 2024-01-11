import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { redirect } from "@sveltejs/kit";
import { decodeJwt } from '$lib/jwt';

import type { PageServerLoad } from "./$types";

import { 
    VITE_STRIPE_ID_BEST_PRODUCT, 
    VITE_STRIPE_ID_BETTER_PRODUCT, 
    VITE_STRIPE_ID_GOOD_PRODUCT, 
    VITE_NONCE_SIGNING_SECRET 
} from "$env/static/private";

export type Choice = {
    sku: string;
    price: number;
    label: string;
    stripeID: string;
}

const stripe = new Stripe(import.meta.env['VITE_STRIPE_SECRET_KEY'], {
  apiVersion: '2023-08-16',
});

const offerings: Array<Choice> = [
    {sku: "good", price: 5, label: "good",  stripeID: VITE_STRIPE_ID_GOOD_PRODUCT},
    {sku: "better", price: 20, label: "better", stripeID: VITE_STRIPE_ID_BETTER_PRODUCT},
    {sku: "best", price: 30, label: "best", stripeID: VITE_STRIPE_ID_BEST_PRODUCT}
]

export const load: PageServerLoad = async () =>  {
    return { offerings } 
}

// the nonce helps the site know that the purchase was successful and coming back from stripe
// a good nonce will be handled at the top level of the app see routes/+layout.server.ts
const generateNonce = (length = 24) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

export const actions = {
    purchase: async ({request, locals}) => {
        if (!locals.pb?.authStore.isValid){
            throw redirect(301, '/');
        }
        const rawData = await request.formData();
        const chosenOffering = rawData.get('chosenOffering');
        if (chosenOffering) {
            const chosen = JSON.parse(chosenOffering.toString()) as Choice
            const nonce = generateNonce();
            const nonceToken = jwt.sign({...chosen, nonce}, VITE_NONCE_SIGNING_SECRET);

            // pin the nonce to the user. it should match when the user comes back from stripe
            // we sign it so we know nobody messed with the nonce between here and stripe
            const currentUserToken = decodeJwt(locals.pb?.authStore.token || '');
            locals.pb?.collection('users').update(currentUserToken.id, {nonce: nonceToken});

            const isProd = process.env.NODE_ENV === 'production' ? true : false;
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: chosen.stripeID,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                // you can also have it call some backend service which will redirect the user back to the site when its done doing its thing
                success_url: isProd ? `https://yoursite?nonce=${nonce}` : `http://localhost:5173/?nonce=${nonce}`,
                cancel_url: isProd ? `https://yoursite` : `http://localhost:5173/`,
                automatic_tax: {enabled: true},
            });
            // send user to credit card page so stripe can handle that
            throw redirect(303, session.url || 'http://localhost:5173/');
        }
    },
}