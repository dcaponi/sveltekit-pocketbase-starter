import { writable } from 'svelte/store';

export type UserState = {
    credits: number;
    subscriptionID?: string | null;
    subscriptionCancelAt?: Date | null;
    loggedIn: boolean;
}
export const userStore = writable<UserState>();
