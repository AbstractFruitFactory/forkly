<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import '$lib/global.scss'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Header />

<main>
	{@render children()}
</main>
