import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env['VITE_STRIPE_SECRET_KEY'], {
  apiVersion: '2023-08-16',
});

export const PUT: RequestHandler = async ({ request }) => {
  const { subscriptionID } = await request.json();

  const resp = await stripe.subscriptions.update(
    subscriptionID,
    { cancel_at_period_end: false }
  );

  return json({ restored: true, subscriptionID: resp.id });
};