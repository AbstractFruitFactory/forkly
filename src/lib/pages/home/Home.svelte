<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { onMount } from 'svelte'
	import FilterSelector from '$lib/components/filter-selector/FilterSelector.svelte'
	import { fly } from 'svelte/transition'
	import IngredientFilter from '$lib/components/ingredient-filter/IngredientFilter.svelte'
	import TagFilter from '$lib/components/tag-filter/TagFilter.svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
	import ScrollToTop from '$lib/components/scroll-to-top/ScrollToTop.svelte'

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
		bookmarks: number
		createdAt: string
		dislikes?: number
	}

	let {
		recipes,
		isLoading = false,
		onSearchChange = (query: string) => {},
		onFiltersChange = (filters: {
			tags: string[]
			ingredients: string[]
			excludedIngredients: string[]
		}) => {},
		onSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {},
		searchTags = (query: string) => Promise.resolve<{ name: string; count: number }[]>([]),
		searchIngredients = (query: string) => Promise.resolve<{ id: string; name: string }[]>([])
	}: {
		recipes: Recipe[]
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
	} = $props()

	let searchValue = $state('')
	let selectedTags = $state<{ label: string; selected?: boolean }[]>([])
	let selectedIngredients = $state<{ label: string; include: boolean }[]>([])
	let excludedIngredients = $state<string[]>([])
	let sortBy = $state<'popular' | 'newest' | 'easiest'>('popular')
	let isMac = $state(false)
	let searchInput: HTMLInputElement
	let availableTags = $state<{ name: string; count: number }[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])
	let showScrollToTop = $state(false)
	let observer: IntersectionObserver

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			searchInput?.focus()
		}
	}

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')

		observer = new IntersectionObserver(
			(entries) => {
				showScrollToTop = !entries[0].isIntersecting
			},
			{
				threshold: 0
			}
		)

		const searchContainer = document.querySelector('.search-container')
		if (searchContainer) {
			observer.observe(searchContainer)
		}

		return () => {
			observer?.disconnect()
		}
	})

	const handleSearch = (query: string) => {
		searchValue = query
		onSearchChange(query)
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t.label !== tag)
		notifyFiltersChanged()
	}

	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i.label !== ingredient)
		notifyFiltersChanged()
	}

	const handleSortClick = (newSortBy: string) => {
		sortBy = newSortBy as 'popular' | 'newest' | 'easiest'
		onSortChange(sortBy)
	}

	const notifyFiltersChanged = () => {
		onFiltersChange({
			tags: selectedTags.map((t) => t.label),
			ingredients: selectedIngredients.filter((i) => i.include).map((i) => i.label),
			excludedIngredients: selectedIngredients.filter((i) => !i.include).map((i) => i.label)
		})
	}

	const calculatePopularityScore = (recipe: Recipe): number => {
		if (!recipe.dislikes) return recipe.likes

		const engagementScore = recipe.likes - recipe.dislikes * 1.5

		const ageInDays = (Date.now() - new Date(recipe.createdAt).getTime()) / (1000 * 60 * 60 * 24)
		const recencyBoost = Math.max(0, 10 - Math.min(10, ageInDays / 30))

		return engagementScore + recencyBoost
	}

	const sortedRecipes = $derived(
		[...recipes].sort((a, b) => {
			switch (sortBy) {
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
		searchValue ||
			selectedTags.length > 0 ||
			selectedIngredients.length > 0 ||
			excludedIngredients.length > 0
			? 'No recipes found matching your criteria. Try different search terms or filters, or browse all recipes.'
			: 'No recipes yet! Be the first to create one.'
	)
</script>

<svelte:document onkeydown={handleKeyDown} />

<div
	class="search-container"
	in:fly={{ x: -50, duration: 300, delay: 300 }}
	out:fly={{ x: -50, duration: 300 }}
>
	<h1 class="home-title">Explore Recipes</h1>
	<div class="search-content">
		<Search
			placeholder="Search recipes..."
			onInput={(query) => handleSearch(query)}
			bind:value={searchValue}
			bind:inputElement={searchInput}
			{isLoading}
			actionButton={{
				text: isMac ? '⌘+K' : 'Ctrl+K',
				onClick: () => searchInput?.focus()
			}}
			roundedCorners
		/>

		<div class="pill-selectors">
			<TagFilter onSearch={loadTags} bind:selected={selectedTags} onSelect={notifyFiltersChanged} />

			<IngredientFilter
				onSearch={loadIngredients}
				bind:selected={selectedIngredients}
				onSelect={notifyFiltersChanged}
			/>
		</div>
	</div>
</div>

<div class="selected-filters-container">
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
	<div class="header-content">
		<div
			class="sort-controls"
			in:fly={{ x: -50, duration: 300, delay: 300 }}
			out:fly={{ x: -50, duration: 300 }}
		>
			<TabSelect
				options={['Popular', 'Newest', 'Easiest']}
				selected={sortBy}
				onSelect={(option) => handleSortClick(option.toLowerCase())}
			/>
		</div>
	</div>

	<div class="recipe-grid">
		<RecipeGrid recipes={sortedRecipes} emptyMessage={emptyStateMessage} {isLoading} />

		{#if showScrollToTop}
			<div class="scroll-to-top">
				<ScrollToTop />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.home-title {
		text-align: center;
		margin: var(--spacing-lg) 0;
	}

	.home-container {
		position: relative;

		@include mobile {
			padding: var(--spacing-lg);
			padding-bottom: 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
		}
	}

	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content {
		display: flex;
		justify-content: center;
		margin-bottom: var(--spacing-sm);
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
	}

	.search-container {
		margin: var(--spacing-lg) 0;

		@include tablet {
			margin: var(--spacing-lg);
		}
	}

	.search-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		width: 100%;
	}

	.pill-selectors {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.selected-filters-container {
		width: 100%;
		margin: var(--spacing-lg) 0;
		min-height: 40px;
		display: flex;
		justify-content: center;
	}

	.selected-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		align-items: center;
		justify-content: center;
		max-width: 800px;
	}

	@media (max-width: 640px) {
		.active-filters {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.sort-controls {
			width: 100%;
			justify-content: space-between;
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
	}
</style>
