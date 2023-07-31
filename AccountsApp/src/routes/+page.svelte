<script lang="ts">
    import PocketBase from "pocketbase";

    const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

    const auth = async (provider: string) => pb.collection("users").authWithOAuth2({provider})

</script>

<h1>Global Log In</h1>

<button on:click={() => auth("google")}>Google</button>