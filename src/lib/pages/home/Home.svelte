<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { onMount, type ComponentProps, type Snippet } from 'svelte'
	import { setSlots } from '../../../routes/+layout.svelte'
	import { writable } from 'svelte/store'
	import IngredientFilter from '$lib/components/ingredient-filter/IngredientFilter.svelte'
	import TagFilter from '$lib/components/tag-filter/TagFilter.svelte'
	import OptionFilterSelect from '$lib/components/filter-select/OptionFilterSelect.svelte'

	let {
		recipes,
		isLoading = false,
		onFiltersChange = (filters: {
			tags: string[]
			ingredients: string[]
			excludedIngredients: string[]
		}) => {},
		onSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {},
		searchTags = (query: string) => Promise.resolve<{ name: string; count: number }[]>([]),
		searchIngredients = (query: string) => Promise.resolve<{ id: string; name: string }[]>([]),
		loadMore = () => Promise.resolve(),
		initialTags = [],
		initialIngredients = [],
		initialSort = 'popular',
		onSearchbarSticky = (isSticky: boolean) => {}
	}: {
		recipes: ComponentProps<typeof RecipeGrid>['recipes']
		isLoading?: boolean
		onSearchChange?: (query: string) => void
		onFiltersChange?: (filters: {
			tags: string[]
			ingredients: string[]
			excludedIngredients: string[]
		}) => void
		onSortChange?: (sortBy: 'popular' | 'newest' | 'easiest') => void
		searchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		searchIngredients?: (query: string) => Promise<{ id: string; name: string }[]>
		loadMore?: () => Promise<void>
		initialTags?: string[]
		initialIngredients?: { label: string; include: boolean }[]
		initialSort?: 'popular' | 'newest' | 'easiest'
		onSearchbarSticky?: (isSticky: boolean) => void
	} = $props()

	let selectedTags = $state<{ label: string; selected: boolean }[]>([])
	let selectedIngredients = $state<{ label: string; include: boolean }[]>([])
	let availableTags = $state<{ name: string; count: number }[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])
	let isMobile = $state(false)
	let searchbarIsSticky = $state(false)
	let hasInitializedObserver = false
	let sentinelNode = writable<HTMLElement | null>(null)

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)

		// Initialize selected values
		selectedTags = initialTags.map((tag) => ({ label: tag, selected: true }))
		selectedIngredients = initialIngredients

		let observer: IntersectionObserver | null = null
		let unsubscribe = sentinelNode.subscribe((node) => {
			if (observer) {
				observer.disconnect()
				observer = null
			}
			if (node) {
				observer = new window.IntersectionObserver(
					(entries) => {
						if (!hasInitializedObserver) {
							hasInitializedObserver = true
							return
						}
						searchbarIsSticky = entries[0].intersectionRatio < 1
						onSearchbarSticky(searchbarIsSticky)
					},
					{ root: null, threshold: 1 }
				)
				observer.observe(node)
			}
		})
		return () => {
			if (observer) observer.disconnect()
			window.removeEventListener('resize', checkMobile)
			unsubscribe()
		}
	})

	$effect(() => {
		onFiltersChange({
			tags: selectedTags.map((t) => t.label),
			ingredients: selectedIngredients.filter((i) => i.include).map((i) => i.label),
			excludedIngredients: selectedIngredients.filter((i) => !i.include).map((i) => i.label)
		})
	})

	const sortOptions = [
		{ label: 'Popular', value: 'popular' },
		{ label: 'Newest', value: 'newest' },
		{ label: 'Easiest', value: 'easiest' }
	]

	let sortBy = $derived(sortOptions.find((option) => option.value === initialSort)!)

	const checkMobile = () => {
		isMobile = window.innerWidth <= 768
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t.label !== tag)
		notifyFiltersChanged()
	}

	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i.label !== ingredient)
		notifyFiltersChanged()
	}

	const notifyFiltersChanged = () => {
		onFiltersChange({
			tags: selectedTags.map((t) => t.label),
			ingredients: selectedIngredients.filter((i) => i.include).map((i) => i.label),
			excludedIngredients: selectedIngredients.filter((i) => !i.include).map((i) => i.label)
		})
	}

	const calculatePopularityScore = (recipe: (typeof recipes)[number]): number => {
		if (!recipe.dislikes) return recipe.likes

		const engagementScore = recipe.likes - recipe.dislikes * 1.5

		const ageInDays = (Date.now() - new Date(recipe.createdAt).getTime()) / (1000 * 60 * 60 * 24)
		const recencyBoost = Math.max(0, 10 - Math.min(10, ageInDays / 30))

		return engagementScore + recencyBoost
	}

	const sortedRecipes = $derived(
		[...recipes].sort((a, b) => {
			switch (sortBy.value) {
				case 'popular':
					return calculatePopularityScore(b) - calculatePopularityScore(a)
				case 'newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				case 'easiest':
					return a.ingredients + a.instructions - (b.ingredients + b.instructions)
				default:
					return 0
			}
		})
	)

	const loadTags = async (query: string): Promise<string[]> => {
		const tags = await searchTags(query)
		availableTags = tags
		return tags.map((tag) => tag.name)
	}

	const loadIngredients = async (query: string): Promise<string[]> => {
		const ingredients = await searchIngredients(query)
		availableIngredients = ingredients
		return ingredients.map((ingredient) => ingredient.name)
	}

	const emptyStateMessage = $derived(
		selectedTags.length > 0 || selectedIngredients.length > 0
			? 'No recipes found matching your criteria. Try different search terms or filters, or browse all recipes.'
			: 'No recipes yet! Be the first to create one.'
	)

	setSlots({ homepageHeader, content })
</script>

{#snippet homepageHeader(searchBar?: Snippet<['homepage' | 'header']>)}
	<div class="large-header">Explore recipes</div>

	<div bind:this={$sentinelNode} style="height: 60px;"></div>

	<div class="search-content">
		{@render searchBar?.('homepage')}
	</div>
{/snippet}

{#snippet content()}
	<div class="main-layout" class:expanded={searchbarIsSticky}>
		<div class="filters">
			<div class="buttons">
				<div>
					<IngredientFilter onSearch={loadIngredients} bind:selected={selectedIngredients} />

					<TagFilter onSearch={loadTags} bind:selected={selectedTags} />
				</div>

				<OptionFilterSelect label="Sort by" options={sortOptions} bind:selected={sortBy}>
					{#snippet item(option, select)}
						<button
							onclick={() => {
								select(option)
								onSortChange(option.value as 'popular' | 'newest' | 'easiest')
							}}
						>
							{option.label}
						</button>
					{/snippet}
				</OptionFilterSelect>
			</div>

			<div class="selected-pills">
				{#each selectedTags as tag (tag.label)}
					<Pill text={tag.label} onRemove={() => removeTag(tag.label)} />
				{/each}

				{#each selectedIngredients.filter((i) => i.include) as ingredient (ingredient.label)}
					<Pill text={ingredient.label} onRemove={() => removeIngredient(ingredient.label)} />
				{/each}

				{#each selectedIngredients.filter((i) => !i.include) as ingredient (ingredient.label)}
					<Pill text={`-${ingredient.label}`} onRemove={() => removeIngredient(ingredient.label)} />
				{/each}
			</div>
		</div>

		<div class="home-container">
			<div class="recipe-grid">
				<RecipeGrid
					recipes={sortedRecipes}
					emptyMessage={emptyStateMessage}
					{isLoading}
					{loadMore}
				/>
			</div>
		</div>
	</div>
{/snippet}

<style lang="scss">
	@import '$lib/global.scss';

	$max-width: 1200px;

	.header {
		position: absolute;
		top: 0;
		z-index: var(--z-sticky);
		width: 100%;
		background: var(--color-primary);

		.header-content {
			max-width: $max-width;
			margin: 0 auto;
			padding: 0 var(--spacing-2xl);
		}

		&.hidden {
			opacity: 0;
			transition: opacity 0.2s ease-in-out;
		}

		@include mobile {
			display: none;
		}
	}

	.large-header {
		color: black;
		font-size: 2rem;
		font-weight: 600;
		text-align: center;
		padding: var(--spacing-2xl) 0;

		@include mobile {
			padding: 0;
			padding-top: var(--spacing-xl);
		}
	}

	.header-actions-main {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-2xl);
		z-index: var(--z-sticky);
	}

	.home-title {
		text-align: center;
		margin: var(--spacing-lg) 0;

		@include mobile {
			display: none;
		}
	}

	.home-container {
		position: relative;
		overflow: visible;

		margin-top: var(--spacing-xs);

		@include mobile {
			padding: var(--spacing-lg) 0;
		}
	}

	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content {
		display: flex;
		justify-content: flex-start;
		margin-bottom: var(--spacing-sm);

		@include mobile {
			display: none;
		}
	}

	.search-results-header h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-neutral-light);
	}

	.results-count {
		color: var(--color-neutral);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.sort-controls {
		margin: var(--spacing-sm) 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: var(--spacing-md);
	}

	.search-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		height: 3rem;

		padding: 0 var(--spacing-xl);

		:global(.homepage-searchbar) {
			width: 100%;
			max-width: 30rem;
		}
	}

	.pill-selectors {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

		.buttons {
			display: flex;
			gap: var(--spacing-md);
			align-items: center;
			justify-content: space-between;

			> * {
				display: flex;
				gap: var(--spacing-md);
			}
		}
	}

	.selected-pills {
		width: 100%;
		min-height: 40px;
		display: flex;
		gap: var(--spacing-sm);
		overflow-x: auto;
		scrollbar-width: none;

		@include mobile {
			display: none;
		}
	}

	.selected-filters {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-neutral);

		.selected-filters-title {
			margin: 0 0 var(--spacing-sm) 0;
			font-size: var(--font-size-md);
			font-weight: 500;
			color: var(--color-neutral-light);
		}
	}

	.recipe-grid {
		position: relative;
	}

	.scroll-to-top {
		display: none;

		@include desktop {
			display: block;
			position: fixed;
			top: 100px;
			transform: translateX(-100px);
		}
	}

	:global(.search-content .input-wrapper .action-button) {
		background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05)) !important;
		border-radius: var(--border-radius-full) !important;
		color: var(--color-neutral) !important;
		font-family: monospace !important;
		font-size: var(--font-size-xs) !important;
		cursor: default !important;

		&:hover {
			color: var(--color-neutral) !important;
		}

		@include mobile;
		@include tablet {
			display: none;
		}
	}

	.desktop-filters {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;

		@include mobile {
			display: none;
		}
	}

	.mobile-filters-button {
		display: none;

		@include mobile {
			display: block;
			width: 100%;
		}
	}

	.mobile-filters {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) 0;
	}

	.carousel-container {
		width: 100%;
		height: 400px;
		margin: 0;
		width: 100vw;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
	}

	.recipe-card {
		background-color: var(--color-neutral-darker);
		border-radius: var(--border-radius);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.recipe-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.recipe-image-placeholder {
		width: 100%;
		height: 200px;
		background-color: var(--color-neutral);
	}

	.recipe-content {
		padding: var(--spacing-md);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.recipe-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-neutral-light);
	}

	.recipe-description {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.recipe-stats {
		display: flex;
		gap: var(--spacing-md);
		margin-top: auto;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-neutral);
		font-size: var(--font-size-sm);

		svg {
			color: var(--color-primary);
		}
	}

	.empty-state {
		text-align: center;
		color: var(--color-neutral);
		padding: var(--spacing-xl);
	}

	.pill-sort-group {
		display: flex;
		gap: 1.5rem;
	}

	.pill-sort-btn {
		background: var(--color-neutral-dark);
		border: none;
		border-radius: var(--border-radius-full);
		height: 40px;
		width: 90px;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		transition:
			background 0.2s,
			color 0.2s;
		cursor: pointer;
		outline: none;

		&.active {
			background: var(--color-secondary);
			color: #22232e;
		}
	}

	.sticky-header {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky) + 2;
		width: 100vw;
		background: var(--color-primary);
		left: 50%;
		transform: translateX(-50%);
		max-width: 100vw;
	}
</style>
