import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { decodeJwt, validateJwt } from '$lib/jwt';
import Stripe from 'stripe';


import { 
    VITE_NONCE_SIGNING_SECRET,
    VITE_STRIPE_SECRET_KEY
} from "$env/static/private";
import type { JwtPayload } from 'jsonwebtoken';

const stripe = new Stripe(VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['protected', 'buy']
    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname.split("/").filter(Boolean)[0])) {
        redirect(302, '/login');
    }
    const userAuthSession = decodeJwt(locals.pb?.authStore.token || '') as JwtPayload;
    if (userAuthSession){
        let currentUser = await locals.pb?.collection('users').getOne(userAuthSession.id);
        if (currentUser){
            let subscriptionStatus = null;
            let subscriptionCancelAt = null;
            let subscriptionID = null;

            const stripeCustomerResult = await stripe.customers.list({
                limit: 1,
                email: currentUser.email
            });

            if (stripeCustomerResult.data.length > 0){
                const stripeCustomerID: string = stripeCustomerResult.data[0].id;
                const subscriptionResult = await stripe.subscriptions.list({
                    customer: stripeCustomerID
                });
                if (subscriptionResult.data.length > 0){
                    subscriptionStatus = subscriptionResult.data[0].status;
                    if (subscriptionResult.data[0].cancel_at) {
                        subscriptionCancelAt = new Date(subscriptionResult.data[0].cancel_at * 1000)
                    }
                    subscriptionID = subscriptionResult.data[0].id;
                    await locals.pb?.collection('users').update(userAuthSession.id, {
                        subscriptionID: subscriptionStatus === "active" ? subscriptionID : null
                    })
                } else {
                    await locals.pb?.collection('users').update(userAuthSession.id, {
                        subscriptionID: null
                    })
                }
            }
            if (currentUser.purchaseIntent) {
                let newUserState = {purchaseIntent: '', credits: currentUser.credits}
                const nonce = url.searchParams.get('nonce')
                const purchaseIntent = validateJwt(currentUser.purchaseIntent, VITE_NONCE_SIGNING_SECRET) as JwtPayload
                if (purchaseIntent && purchaseIntent.nonce === nonce) {
                    newUserState = {...newUserState, credits: (currentUser.credits + purchaseIntent.credits)}    
                }
                await locals.pb?.collection('users').update(userAuthSession.id, newUserState);
                currentUser = await locals.pb?.collection('users').getOne(userAuthSession.id);
            }
            return {
                loggedIn: locals.pb?.authStore.isValid,
                username: currentUser?.name || "Current User",
                credits: currentUser?.credits,
                subscriptionID: currentUser?.subscriptionID,
                subscriptionCancelAt
            }
        }
    }
    return {
        loggedIn: false,
        subscriptionID: "",
        username: "",
        credits: 0
    }
};
