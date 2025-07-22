<script lang="ts">
	import { gsap } from 'gsap'
	import { type Snippet } from 'svelte'

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

	let cardGrid: HTMLElement
	let cards: HTMLElement[] = $state([])

	let previousCardsCount = $state(0)

	$effect(() => {
		if (items.length > previousCardsCount && useAnimation) {
			const newCards = cards.slice(previousCardsCount)

			gsap.set(newCards, { y: 50, opacity: 0 })
			gsap.to(newCards, {
				y: 0,
				opacity: 1,
				duration: 0.4,
				stagger: 0.05,
				ease: 'back.out(1.7)'
			})

			previousCardsCount = items.length
		}
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
	@import '$lib/global.scss';

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
			overflow-y: auto;
		}

		&:last-child {
			padding-bottom: var(--spacing-lg);
		}
	}

	.card-wrapper {
		width: 100%;
	}

	.load-more-trigger {
		height: 1px;
		width: 100%;
	}

	@media (max-width: 640px) {
		.card-grid {
			grid-template-columns: 1fr;
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
