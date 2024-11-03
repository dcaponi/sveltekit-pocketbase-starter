<script lang="ts">
	let { data } = $props();
	const offerings = data.offerings;
</script>

<h2>Choose Your Package</h2>

<div>
	{#each offerings as offering}
		<form action="?/purchase" method="POST">
			<h3>{offering.label}</h3>
			<p>{offering.description}</p>
			<input type="hidden" name="chosenOffering" value={JSON.stringify(offering)} />
			<button type="submit" id="checkout-button">{offering.label} ${offering.price}.00</button>
		</form>
	{/each}
</div>
