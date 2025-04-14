<script module lang="ts">
	export type Recipe = {
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
</script>

<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import RecipeCarousel from '$lib/components/recipe-carousel/RecipeCarousel.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import IngredientFilter from '$lib/components/ingredient-filter/IngredientFilter.svelte'
	import TagFilter from '$lib/components/tag-filter/TagFilter.svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
	import ScrollToTop from '$lib/components/scroll-to-top/ScrollToTop.svelte'
	import Drawer from '$lib/components/drawer/Drawer.svelte'

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
		searchIngredients = (query: string) => Promise.resolve<{ id: string; name: string }[]>([]),
		loadMore = () => Promise.resolve(),
		initialSearch = '',
		initialTags = [],
		initialIngredients = [],
		initialSort = 'popular'
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
		loadMore?: () => Promise<void>
		initialSearch?: string
		initialTags?: string[]
		initialIngredients?: { label: string; include: boolean }[]
		initialSort?: 'popular' | 'newest' | 'easiest'
	} = $props()

	let searchValue = $derived(initialSearch)
	let selectedTags = $derived(initialTags.map(tag => ({ label: tag, selected: true })))
	let selectedIngredients = $derived(initialIngredients)
	let sortBy = $derived(initialSort)
	let isMac = $state(false)
	let searchInput: HTMLInputElement
	let availableTags = $state<{ name: string; count: number }[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])
	let showScrollToTop = $state(false)
	let observer: IntersectionObserver
	let showFiltersDrawer = $state(false)
	let isMobile = $state(false)

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			searchInput?.focus()
		}
	}

	const checkMobile = () => {
		isMobile = window.innerWidth <= 768
	}

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')
		checkMobile()
		window.addEventListener('resize', checkMobile)

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
			window.removeEventListener('resize', checkMobile)
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
			selectedIngredients.length > 0
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

		<div class="desktop-filters">
			<TagFilter onSearch={loadTags} bind:selected={selectedTags} onSelect={notifyFiltersChanged} />

			<IngredientFilter
				onSearch={loadIngredients}
				bind:selected={selectedIngredients}
				onSelect={notifyFiltersChanged}
			/>
		</div>

		<div class="mobile-filters-button">
			<Button variant="primary" size="sm" fullWidth onclick={() => (showFiltersDrawer = true)}>
				Filters
			</Button>
		</div>
	</div>
</div>

{#snippet filterPills()}
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
{/snippet}

<Drawer bind:isOpen={showFiltersDrawer} title="Filters">
	<div class="mobile-filters">
		<div class="selected-filters">
			<h4 class="selected-filters-title">Selected Filters</h4>
			{@render filterPills()}
		</div>

		<TagFilter onSearch={loadTags} bind:selected={selectedTags} onSelect={notifyFiltersChanged} />

		<IngredientFilter
			onSearch={loadIngredients}
			bind:selected={selectedIngredients}
			onSelect={notifyFiltersChanged}
		/>
	</div>
</Drawer>

<div class="selected-filters-container">
	{@render filterPills()}
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
		<div class="desktop-view">
			<RecipeGrid recipes={sortedRecipes} emptyMessage={emptyStateMessage} {isLoading} {loadMore} />
		</div>

		<div class="mobile-view">
			{#if sortedRecipes.length > 0}
				<div class="carousel-container">
					<RecipeCarousel recipes={sortedRecipes} {loadMore} />
				</div>
			{:else}
				<div class="empty-state">{emptyStateMessage}</div>
			{/if}
		</div>

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

		@include mobile {
			display: none;
		}
	}

	.home-container {
		position: relative;
		overflow: visible;

		@include mobile {
			padding: var(--spacing-lg) 0;
		}
	}

	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content {
		display: flex;
		justify-content: center;
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
	}

	.search-container {
		margin: var(--spacing-lg) 0;

		@include tablet {
			margin: var(--spacing-lg);
		}

		@include mobile {
			margin: 0;
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

		.selected-pills {
			display: flex;
			flex-wrap: wrap;
			gap: var(--spacing-sm);
			align-items: center;
		}
	}

	.recipe-grid {
		position: relative;
	}

	.desktop-view {
		display: block;

		@include mobile {
			display: none;
		}
	}

	.mobile-view {
		display: none;

		@include mobile {
			display: block;
		}
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
</style>
