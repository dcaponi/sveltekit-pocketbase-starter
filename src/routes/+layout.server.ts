import { redirect } from '@sveltejs/kit';
import { decodeJwt } from '$lib/jwt';
import Stripe from 'stripe';
import type { LayoutServerLoad } from './$types';

const stripe = new Stripe(import.meta.env['VITE_STRIPE_SECRET_KEY'], {
  apiVersion: '2023-08-16',
});

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['protected']

    if (!locals.pb?.authStore.isValid && protectedRoutes.includes(url.pathname.split("/").filter(Boolean)[0])) {
        throw redirect(302, '/login')
    }

    const currentUserToken = decodeJwt(locals.pb?.authStore.token || '');
    if (currentUserToken){
        let currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
        if (currentUser){
            let subscriptionStatus = null;
            let subscriptionID = null;

            const stripeCustomerResult = await stripe.customers.list({
                limit: 1,
                email: currentUser.email
            });

            if (stripeCustomerResult.data.length > 0){
                const stripeCustomerID = stripeCustomerResult.data[0].id;
                const subscriptionResult = await stripe.subscriptions.list({
                    customer: stripeCustomerID
                });
                if (subscriptionResult.data.length > 0){
                    subscriptionStatus = subscriptionResult.data[0].status;
                    subscriptionID = subscriptionResult.data[0].id;
                    await locals.pb?.collection('users').update(currentUserToken.id, {
                        subscriptionID: subscriptionStatus === "active" ? subscriptionID : null
                    })
                } else {
                    await locals.pb?.collection('users').update(currentUserToken.id, {
                        subscriptionID: null
                    })
                }
            }

            if (currentUser.nonce) {
                const nonce = url.searchParams.get('nonce')
                const userToken = decodeJwt(currentUser.nonce)
                if (userToken.nonce === nonce) {
                    await locals.pb?.collection('users').update(currentUserToken.id, { nonce: '', credits: (currentUser.credits + userToken.credits)});
                    currentUser = await locals.pb?.collection('users').getOne(currentUserToken.id);
                }
            }
            return {
                loggedIn: locals.pb?.authStore.isValid,
                username: currentUser?.name || "Current User",
                subscriptionID: currentUser?.subscriptionID,
                credits: currentUser?.credits
            }
        }
    }
    return {
        loggedIn: false
    }
};
