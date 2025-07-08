<script lang="ts">
	import { gsap } from 'gsap'
	import { untrack, type Snippet } from 'svelte'

	type Item = $$Generic

	let {
		item,
		items,
		emptyMessage = 'No items found.',
		size = 'large',
		useAnimation = true
	}: {
		item: Snippet<[item: Item]>
		items: Item[]
		emptyMessage?: string
		size?: 'large' | 'small'
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
		<div bind:this={cardGrid} class="card-grid" class:small={size === 'small'}>
			{#each items as _item, index (index)}
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
		gap: var(--spacing-lg);
		justify-content: center;
		place-items: center;

		&.small {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--spacing-md);
		}

		&:last-child {
			padding-bottom: var(--spacing-lg);
		}

		@include mobile {
			overflow-y: auto;
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

			&.small {
				grid-template-columns: repeat(2, 1fr);
				gap: var(--spacing-sm);
			}
		}
	}
</style>
