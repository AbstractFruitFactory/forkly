<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { goto, invalidateAll } from '$app/navigation'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	async function handleLogout() {
		const response = await fetch('/api/logout', { method: 'POST' })
		if (response.ok) {
			await invalidateAll()
			goto('/')
		}
	}
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
		<Header
			loggedIn={!!data.user}
			newRecipeHref="/new"
			aboutHref="/about"
			profileHref="/profile"
			loginHref="/login"
			onLogout={handleLogout}
		/>
	{/snippet}

	{#snippet content()}
		{@render children()}
	{/snippet}
</Layout>
