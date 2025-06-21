import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const user = await locals.authProvider.getCurrentUser();
  if (!user)
    return json({error: "no user"});

  const success = await locals.paymentProvider.cancelSubscription(user.email);
  if (!success)
    return json({ success })

  const subscription = await locals.paymentProvider.getSubscription(user.email);
  
  return json({ success, subscription });
};