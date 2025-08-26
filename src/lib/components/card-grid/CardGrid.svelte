<script lang="ts">
	import { gsap } from 'gsap'
	import { type Snippet } from 'svelte'
	import { tick } from 'svelte'

	type Item = $$Generic<{ id: string }>

	let {
		item,
		items,
		emptyMessage = 'No items found.',
		useAnimation = true
	}: {
		item: Snippet<[item: Item]>
		items: Item[]
		emptyMessage?: string
		useAnimation?: boolean
	} = $props()

	let cardGrid = $state<HTMLElement>()
	let cards: HTMLElement[] = $state([])

	let previousCardsCount = $state(0)

	$effect(() => {
		;(async () => {
			if (!useAnimation) {
				previousCardsCount = items.length
				return
			}
			if (items.length > previousCardsCount) {
				await tick()
				await new Promise((resolve) => setTimeout(resolve, 100))
				const newCards = cards.slice(previousCardsCount).filter(Boolean)

				gsap.set(newCards, { y: 50, opacity: 0 })
				gsap.to(newCards, {
					y: 0,
					opacity: 1,
					duration: 0.4,
					stagger: 0.05,
					ease: 'back.out(1.7)'
				})
			}
			previousCardsCount = items.length
		})()
	})
</script>

<div>
	{#if items.length === 0}
		<div class="empty-state">
			<p>{emptyMessage}</p>
		</div>
	{:else}
		<div bind:this={cardGrid} class="card-grid">
			{#each items as _item, index (_item.id)}
				<div bind:this={cards[index]} class="card-wrapper">
					{@render item(_item)}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--spacing-xl);
		justify-content: center;
		place-items: center;

		@include mobile {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--spacing-md);
		}

		&:last-child {
			padding-bottom: var(--spacing-lg);
		}
	}

	.card-wrapper {
		width: 100%;
		opacity: 0;
	}

	@media (max-width: 640px) {
		.card-grid {
			grid-template-columns: 1fr;
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
