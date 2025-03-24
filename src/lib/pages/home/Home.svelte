<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import PillSelector from '$lib/components/pill-selector/PillSelector.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
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

	// Get sorted recipes
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
		const tags = await searchTags(query);
		availableTags = tags;
		return tags.map(formatTagWithCount);
	}

	const loadIngredients = async (query: string): Promise<string[]> => {
		const ingredients = await searchIngredients(query);
		availableIngredients = ingredients;
		return ingredients.map(ingredient => ingredient.name);
	}
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
				<PillSelector
					items={availableTags.map(formatTagWithCount)}
					bind:selectedItems={selectedTags}
					name="tags"
					loadItems={loadTags}
					onSelect={handleTagSelect}
					label="+ tag"
				/>

				<PillSelector
					items={availableIngredients.map((i) => i.name)}
					bind:selectedItems={selectedIngredients}
					name="ingredients"
					loadItems={loadIngredients}
					onSelect={handleIngredientSelect}
					label="+ ingredient"
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

	{#if sortedRecipes.length === 0}
		<div class="empty-state">
			{#if searchValue || selectedTags.length > 0 || selectedIngredients.length > 0}
				<p>
					No recipes found matching your criteria. Try different search terms or filters, or <a
						href="/">browse all recipes</a
					>.
				</p>
			{:else}
				<p>No recipes yet! Be the first to <a href="/new">create one</a>.</p>
			{/if}
		</div>
	{:else}
		<div class="recipe-grid">
			{#each sortedRecipes as recipe}
				<RecipeCard {recipe} />
			{/each}
		</div>
	{/if}
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

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-lg);

		&:last-child {
			padding-bottom: var(--spacing-lg);
		}

		@include mobile {
			overflow-y: auto;
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

	/* Search Container Styles */
	.search-container {
		margin: var(--spacing-lg) 0;
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
		.recipe-grid {
			grid-template-columns: 1fr;
		}

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
