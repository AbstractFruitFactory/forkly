<script module lang="ts">
	import { getContext, onMount, setContext } from 'svelte'

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

	export type ErrorState = {
		status: number
		message: string
	}

	let _error = $state<ErrorState>()

	export const errorStore = {
		get error() {
			return _error
		},

		setError(status: number, message: string) {
			_error = { status, message }
		},

		clearError() {
			_error = undefined
		}
	}
</script>

<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import BottomNav from '$lib/components/navigation/BottomNav.svelte'
	import Error from '$lib/pages/error/Error.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { navigating, page } from '$app/state'
	import { afterNavigate } from '$app/navigation'
	import { scrollStore } from '$lib/state/scroll.svelte'
	import gsap from 'gsap'
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import { dev } from '$app/environment'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	injectSpeedInsights()
	injectAnalytics({ mode: dev ? 'development' : 'production' })

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
		errorStore.clearError()
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

	let hasGlobalError = $derived(!!errorStore.error)
</script>

<svelte:head>
	{#if homepage}
		<title>Forkly - Discover and Share Recipes</title>
		<meta property="og:image" content="/og-image.png" />
	{/if}
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
			profileHref={data.user ? `/user/${data.user.username}` : '/profile'}
			loginHref="/login"
			profilePicUrl={data.user?.avatarUrl ?? undefined}
		/>
	{/snippet}

	{#snippet homepageHeader()}
		{@render slots.homepageHeader?.()}
	{/snippet}

	{#snippet content()}
		{#if hasGlobalError}
			<Error
				status={errorStore.error!.status}
				error={{
					message: errorStore.error!.message
				}}
			/>
		{:else}
			{@render slots.content?.()}
		{/if}
	{/snippet}

	{#snippet bottomNavBar()}
		<BottomNav
			loggedIn={!!data.user}
			homeHref="/"
			newRecipeHref="/new"
			profileHref={data.user ? `/user/${data.user.username}` : '/profile'}
			loginHref="/login"
		/>
	{/snippet}
</Layout>

<style lang="scss">
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
