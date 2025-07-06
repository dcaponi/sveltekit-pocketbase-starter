// See https://kit.svelte.dev/docs/types#app

import type { 
	AuthProvider,
	MusicProvider,
	CommunicationsProvider,
	PaymentProvider,
	AgentProvider,
	SpeechGenerationProvider,
	IDataStoreProvider,
	TokenHandler,
	Authable
} from "$lib";

// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			authProvider: (AuthProvider & TokenHandler),
			communicationsProvider: CommunicationsProvider,
			paymentProvider: PaymentProvider,
			agentProvider: AgentProvider,
			speechGenerationProvider: SpeechGenerationProvider,
			datastoreProvider: IDataStoreProvider
			musicProvider: (MusicProvider & Authable)
		}
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
