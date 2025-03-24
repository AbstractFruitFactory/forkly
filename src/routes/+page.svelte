<script lang="ts" module>
	const calculatePopularityScore = (recipe: {
		dislikes: number
		bookmarks: number
		likes: number
		createdAt: string
	}): number => {
		const engagementScore = recipe.bookmarks * 2 + recipe.likes - recipe.dislikes * 1.5

		const ageInDays = (Date.now() - new Date(recipe.createdAt).getTime()) / (1000 * 60 * 60 * 24)
		const recencyBoost = Math.max(0, 10 - Math.min(10, ageInDays / 30))

		return engagementScore + recencyBoost
	}
</script>

<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import { onMount } from 'svelte'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesSearchResponse } from './api/recipes/search/+server.js'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server.js'
	import type { TagSearchResponse } from './api/tags/+server.js'
	import { nullToUndefined } from '$lib/utils/nullToUndefined.js'
	import { toHomePageRecipe } from '$lib/utils/recipe.js'
	import PillSelector from '$lib/components/pill-selector/PillSelector.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'

	let { data } = $props()
	let searchValue = $state('')
	let searchInput: HTMLInputElement
	let isMac = $state(false)

	let isSearchLoading = $state(false)
	let searchResults = $state<ReturnType<typeof toHomePageRecipe>[]>()
	let isResultsLoading = $state(false)

	// Tag related state
	let selectedTags = $state<string[]>([])
	let availableTags = $state<{ name: string; count: number }[]>([])

	// Ingredient related state
	let selectedIngredients = $state<string[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])

	// Create a formatter for tag display
	const formatTagWithCount = (tag: { name: string; count: number }) => `${tag.name} (${tag.count})`

	// Function to extract tag name from formatted tag
	const extractTagName = (formattedTag: string) => formattedTag.split(' (')[0]

	// Handle tag removal
	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t !== tag)
	}

	// Handle ingredient removal
	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i !== ingredient)
	}

	// Handle tag selection/deselection
	const handleTagSelect = (tag: string, selected: boolean) => {
		if (selected && !selectedTags.includes(tag)) {
			selectedTags = [...selectedTags, tag]
		} else if (!selected && selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag)
		}
	}

	// Handle ingredient selection/deselection
	const handleIngredientSelect = (ingredient: string, selected: boolean) => {
		if (selected && !selectedIngredients.includes(ingredient)) {
			selectedIngredients = [...selectedIngredients, ingredient]
		} else if (!selected && selectedIngredients.includes(ingredient)) {
			selectedIngredients = selectedIngredients.filter((i) => i !== ingredient)
		}
	}

	let sortParam = $state<'popular' | 'newest' | 'easiest'>('popular')

	let prevDietsLength = $state(0)
	let prevIngredientsLength = $state(0)

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
	}

	const handleSearch = async (
		query: string,
		filters?: { tags: string[]; ingredients: string[] }
	) => {
		if (
			!query.trim() &&
			(!filters || (filters.tags.length === 0 && filters.ingredients.length === 0))
		) {
			searchResults = undefined
			return
		}

		isSearchLoading = true
		isResultsLoading = true

		let url = `/api/recipes/search?q=${encodeURIComponent(query)}`

		if (filters) {
			if (filters.tags.length > 0) {
				url += `&tags=${filters.tags.join(',')}`
			}
			if (filters.ingredients.length > 0) {
				url += `&ingredients=${filters.ingredients.join(',')}`
			}
		}

		const response = await safeFetch<RecipesSearchResponse>()(url)

		if (response.isOk()) {
			const data = response.value
			console.log(data.results)
			searchResults = nullToUndefined(data.results).map(toHomePageRecipe)
		}

		isSearchLoading = false
		isResultsLoading = false
	}

	const searchIngredients = async (query: string): Promise<string[]> => {
		if (!query.trim()) return []

		const result = await safeFetch<IngredientLookupResult>()(`/api/ingredients/lookup/${query}`)

		if (result.isOk()) {
			// Store the full ingredient data and return just the names for the selector
			availableIngredients = result.value
			return result.value.map((ingredient) => ingredient.name)
		}
		return []
	}

	const searchTags = async (query: string): Promise<string[]> => {
		const response = await safeFetch<TagSearchResponse>()(
			`/api/tags?q=${encodeURIComponent(query)}`
		)

		if (response.isOk()) {
			// Return the tag names with count format
			availableTags = response.value.tags
			return response.value.tags.map(formatTagWithCount)
		}

		return []
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			searchInput?.focus()
		}
	}

	const sortedRecipes = $derived(
		[...(searchResults ? searchResults : data.recipes)].sort((a, b) => {
			switch (sortParam) {
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

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')
	})

	$effect(() => {
		const currentTagsLength = selectedTags.length
		const currentIngredientsLength = selectedIngredients.length

		if (
			currentTagsLength > 0 ||
			prevDietsLength > 0 ||
			currentIngredientsLength > 0 ||
			prevIngredientsLength > 0 ||
			searchValue.trim()
		) {
			handleSearch(searchValue, {
				tags: selectedTags.map(extractTagName),
				ingredients: selectedIngredients
			})
		}

		prevDietsLength = currentTagsLength
		prevIngredientsLength = currentIngredientsLength
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

<svelte:document onkeydown={handleKeyDown} />

<div class="search-container">
	<div class="search-content">
		<div class="top-row">
			<div class="search-bar">
				<Search
					placeholder="Search recipes..."
					onInput={(query) => {
						searchValue = query
						handleSearch(query, {
							tags: selectedTags.map(extractTagName),
							ingredients: selectedIngredients
						})
					}}
					bind:inputElement={searchInput}
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
					loadItems={searchTags}
					onSelect={handleTagSelect}
					label="+ tag"
				/>

				<PillSelector
					items={availableIngredients.map((i) => i.name)}
					bind:selectedItems={selectedIngredients}
					name="ingredients"
					loadItems={searchIngredients}
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

<Home recipes={sortedRecipes} sortBy={sortParam} onSortChange={handleSortChange} />

<style lang="scss">
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
