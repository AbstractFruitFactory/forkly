<script module lang="ts">
	import { getContext, onMount, setContext } from 'svelte'
	import { tick } from 'svelte'

	const key = Symbol('layout-slots')

	type Slots = {
		homepageHeader?: Snippet<[searchBar?: Snippet<['homepage' | 'header']>]>
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

	let _isScrolledDownHomepage = $state(false)

	export const scrolledDownHomepageStore = {
		get value() {
			return _isScrolledDownHomepage
		},
		setTrue() {
			_isScrolledDownHomepage = true
		},
		setFalse() {
			_isScrolledDownHomepage = false
		}
	}
</script>

<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import BottomNav from '$lib/components/navigation/BottomNav.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { navigating, page } from '$app/state'
	import { afterNavigate } from '$app/navigation'
	import { scrollStore } from '$lib/state/scroll.svelte'
	import gsap from 'gsap'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	const slots = initSlots()

	let homepage = $derived(page.url.pathname === '/')

	let homepageHeaderTransition = $state(true)

	let _flip: (typeof import('gsap/Flip'))['Flip'] | null = $state(null)

	onMount(() => {
		import('gsap/Flip').then(({ Flip }) => {
			gsap.registerPlugin(Flip)
			_flip = Flip
		})
	})

	afterNavigate(() => {
		scrollStore.scrollToTop('instant')
	})

	$effect(() => {
		if (navigating.from?.route.id === '/' && scrolledDownHomepageStore.value) {
			homepageHeaderTransition = false

			setTimeout(() => {
				homepageHeaderTransition = true
			}, 300)

			scrolledDownHomepageStore.setFalse()
		}
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

{@render children()}

<Layout
	{homepage}
	wideHeader={!scrolledDownHomepageStore.value && homepage}
	{homepageHeaderTransition}
>
	{#snippet header()}
		<Header
			loggedIn={!!data.user}
			newRecipeHref="/new"
			profileHref="/profile"
			loginHref="/login"
			profilePicUrl={data.user?.avatarUrl ?? undefined}
		/>
	{/snippet}

	{#snippet homepageHeader()}
		{@render slots.homepageHeader?.()}
	{/snippet}

	{#snippet content()}
		{@render slots.content?.()}
	{/snippet}

	{#snippet bottomNavBar()}
		<BottomNav
			loggedIn={!!data.user}
			homeHref="/"
			newRecipeHref="/new"
			profileHref="/profile"
			loginHref="/login"
		/>
	{/snippet}
</Layout>

<style lang="scss">
	@import '$lib/global.scss';

	:global(body) {
		background: var(--color-secondary);
	}

	:global(.recipe-page) {
		--header-display: none;
	}

	:global(.header) {
		display: var(--header-display, block);
	}
</style>
