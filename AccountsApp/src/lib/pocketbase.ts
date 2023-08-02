import PocketBase from 'pocketbase'

export function createInstance() {
    return new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
}

export const pb = createInstance()