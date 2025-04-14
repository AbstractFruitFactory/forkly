<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import { fly } from 'svelte/transition'
	import { onMount } from 'svelte'

	type Recipe = {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
		user?: {
			username: string
			avatarUrl?: string | null
		}
		likes: number
		createdAt: string
		dislikes?: number
		tags?: string[]
	}

	let {
		recipes = [],
		emptyMessage = 'No recipes found.',
		isLoading = false,
		loadMore
	}: {
		recipes: Recipe[]
		emptyMessage?: string
		isLoading?: boolean
		loadMore?: () => Promise<void>
	} = $props()

	let loadMoreTrigger: HTMLElement
	let observer: IntersectionObserver

	onMount(() => {
		if (!loadMore) return

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading) {
					loadMore()
				}
			},
			{ threshold: 0.5, rootMargin: '100px' }
		)

		if (loadMoreTrigger) {
			observer.observe(loadMoreTrigger)
		}

		return () => {
			if (loadMoreTrigger) {
				observer.unobserve(loadMoreTrigger)
			}
		}
	})
</script>

<div in:fly={{ y: 50, duration: 300, delay: 300 }} out:fly={{ y: 50, duration: 300 }}>
	{#if recipes.length === 0}
		<div class="empty-state">
			<p>{emptyMessage}</p>
		</div>
	{:else}
		<div class="recipe-grid">
			{#each recipes as recipe (recipe.id)}
				<RecipeCard {recipe} />
			{/each}

			{#if isLoading}
				{#each Array(18) as _}
					<RecipeCard loading />
				{/each}
			{/if}
		</div>

		{#if loadMore}
			<div bind:this={loadMoreTrigger} class="load-more-trigger"></div>
		{/if}
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--spacing-lg);
		justify-content: center;
		place-items: center;

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
		.recipe-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
