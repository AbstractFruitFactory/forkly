<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { onMount } from 'svelte'
	import FilterSelector from '$lib/components/filter-selector/FilterSelector.svelte'

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
		onFiltersChange = (filters: { tags: string[]; ingredients: string[] }) => {},
		onSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {},
		searchTags = (query: string) => Promise.resolve<{ name: string; count: number }[]>([]),
		searchIngredients = (query: string) => Promise.resolve<{ id: string; name: string }[]>([])
	}: {
		recipes: Recipe[]
		isLoading?: boolean
		onSearchChange?: (query: string) => void
		onFiltersChange?: (filters: { tags: string[]; ingredients: string[] }) => void
		onSortChange?: (sortBy: 'popular' | 'newest' | 'easiest') => void
		searchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		searchIngredients?: (query: string) => Promise<{ id: string; name: string }[]>
	} = $props()

	let searchValue = $state('')
	let selectedTags = $state<string[]>([])
	let selectedIngredients = $state<string[]>([])
	let sortBy = $state<'popular' | 'newest' | 'easiest'>('popular')
	let isMac = $state(false)
	let searchInput: HTMLInputElement
	let availableTags = $state<{ name: string; count: number }[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			searchInput?.focus()
		}
	}

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')
	})

	const handleSearch = (query: string) => {
		searchValue = query
		onSearchChange(query)
	}

	const extractTagName = (formattedTag: string) => formattedTag.split(' (')[0]

	const formatTagWithCount = (tag: { name: string; count: number }) => `${tag.name} (${tag.count})`

	const handleTagSelect = (tag: string, selected: boolean) => {
		if (selected && !selectedTags.includes(tag)) {
			selectedTags = [...selectedTags, tag]
		} else if (!selected && selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag)
		}

		notifyFiltersChanged()
	}

	const handleIngredientSelect = (ingredient: string, selected: boolean) => {
		if (selected && !selectedIngredients.includes(ingredient)) {
			selectedIngredients = [...selectedIngredients, ingredient]
		} else if (!selected && selectedIngredients.includes(ingredient)) {
			selectedIngredients = selectedIngredients.filter((i) => i !== ingredient)
		}

		notifyFiltersChanged()
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t !== tag)
		notifyFiltersChanged()
	}

	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i !== ingredient)
		notifyFiltersChanged()
	}

	const handleSortClick = (newSortBy: 'popular' | 'newest' | 'easiest') => {
		sortBy = newSortBy
		onSortChange(newSortBy)
	}

	const notifyFiltersChanged = () => {
		onFiltersChange({
			tags: selectedTags.map(extractTagName),
			ingredients: selectedIngredients
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
		return tags.map(formatTagWithCount)
	}

	const loadIngredients = async (query: string): Promise<string[]> => {
		const ingredients = await searchIngredients(query)
		availableIngredients = ingredients
		return ingredients.map((ingredient) => ingredient.name)
	}

	const emptyStateMessage = $derived(
		searchValue || selectedTags.length > 0 || selectedIngredients.length > 0
			? 'No recipes found matching your criteria. Try different search terms or filters, or browse all recipes.'
			: 'No recipes yet! Be the first to create one.'
	)
</script>

<svelte:document onkeydown={handleKeyDown} />

{#snippet searchResultsHeader()}
	<div class="header-content">
		<div class="sort-controls">
			<Button
				variant={sortBy === 'popular' ? 'primary' : 'text'}
				size="sm"
				onclick={() => handleSortClick('popular')}
			>
				Popular
			</Button>
			<Button
				variant={sortBy === 'newest' ? 'primary' : 'text'}
				size="sm"
				onclick={() => handleSortClick('newest')}
			>
				Newest
			</Button>
			<Button
				variant={sortBy === 'easiest' ? 'primary' : 'text'}
				size="sm"
				onclick={() => handleSortClick('easiest')}
			>
				Easiest
			</Button>
		</div>
	</div>
{/snippet}

<div class="search-container">
	<div class="search-content">
		<div class="top-row">
			<div class="search-bar">
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
				/>
			</div>

			<div class="pill-selectors">
				<FilterSelector
					items={availableTags.map(formatTagWithCount)}
					bind:selectedItems={selectedTags}
					name="tags"
					loadItems={loadTags}
					onSelect={handleTagSelect}
					label="include tag"
				/>

				<FilterSelector
					items={availableIngredients.map((i) => i.name)}
					bind:selectedItems={selectedIngredients}
					name="ingredients"
					loadItems={loadIngredients}
					onSelect={handleIngredientSelect}
					label="include ingredient"
				/>
			</div>
		</div>

		{#if selectedTags.length > 0 || selectedIngredients.length > 0}
			<div class="selected-filters-container">
				<div class="selected-pills">
					{#each selectedTags as tag (tag)}
						<Pill text={tag} onRemove={() => removeTag(tag)} />
					{/each}

					{#each selectedIngredients as ingredient (ingredient)}
						<Pill text={ingredient} onRemove={() => removeIngredient(ingredient)} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<div class="home-container">
	{#if searchValue || selectedTags.length > 0 || selectedIngredients.length > 0}
		<div class="search-results-header">
			{@render searchResultsHeader()}

			<p class="results-count">
				{sortedRecipes.length}
				{sortedRecipes.length === 1 ? 'recipe' : 'recipes'} found
			</p>
		</div>
	{:else}
		{@render searchResultsHeader()}
	{/if}

	<RecipeGrid recipes={sortedRecipes} emptyMessage={emptyStateMessage} {isLoading} />
</div>

<style lang="scss">
	@import '$lib/global.scss';
	.home-container {
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
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
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
		display: flex;
		gap: var(--spacing-xs);
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
		gap: var(--spacing-md);
		width: 100%;
	}

	.top-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		align-items: center;
		width: 100%;

		@include tablet {
			gap: var(--spacing-sm);
			justify-content: center;
		}
	}

	.search-bar {
		min-width: 200px;
	}

	.pill-selectors {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.selected-filters-container {
		width: 100%;
		margin-top: var(--spacing-xs);
	}

	.selected-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		align-items: center;
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

	:global(.input-wrapper .action-button) {
		background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05)) !important;
		border-radius: var(--border-radius-sm) !important;
		color: var(--color-neutral) !important;
		font-family: monospace !important;
		font-size: var(--font-size-xs) !important;
		cursor: default !important;

		&:hover {
			color: var(--color-neutral) !important;
		}
	}
</style>
