<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import CardGrid from '$lib/components/card-grid/CardGrid.svelte'
	import { onMount, type ComponentProps } from 'svelte'

	let {
		recipes = [],
		emptyMessage = 'No recipes found.',
		isLoading = false,
		useAnimation = true,
		loadMore,
		size = 'large'
	}: {
		recipes: NonNullable<ComponentProps<typeof RecipeCard>['recipe']>[]
		emptyMessage?: string
		isLoading?: boolean
		loadMore?: () => Promise<void>
		useAnimation?: boolean
		size?: 'large' | 'small'
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

<CardGrid items={renderedItems} {emptyMessage} {useAnimation} {size}>
	{#snippet item(recipe)}
		{#if recipe.loading}
			<RecipeCard loading size={size} />
		{:else}
			<RecipeCard {size} {recipe} />
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

	.load-more-trigger {
		height: 1px;
		width: 100%;
	}
</style>
