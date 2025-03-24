<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesSearchResponse } from './api/recipes/search/+server.js'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server.js'
	import type { TagSearchResponse } from './api/tags/+server.js'
	import { nullToUndefined } from '$lib/utils/nullToUndefined.js'
	import { toHomePageRecipe } from '$lib/utils/recipe.js'

	let { data } = $props()
	let searchValue = $state('')

	let isLoading = $state(false)
	let searchResults = $state<ReturnType<typeof toHomePageRecipe>[]>()

	let activeFilters = $state<{ tags: string[]; ingredients: string[] }>({
		tags: [],
		ingredients: []
	})

	let sortParam = $state<'popular' | 'newest' | 'easiest'>('popular')

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

		isLoading = true

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
			searchResults = nullToUndefined(data.results).map(toHomePageRecipe)
		}

		isLoading = false
	}

	const searchIngredients = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!query.trim()) return []

		const result = await safeFetch<IngredientLookupResult>()(`/api/ingredients/lookup/${query}`)

		return result.isOk() ? result.value : []
	}

	const searchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		const response = await safeFetch<TagSearchResponse>()(
			`/api/tags?q=${encodeURIComponent(query)}`
		)

		return response.isOk() ? response.value.tags : []
	}

	const handleFiltersChange = (filters: { tags: string[]; ingredients: string[] }) => {
		activeFilters = filters
	}

	const handleSearchChange = (query: string) => {
		searchValue = query
	}

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
	}

	const recipes = $derived(
		searchResults &&
			(searchValue.trim() || activeFilters.tags.length > 0 || activeFilters.ingredients.length > 0)
			? searchResults
			: data.recipes
	)

	$effect(() => {
		if (
			searchValue.trim() ||
			activeFilters.tags.length > 0 ||
			activeFilters.ingredients.length > 0
		) {
			handleSearch(searchValue, activeFilters)
		} else {
			searchResults = undefined
		}
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

<Home
	{recipes}
	{isLoading}
	onSearchChange={handleSearchChange}
	onFiltersChange={handleFiltersChange}
	onSortChange={handleSortChange}
	{searchTags}
	{searchIngredients}
/>
