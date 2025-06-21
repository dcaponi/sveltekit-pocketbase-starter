import type { SubscriptionStatus } from '$lib/payments/provider';
import { writable } from 'svelte/store';

export type UserState = {
	name: any;
    credits: number;
    subscriptionID?: string | null;
    subscriptionStatus: SubscriptionStatus;
    loggedIn: boolean;
}
export const userStore = writable<UserState>();
