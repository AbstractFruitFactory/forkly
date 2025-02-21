<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Pacifico&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Layout>
	{#snippet header()}
		<Header loggedIn={!!data.user} />
	{/snippet}

	{#snippet content()}
		{@render children()}
	{/snippet}
</Layout>
