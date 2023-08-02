<script lang="ts">
    import { currentUser } from '$lib/stores/user'
    import { pb } from "$lib/pocketbase";

    const auth = async (provider: string) => pb.collection("users").authWithOAuth2({provider});
</script>

{#if currentUser}
    <h1>Log In</h1>
    <button on:click={() => auth("google")}>Google</button>
{:else}
<slot/>
{/if}

