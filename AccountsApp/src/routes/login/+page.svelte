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
<form method="POST" action="?/signup">
    <label for="email">email address</label><input name="email" type="email" required/><br/>
    <label for="password">password</label><input name="password" type="password" required/><br/>
    <label for="passwordConfirm">confirm password</label><input name="passwordConfirm" type="password" required/><br/>
    <button type="submit">Sign Up</button>
</form><br/>
<form method="POST" action="?/login">
    <label for="email">email address</label><input name="email" type="email" required/><br/>
    <label for="password">password</label><input name="password" type="password" required/><br/>
    <button type="submit">Login</button>
</form><br/>
<button on:click={() => gotoAuthProvider("google")}>Login with Google</button>
<button on:click={() => gotoAuthProvider("github")}>Login with Github</button>