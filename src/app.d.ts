// See https://kit.svelte.dev/docs/types#app

// for information about these interfaces
declare global {
	namespace App {
		type PocketBase = import('pocketbase').default;
		interface Locals {
			pb?: PocketBase;
			authProvider: AuthProvider,
			communicationsProvider: CommunicationsProvider,
			paymentProvider: PaymentProvider,
			aiConversationProvider: AIConversationProvider,
			datastoreProvider: IDataStoreProvider
		}
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
