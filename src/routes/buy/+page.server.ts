import jwt, { type JwtPayload } from 'jsonwebtoken';
import Stripe from 'stripe';
import { redirect } from "@sveltejs/kit";
import { decodeJwt } from '$lib/jwt';

import type { PageServerLoad } from "./$types";

import { 
    VITE_NONCE_SIGNING_SECRET,
    VITE_HOSTNAME
} from "$env/static/private";

export type Choice = {
    description: string;
    price: number;
    label: string;
    stripeID: string;
    type: "payment" | "subscription";
    credits: number | null;
}

const stripe = new Stripe(import.meta.env['VITE_STRIPE_SECRET_KEY'], {
  apiVersion: '2023-10-16',
});

const products = await stripe.products.list({active: true})

const offerings = (await Promise.all(products.data.map(async (product): Promise<Choice | null> => {
    if (product.default_price) {
        const price = (await stripe.prices.retrieve(product.default_price.toString()))
        return {
            label: product.name,
            stripeID: product.default_price.toString(),
            description: product.description ?? "unspecified",
            price: (price.unit_amount ?? 0) / 100,
            type: price.recurring === null ? "payment" : "subscription",
            credits: parseInt(product.metadata.credits ?? 0)
        }
    }
    return null
}))).filter(x => x !== null)

export const load: PageServerLoad = async () =>  {
    return { offerings } 
}

// the nonce helps the site know that the purchase was successful and coming back from stripe
// a good nonce will be handled at the top level of the app see routes/+layout.server.t
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
            redirect(301, '/');
        }
        const rawData = await request.formData();
        const chosenOffering = rawData.get('chosenOffering');
        if (chosenOffering) {
            const chosen = JSON.parse(chosenOffering.toString()) as Choice
            const nonce = generateNonce();
            const purchaseIntent = jwt.sign(chosen, VITE_NONCE_SIGNING_SECRET + nonce);
            const isProd = process.env.NODE_ENV === 'production' ? true : false;

            // pin the nonce to the user. it should match when the user comes back from stripe
            // we sign it so we know nobody messed with the nonce between here and stripe
            const currentUserToken = decodeJwt(locals.pb?.authStore.token || '') as JwtPayload;

            if (!currentUserToken) {
                console.error("unable to determine current user")
                redirect(303,( isProd ? `https://${VITE_HOSTNAME}` : `http://localhost:5173/`));
            }

            locals.pb?.collection('users').update(currentUserToken.id, {purchaseIntent});

            
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: chosen.stripeID,
                        quantity: 1,
                    },
                ],
                mode: chosen.type,
                // you can also have it call some backend service which will redirect the user back to the site when its done doing its thing
                success_url: isProd ? `https://${VITE_HOSTNAME}?nonce=${nonce}` : `http://localhost:5173/?nonce=${nonce}`,
                cancel_url: isProd ? `https://${VITE_HOSTNAME}` : `http://localhost:5173/`,
                automatic_tax: {enabled: true},
            });
            // send user to credit card page so stripe can handle that
            redirect(303, session.url || 'http://localhost:5173/');
        }
    },
}