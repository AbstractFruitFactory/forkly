<script module lang="ts">
	import { getContext, setContext } from 'svelte'

	const key = Symbol('layout-slots')

	type Slots = {
		homepageHeader?: Snippet
		content?: Snippet
	}

	export function initSlots() {
		const slots = $state({} as Slots)
		return setContext(key, slots)
	}

	export function setSlots(slots: Slots) {
		const context = getContext<Slots>(key)
		Object.assign(context, slots)
	}

	let _isStickyScrollBar = $state(false)

	export const stickyScrollBarStore = {
		get value() {
			return _isStickyScrollBar
		},
		setTrue() {
			_isStickyScrollBar = true
		},
		setFalse() {
			_isStickyScrollBar = false
		}
	}
</script>

<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { navigating, page } from '$app/state'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	const slots = initSlots()

	let homepage = $derived(page.url.pathname === '/')

	let homepageHeaderTransition = $state(true)

	$effect(() => {
		if (navigating.from?.route.id === '/' && stickyScrollBarStore.value) {
			homepageHeaderTransition = false

			setTimeout(() => {
				homepageHeaderTransition = true
			}, 300)

			stickyScrollBarStore.setFalse()
		}
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

{@render children()}

<Layout {homepage} wideHeader={!stickyScrollBarStore.value && homepage} {homepageHeaderTransition}>
	{#snippet header()}
		<Header loggedIn={!!data.user} newRecipeHref="/new" profileHref="/profile" loginHref="/login" />
	{/snippet}

	{#snippet homepageHeader()}
		{@render slots.homepageHeader?.()}
	{/snippet}

	{#snippet content()}
		{@render slots.content?.()}
	{/snippet}
</Layout>

<style lang="scss">
	@import '$lib/global.scss';

	:global(body) {
		background: var(--color-primary);
	}

	:global(.recipe-page) {
		--header-display: none;
	}

	:global(.header) {
		display: var(--header-display, block);
	}
</style>
