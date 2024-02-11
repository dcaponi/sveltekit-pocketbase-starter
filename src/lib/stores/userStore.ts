import { writable } from 'svelte/store';

export type UserState = {
    credits: number;
    subscriptionID?: string | null;
}
export const userStore = writable<UserState>();
