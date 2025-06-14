<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import { onMount, type ComponentProps } from 'svelte'

	let {
		recipes = [],
		emptyMessage = 'No recipes found.',
		isLoading = false,
		useAnimation = true,
		loadMore
	}: {
		recipes: NonNullable<ComponentProps<typeof RecipeCard>['recipe']>[]
		emptyMessage?: string
		isLoading?: boolean
		loadMore?: () => Promise<void>
		useAnimation?: boolean
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

	let renderedItems = $derived.by(() => {
		if (isLoading) {
			return [
				...recipes.map((recipe) => ({ ...recipe, loading: false })),
				...Array(18).fill({ loading: true })
			]
		}
		return recipes
	})
</script>

<CardGrid items={renderedItems} {emptyMessage} {useAnimation}>
	{#snippet item(recipe)}
		{#if recipe.loading}
			<RecipeCard loading />
		{:else}
			<RecipeCard {recipe} />
		{/if}
	{/snippet}
</CardGrid>

{#if loadMore}
	<div bind:this={loadMoreTrigger} class="load-more-trigger"></div>
{/if}

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
