<script lang="ts">
    import { browser } from '$app/environment';
    import type { PageData } from './$types';

    export let data: PageData;
    
    type OutputType = { [key: string]: {
        authProviderRedirect: string;
        authProviderState: string;
        authCodeVerifier: string;
    }};

    let providers = data;
    function gotoAuthProvider(name: string) {
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

<button on:click={() => gotoAuthProvider("google")}>Login with Google</button>
<button on:click={() => gotoAuthProvider("github")}>Login with Github</button>