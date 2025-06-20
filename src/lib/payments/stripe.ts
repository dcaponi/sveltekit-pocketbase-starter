import { FREE_TRIAL_DAYS, VITE_HOSTNAME, VITE_STRIPE_SECRET_KEY, VITE_STRIPE_SUBSCRIPTION_PRICE } from '$env/static/private';
import Stripe from 'stripe';
import type { PaymentProvider, Product, Subscription } from './provider';
const stripe = new Stripe(VITE_STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export class StripeProvider implements PaymentProvider {

  // gets a stripe subscription for an email
  // stripe sdk is weird in that it only offers a list endpoint, but our subscription/email is a 1/1 mapping
  getSubscription = async ( email: string ): Promise<Subscription | null> => {
    const stripeCustomerResult = await stripe.customers.list({ email, limit: 1 });
    if (stripeCustomerResult.data.length == 0){
        console.info("no customer for given email")
        return null;
    }
    const stripeCustomerID: string = stripeCustomerResult.data[0].id;
    const subscriptionResult = await stripe.subscriptions.list({ customer: stripeCustomerID });
    if (subscriptionResult.data.length == 0){
      console.info("no subscription for email")
        return null;
    }

    return { ...subscriptionResult.data[0] } as Subscription
  }

  // cancels a subscription for a user
  cancelSubscription = async ( email: string ): Promise<boolean> => {
    const subscription = await this.getSubscription(email)
    if (!subscription) {
      console.error("no subscription found for email");
      return false;
    }

    try {
      const resp = await stripe.subscriptions.cancel( 
        subscription.id, 
        { prorate: true } 
      )

      if (resp.status !== "canceled") {
        console.error("[stripe error]: unable to cancel subscription")
      }

      return resp.status === "canceled";

    } catch (e) {
      console.error("[stripe error]: unable to cancel subscription", e)
      return false
    }
  }

  // reactivates a subscription if one is suspended
  reinstateSubscription = async ( email: string ): Promise<boolean> => {
    const stripeCustomerResult = await stripe.customers.list({ email, limit: 1 });
    if (stripeCustomerResult.data.length == 0){
        console.info("no customer for given email")
        return false;
    }
    const stripeCustomerID: string = stripeCustomerResult.data[0].id;

    try {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerID,
        items: [ { price: VITE_STRIPE_SUBSCRIPTION_PRICE } ],
      });
      
      if (subscription.status !== "active"){
        console.error("[stripe error]: unable to reactivate subscription")
      }

      return subscription.status === "active"

    } catch (e) {
      console.error("[stripe error]: unable to reactivate subscription", e)
      return false
    }
  }

  // creates a checkout session and passes back the url so we can navigate the user to the PI page
  getCheckoutSession = async (chosen: Product, returnPath: string): Promise<string | null> => {
    try {
      const isProd = process.env.NODE_ENV === 'production' ? true : false;

      const session = await stripe.checkout.sessions.create({
          line_items: [
              {
                  price: chosen.stripeID,
                  quantity: 1,
              },
          ],
          subscription_data: {
              trial_period_days: parseInt(FREE_TRIAL_DAYS),
          },
          mode: chosen.type,
          success_url: isProd ? `https://${VITE_HOSTNAME}/${returnPath}` : `http://localhost:5173/${returnPath}`,
          cancel_url: isProd ? `https://${VITE_HOSTNAME}/${returnPath}` : `http://localhost:5173/${returnPath}`,
          automatic_tax: {enabled: true},
      });
      if (session && session.url) {
        return session.url;
      }
      console.error("[stripe error]: unable to create checkout session");
      return null
    } catch (e) {
      console.error("[stripe error]: unable to create checkout session", e)
      return null
    }

  }

  // lists the options configured for purchase on the stripe account
  getProductChoices = async (): Promise<Product[]> => {
    const products = await stripe.products.list({active: true});
    return (await Promise.all(products.data.map(async (product): Promise<Product | null> => {
      if (product.default_price) {
          const price = (await stripe.prices.retrieve(product.default_price.toString()))
          return {
              label: product.name,
              stripeID: product.default_price.toString(),
              description: product.description ?? "unspecified",
              price: (price.unit_amount ?? 0) / 100,
              type: "subscription",
              credits: parseInt(product.metadata.credits ?? 0)
          }
      }
      return null
    }))).filter(x => x !== null)
  }
}

