<script lang="ts">
	import { fly } from 'svelte/transition'
	import { type Snippet } from 'svelte'

	type Item = $$Generic

	let {
		item,
		items,
		emptyMessage = 'No items found.',
		useAnimation = true,
		class: className = '',
		size = 'large'
	}: {
		item: Snippet<[item: Item]>
		items: Item[]
		emptyMessage?: string
		useAnimation?: boolean
		class?: string
		size?: 'large' | 'small'
	} = $props()
</script>

<div
	in:fly={{ y: 50, duration: useAnimation ? 300 : 0, delay: 300 }}
	out:fly={{ y: 50, duration: useAnimation ? 300 : 0 }}
>
	{#if items.length === 0}
		<div class="empty-state">
			<p>{emptyMessage}</p>
		</div>
	{:else}
		<div class="card-grid {className}" class:small={size === 'small'}>
			{#each items as _item}
				{@render item(_item)}
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
