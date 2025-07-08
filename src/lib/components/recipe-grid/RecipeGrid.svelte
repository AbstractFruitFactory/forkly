<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import { onMount, untrack, type ComponentProps } from 'svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	type RecipeItem = NonNullable<ComponentProps<typeof RecipeCard>['recipe']>
	type LoadingItem = { loading: true }
	type GridItem = RecipeItem | LoadingItem

	let {
		recipes,
		emptyMessage = 'No recipes found.',
		useAnimation = true,
		loadMore,
		onRecipeClick
	}: {
		recipes: Promise<RecipeItem[]>
		emptyMessage?: string
		loadMore?: () => Promise<void>
		useAnimation?: boolean
		onRecipeClick?: (recipe: DetailedRecipe, event: MouseEvent) => Promise<void>
	} = $props()

	let loadMoreTrigger: HTMLElement
	let observer: IntersectionObserver

	let isLoading = $state(true)
	let resolvedRecipes = $state<RecipeItem[]>()

	$effect(() => {
		recipes.then((recipeArray) => {
			resolvedRecipes = recipeArray
			isLoading = false
		})
	})

	let renderedItems = $derived.by(() => {
		if (isLoading && resolvedRecipes) {
			return [
				...resolvedRecipes.map((recipe) => ({ ...recipe, loading: false })),
				...Array(18).fill({ loading: true })
			] as GridItem[]
		}
		return resolvedRecipes as GridItem[]
	})

	onMount(() => {
		if (!loadMore) return

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading) {
					isLoading = true

					loadMore().then(() => {
						isLoading = false
					})
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
	}
</style>
