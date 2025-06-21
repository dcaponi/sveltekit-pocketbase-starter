<script lang="ts">
	import { userStore } from '$lib/stores/userStore.js';
	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import type { User } from '$lib/auth/provider';

	let { data }: {data: LayoutServerData, children: Snippet} = $props();

  	let userState: User | undefined = data.userState;

	userStore.set({ ...userState });

	const cancelSubscription = async () => {
		if (confirm(`Are you sure? You'll still have access until the end of your billing cycle.`)) {
			const response = await fetch('/subscription/cancel');
			const { success, subscription } = await response.json();
			if (success) {
				alert("We're sorry to see you go, your subscription will cancel at the end of the month.");
				userStore.set({ ...$userStore, subscriptionStatus: subscription.status });
			}
		}
	};

	const restoreSubscription = async () => {
		if (confirm(`Are you sure? If so, we'll continue billing you monthly.`)) {
			const response = await fetch('/subscription/restore');
			const { success, subscription } = await response.json();
			if (success) {
				alert('Thank you for reinstating your subscription!');
				userStore.set({ ...$userStore, subscriptionStatus: subscription.status });
			}
		}
	};
</script>

<h1>Welcome to SaaSKit</h1>
<p>This project is intended as a starter kit for SaaS type apps</p>
<p>
	It's a bit opinionated and aimed at soloprenuers who want simple SPAs or SSR apps without
	committing to a big framework like Rails or Blazor (although both are great frameworks for solo
	devs in their own right)
</p>
<p>
	We assume you use pocketbase for auth and user management which can be hosted for free at <a
		href="https://app.pockethost.io/">Pockethost</a
	>
</p>
<p>
	We also assume you want to use Stripe for managing payments (in fact, we highly recommend not
	rolling your own payment system unless you have a really good accountant and lawyer)
</p>
<p>
	The default subscription cancel behavior is to keep it active until the end of the billing cycle.
	For immediate cancellation, go to /subscription/cancel/+server.ts and flip <code
		>cancel_at_period_end: true</code
	>
	to <code>cancel_at_period_end: false</code>
</p>
<p>
	This supports purchasing units or credits as well if you happen to go with a piecemeal service
	offering (used quite often with generative AI type products)
</p>

<h2>Controls</h2>
<p>There's a protected route and purchase page that's hidden unless you log in</p>
<p>You can try visiting /protected and you'll be shown the login page if you haven't logged in.</p>
<p>Likewise if you log in and try to visit /login you'll be directed here</p>
{#if $userStore.loggedIn}
	<a href="/protected">protected</a>
	<a href="/buy">buy stuff</a>
	{#if $userStore.subscriptionID}
		{#if $userStore.subscriptionStatus === "active" || $userStore.subscriptionStatus === "trialing"}
			<a href="/" onclick={() => cancelSubscription()}>Cancel Subscription</a>
		{:else}
			<a href="/" onclick={() => restoreSubscription()}>Reinstate Subscription</a>
		{/if}
	{/if}
	<a href="/logout">logout</a>
{:else}
	<a href="/login">log in</a>
{/if}

<h2>Stats</h2>
<strong>Is Logged In?</strong>
<p>{$userStore.loggedIn} as {$userStore.name}</p>
{#if $userStore.loggedIn}
	<strong>Bought Credits?</strong>
	<p>
		{#if $userStore.credits}
			Yes: {$userStore.credits} credits
		{:else}
			No
		{/if}
	</p>
	<strong>Has Subscription?</strong>
	<p>
		{#if $userStore.subscriptionID}
			Yes
		{:else}
			No
		{/if}
	</p>

{/if}
