<script lang="ts">
    const logout = () => fetch('/logout')
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<a href="/protected">protected</a>
<a href="/" on:click={logout}>logout</a>
<a href="/buy">buy stuff</a>