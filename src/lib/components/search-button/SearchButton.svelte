<script lang="ts">
	import Button from '../button/Button.svelte'
	import type { ComponentProps } from 'svelte'
	import Search from '../search/Search.svelte'
	import { tick } from 'svelte'
	import gsap from 'gsap'

	let {
		expanded = $bindable(false),
		value = $bindable(''),
		...props
	}: {
		expanded?: boolean
	} & ComponentProps<typeof Search> = $props()

	let showingPlaceholder = $state(false)
	let search: Search
	let searchInput: HTMLInputElement

	const ANIMATION_DURATION = 0.3

	const toggle = async () => {
		const flip = (await import('gsap/Flip')).Flip
		if (!flip) return

		const searchTargets = '.container > .search-wrapper, .container > .button > .content'
		const iconTargets = '.search-icon'

		let searchState = flip.getState(searchTargets)
		let iconState = flip.getState(iconTargets)

		expanded = !expanded
		showingPlaceholder = true

		await tick()

		gsap.from('.container button', {
			backgroundColor: 'var(--color-neutral-dark)',
			duration: ANIMATION_DURATION,
			ease: 'power1.inOut'
		})

		gsap.from('.container input', {
			backgroundColor: 'var(--color-neutral-2)',
			duration: ANIMATION_DURATION,
			ease: 'power1.inOut'
		})

		flip.from(iconState, {
			targets: iconTargets,
			duration: ANIMATION_DURATION,
			ease: 'power1.inOut',
			absolute: true
		})

		flip.from(searchState, {
			targets: searchTargets,
			duration: ANIMATION_DURATION,
			ease: 'power1.inOut',
			onComplete: () => {
				showingPlaceholder = false
			}
		})
	}

	$effect(() => {
		if (expanded) {
			search.focus()
		}
	})
</script>

<div class="container">
	{#if expanded}
		<Search
			bind:this={search}
			bind:inputElement={searchInput}
			bind:value
			{...props}
			roundedCorners
			onConfirm={(value) => {
				props.onConfirm?.(value)
				toggle()
			}}
		/>
	{:else}
		<Button variant="pill" color="neutral" size="sm" onclick={toggle}>
			<svg
				class="search-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				data-flip-id="search-icon"
			>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			{#if showingPlaceholder}
				<svg
					class="search-icon-placeholder"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			{/if}
		</Button>
	{/if}
</div>

<style>
	.search-icon-placeholder {
		opacity: 0;
		pointer-events: none;
	}
</style>
