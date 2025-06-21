import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import type { User } from '$lib/auth/provider';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const protectedRoutes = ['account', 'buy', 'setup']
    const user = await locals.authProvider.getCurrentUser<User>();

    if (!user && protectedRoutes.includes(url.pathname.split("/").filter(Boolean)[0])) {
        console.log("[layout] going to login", user)
        redirect(302, '/login');
    }

    let userState: User = { 
        id: "",
        loggedIn: false, 
        name: "", 
        phone: "",
        email: "",
        threadID: "",
        lastSummarizedAt: new Date(),
        verified: false,
        phoneVerified: false,
        credits: 0,
        subscriptionStatus: "inactive"
    };

    if (!user) return { userState };
    const subscription = await locals.paymentProvider.getSubscription(user.email);

    userState = {
        ...userState,
        loggedIn: true, 
        id: user.id ?? "",
        name: user.name ?? "Current User", 
        verified: user.verified ?? false,
        phoneVerified: user.phoneVerified ?? false,
        threadID: user.threadID ?? "",
        email: user.email ?? "",
        credits: user.credits,
        subscriptionStatus: subscription?.status ?? 'inactive'
    };

   
    

    return { userState };
};
