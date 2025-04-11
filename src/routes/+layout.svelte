<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import BottomNav from '$lib/components/bottom-nav/BottomNav.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()
</script>

<Layout>
	{#snippet header()}
		<Header loggedIn={!!data.user} newRecipeHref="/new" profileHref="/profile" loginHref="/login" />
	{/snippet}

	{#snippet content()}
		{@render children()}
	{/snippet}

	{#snippet bottomNav()}
		<BottomNav loggedIn={!!data.user} newRecipeHref="/new" profileHref="/profile" loginHref="/login" />
	{/snippet}
</Layout>

<style lang="scss">
	@import '$lib/global.scss';

	:global(.recipe-page) {
		--header-display: none;
	}

	:global(.header) {
		display: var(--header-display, block);
	}
</style>
