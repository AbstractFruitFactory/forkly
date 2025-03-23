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
	import type { DietType } from '$lib/types.js'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesSearchResponse } from './api/recipes/search/+server.js'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server.js'
	import { nullToUndefined } from '$lib/utils/nullToUndefined.js'
	import { toHomePageRecipe } from '$lib/utils/recipe.js'
	import PillSelector from '$lib/components/pill-selector/PillSelector.svelte'
	import { dietTypes, dietColors } from '$lib/types.js'

	let { data } = $props()
	let searchValue = $state('')
	let searchInput: HTMLInputElement
	let isMac = $state(false)

	let isSearchLoading = $state(false)
	let searchResults = $state<ReturnType<typeof toHomePageRecipe>[]>([])
	let isResultsLoading = $state(false)
	let selectedDiets = $state<DietType[]>([])

	let sortParam = $state<'popular' | 'newest' | 'easiest'>('popular')

	let prevDietsLength = $state(0)

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
	}

	const handleSearch = async (
		query: string,
		filters?: { diets: DietType[]; ingredients: string[] }
	) => {
		if (
			!query.trim() &&
			(!filters || (filters.diets.length === 0 && filters.ingredients.length === 0))
		) {
			searchResults = []
			return
		}

		isSearchLoading = true
		isResultsLoading = true

		let url = `/api/recipes/search?q=${encodeURIComponent(query)}`

		if (filters) {
			if (filters.diets.length > 0) {
				url += `&diets=${filters.diets.join(',')}`
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

	const searchIngredients = async (query: string) => {
		if (!query.trim()) return []

		const result = await safeFetch<IngredientLookupResult>()(`/api/ingredients/lookup/${query}`)

		if (result.isOk()) return result.value
		return []
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			searchInput?.focus()
		}
	}

	const sortedRecipes = $derived(
		[...(searchResults.length ? searchResults : data.recipes)].sort((a, b) => {
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
		const currentLength = selectedDiets.length

		if (currentLength > 0 || prevDietsLength > 0 || searchValue.trim()) {
			handleSearch(searchValue, { diets: selectedDiets, ingredients: [] })
		}

		prevDietsLength = currentLength
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

<svelte:document onkeydown={handleKeyDown} />

<div class="search-container">
	<div class="search-content">
		<div>
			<Search
				placeholder="Search recipes..."
				onInput={(query) => {
					searchValue = query
					handleSearch(query, { diets: selectedDiets, ingredients: [] })
				}}
				bind:inputElement={searchInput}
				actionButton={{
					text: isMac ? '⌘K' : 'Ctrl+K',
					onClick: () => searchInput?.focus()
				}}
			/>
		</div>
		<div class="diet-pills">
			<PillSelector
				items={dietTypes}
				bind:selectedItems={selectedDiets}
				name="diets"
				colorMap={dietColors}
			/>
		</div>
	</div>
</div>

<Home recipes={sortedRecipes} sortBy={sortParam} onSortChange={handleSortChange} />

<style lang="scss">
	.search-container {
		margin: var(--spacing-lg) 0;
	}

	.search-content {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.diet-pills {
		display: flex;
		align-items: center;
		justify-content: center;
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
