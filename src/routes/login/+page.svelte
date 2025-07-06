<!-- @migration-task Error while migrating Svelte code: Cannot use `export let` in runes mode — use `$props()` instead -->
<script lang="ts">
	import { browser } from '$app/environment';

	let { data } = $props();
	const providers = data.providers

	const gotoAuthProvider = (name: string) => {
		if (browser) {
			if (providers[name]) {
				document.cookie = `state=${providers[name].authProviderState}`;
				document.cookie = `cv=${providers[name].authCodeVerifier}`;
				document.cookie = `prov=${name}`;
			}
			providers["spotify"].authProviderRedirect = new URL(providers["spotify"].authProviderRedirect)
			providers["spotify"].authProviderRedirect.searchParams.set("scope", "streaming user-read-email playlist-read-private app-remote-control user-read-playback-state user-read-currently-playing user-read-playback-position")
		}
		window.location.href = providers[name].authProviderRedirect.href || '';
	};
</script>

<h1>Authentication</h1>

<h2>New Member? Sign Up</h2>
<form method="POST" action="?/signup">
	<label for="email">email address</label><input name="email" type="email" required /><br />
	<label for="password">password</label><input name="password" type="password" required /><br />
	<label for="passwordConfirm">confirm password</label><input
		name="passwordConfirm"
		type="password"
		required
	/><br />
	<button type="submit">Sign Up</button>
</form>
<br />
<h2>Returning Member? Log In</h2>
<form method="POST" action="?/login">
	<label for="email">email address</label><input name="email" type="email" required /><br />
	<label for="password">password</label><input name="password" type="password" required /><br />
	<button type="submit">Login</button>
</form>
<br />

<h2>Social Login</h2>
{#each Object.keys(providers) as provider}
	{#if providers[provider].authProviderState}
		<button onclick={() => gotoAuthProvider(provider)}>Login with {provider}</button>
	{/if}
{/each}
