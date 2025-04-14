<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server'
	import type { TagSearchResponse } from './api/tags/+server'
	import type { RecipesSearchResponse } from './api/recipes/search/+server'
	import { toHomePageRecipe } from '$lib/utils/recipe'

	let { data } = $props()

	let recipes = $derived(data.recipes)
	let searchValue = $state(data.initialState.search)
	let isLoading = $state(false)
	let activeFilters = $state({
		tags: data.initialState.tags,
		ingredients: data.initialState.ingredients,
		excludedIngredients: data.initialState.excludedIngredients
	})
	let sortParam = $state<'popular' | 'newest' | 'easiest'>(data.initialState.sort)

	// Pagination state
	let pagination = $state({
		page: 0,
		limit: 18,
		hasMore: true,
		isLoading: false
	})

	const updateUrl = (params: Record<string, string>) => {
		const url = new URL(page.url)
		Object.entries(params).forEach(([key, value]) => {
			if (value === '') {
				url.searchParams.delete(key)
			} else {
				url.searchParams.set(key, value)
			}
		})
		goto(url.toString(), { keepFocus: true })
	}

	const handleSearch = async (
		query: string,
		filters?: { tags: string[]; ingredients: string[]; excludedIngredients: string[] }
	) => {
		const params: Record<string, string> = {
			q: query,
			limit: pagination.limit.toString(),
			page: '0'
		}

		if (filters) {
			if (filters.tags.length > 0) {
				params.tags = filters.tags.join(',')
			} else {
				params.tags = ''
			}
			if (filters.ingredients.length > 0) {
				params.ingredients = filters.ingredients.join(',')
			} else {
				params.ingredients = ''
			}
			if (filters.excludedIngredients.length > 0) {
				params.excludedIngredients = filters.excludedIngredients.join(',')
			} else {
				params.excludedIngredients = ''
			}
		}

		updateUrl(params)
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

	const handleFiltersChange = (filters: {
		tags: string[]
		ingredients: string[]
		excludedIngredients: string[]
	}) => {
		activeFilters = filters
		handleSearch(searchValue, filters)
	}

	const handleSearchChange = (query: string) => {
		searchValue = query
		handleSearch(query, activeFilters)
	}

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
		updateUrl({ sort: sortBy })
	}

	const loadMore = async () => {
		if (pagination.isLoading || !pagination.hasMore) return

		pagination.isLoading = true

		const url = new URL('/api/recipes/search', window.location.origin)
		
		// Preserve all current query parameters
		const currentParams = new URLSearchParams(page.url.search)
		currentParams.forEach((value, key) => {
			url.searchParams.set(key, value)
		})
		
		// Update pagination parameters
		url.searchParams.set('limit', pagination.limit.toString())
		url.searchParams.set('page', (pagination.page + 1).toString())

		const response = await safeFetch<RecipesSearchResponse>()(url.toString())
		let newData: RecipesSearchResponse

		if (response.isOk()) {
			newData = response.value
		} else {
			pagination.isLoading = false
			console.error('Failed to load more recipes:', response.error)
			return
		}

		const newRecipes = newData.results.map(toHomePageRecipe)

		recipes = [...recipes, ...newRecipes]

		pagination = {
			...pagination,
			hasMore: newRecipes.length === pagination.limit,
			page: pagination.page + 1,
			isLoading: false
		}
	}
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
	{loadMore}
	initialSearch={searchValue}
	initialTags={activeFilters.tags}
	initialIngredients={[
		...activeFilters.ingredients.map(label => ({ label, include: true })),
		...activeFilters.excludedIngredients.map(label => ({ label, include: false }))
	]}
	initialSort={sortParam}
/>
