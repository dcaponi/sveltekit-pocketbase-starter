<script lang="ts">
    import { browser } from '$app/environment';
    import type { PageData } from './$types';

    export let data: PageData;

    let providers = data;

    const gotoAuthProvider = (name: string) => {
        if (browser) {
            if( providers[name] ){
                document.cookie = `state=${providers[name].authProviderState}`;
                document.cookie = `cv=${providers[name].authCodeVerifier}`;
                document.cookie = `prov=${name}`
            }
        }
        window.location.href = providers[name].authProviderRedirect || '';
    }
</script>
<h1>Authentication</h1>

<h2>New Member? Sign Up</h2>
<form method="POST" action="?/signup">
    <label for="email">email address</label><input name="email" type="email" required/><br/>
    <label for="password">password</label><input name="password" type="password" required/><br/>
    <label for="passwordConfirm">confirm password</label><input name="passwordConfirm" type="password" required/><br/>
    <button type="submit">Sign Up</button>
</form><br/>
<h2>Returning Member? Log In</h2>
<form method="POST" action="?/login">
    <label for="email">email address</label><input name="email" type="email" required/><br/>
    <label for="password">password</label><input name="password" type="password" required/><br/>
    <button type="submit">Login</button>
</form><br/>

<h2>Social Login</h2>
{#each Object.keys(providers) as provider}
    {#if providers[provider].authProviderState}
        <button on:click={() => gotoAuthProvider(provider)}>Login with {provider}</button>
    {/if}
{/each}