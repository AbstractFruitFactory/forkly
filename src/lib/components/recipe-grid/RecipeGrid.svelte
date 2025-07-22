<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import { onMount, type ComponentProps } from 'svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	type RecipeItem = NonNullable<ComponentProps<typeof RecipeCard>['recipe']>
	type LoadingItem = { loading: true, id: string }
	type GridItem = RecipeItem | LoadingItem

	let {
		recipes,
		emptyMessage = 'No recipes found.',
		useAnimation = true,
		loadMore,
		onRecipeClick,
		isLoadingMore = false,
		isLoading = false
	}: {
		recipes: Promise<RecipeItem[]>
		emptyMessage?: string
		loadMore?: () => Promise<void>
		useAnimation?: boolean
		onRecipeClick?: (recipe: DetailedRecipe, event: MouseEvent) => Promise<void>
		isLoadingMore?: boolean
		isLoading?: boolean
	} = $props()

	let loadMoreTrigger: HTMLElement
	let observer: IntersectionObserver

	let isInitialLoading = $state(true)

	// initial 18 loading items
	let resolvedRecipes = $state<RecipeItem[]>()

	$effect(() => {
		recipes.then((recipeArray) => {
			resolvedRecipes = recipeArray
			isInitialLoading = false
		})
	})

	let renderedItems = $derived.by(() => {
		if (isLoadingMore) {
			const existingRecipes = resolvedRecipes || []
			return [
				...existingRecipes.map((recipe) => ({ ...recipe, loading: false })),
				...Array(18).fill(undefined).map((_, index) => ({ loading: true, id: `loading-${index}` }))
			] as GridItem[]
		}
		return resolvedRecipes as GridItem[]
	})

	onMount(() => {
		if (!loadMore) return

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoadingMore && !isInitialLoading && !isLoading) {
					loadMore()
				}
			},
			{ threshold: 0.1, rootMargin: '200px' }
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

{#if resolvedRecipes}
	<CardGrid items={renderedItems} {emptyMessage} {useAnimation}>
		{#snippet item(recipe)}
			{#if 'loading' in recipe && recipe.loading}
				<RecipeCard loading />
			{:else}
				<RecipeCard recipe={recipe as RecipeItem} {onRecipeClick} />
			{/if}
		{/snippet}
	</CardGrid>
{/if}

{#if loadMore}
	<div bind:this={loadMoreTrigger} class="load-more-trigger"></div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.load-more-trigger {
		height: 1px;
		width: 100%;
		margin-top: 200px;
	}
</style>
