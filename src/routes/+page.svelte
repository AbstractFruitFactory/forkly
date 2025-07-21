<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { invalidateAll } from '$app/navigation'
	import { safeFetch } from '$lib/utils/fetch'
	import type { IngredientLookupResult } from './(api)/ingredients/lookup/[query]/+server'
	import type { TagSearchResponse } from './(api)/tags/+server'
	import { scrolledDownHomepageStore } from './+layout.svelte'
	import { onMount } from 'svelte'
	import { useCookies } from '$lib/utils/cookies'

	let { data } = $props()

	let recipes: typeof data.recipes = $state(Promise.resolve([]))
	let isLoading = $state(false)

	$effect(() => {
		data.recipes.then(async (r) => {
			if (data.loadedPage) {
				const existingRecipes = await recipes
				recipes = Promise.resolve([...existingRecipes, ...r])
			} else {
				recipes = Promise.resolve(r)
			}
			isLoading = false
			pagination.isLoading = false
		})
	})

	let searchValue = $derived(data.initialState.search)
	let activeFilters = $derived({
		tags: data.initialState.tags,
		ingredients: data.initialState.ingredients,
		excludedIngredients: data.initialState.excludedIngredients
	})
	let sortParam = $derived(data.initialState.sort)

	let pagination = $state({
		page: 0,
		isLoading: false
	})



	const handleSearch = async (
		query: string,
		filters?: { tags: string[]; ingredients: string[]; excludedIngredients: string[] }
	) => {
		pagination = {
			page: 0,
			isLoading: false
		}

		isLoading = true

		useCookies('search').set({
			query,
			tags: filters?.tags || [],
			ingredients: filters?.ingredients || [],
			excludedIngredients: filters?.excludedIngredients || [],
			sort: sortParam
		})

		invalidateAll()
	}

	const searchIngredients = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!query.trim()) return []
		const result = await safeFetch<IngredientLookupResult>()(`/ingredients/lookup/${query}`)
		return result.isOk() ? result.value : []
	}

	const searchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		const response = await safeFetch<TagSearchResponse>()(
			`/tags?q=${encodeURIComponent(query)}`
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
		isLoading = true
		const currentSearch = useCookies('search').get()
		useCookies('search').set({
			query: currentSearch?.query || '',
			tags: currentSearch?.tags || [],
			ingredients: currentSearch?.ingredients || [],
			excludedIngredients: currentSearch?.excludedIngredients || [],
			sort: sortBy
		})
	}

	const loadMore = async () => {
		if (pagination.isLoading) return

		const hasMore = await data.hasMore
		if (!hasMore) return

		pagination.isLoading = true
		isLoading = true

		useCookies('pagination').set({
			page: pagination.page + 1
		})

		pagination = {
			page: pagination.page + 1,
			isLoading: true
		}

		invalidateAll()
	}

	const onSearchbarSticky = (isSticky: boolean) => {
		isSticky ? scrolledDownHomepageStore.setTrue() : scrolledDownHomepageStore.setFalse()
	}
</script>

<Home
	{recipes}
	onSearch={handleSearchChange}
	onFiltersChange={handleFiltersChange}
	onSortChange={handleSortChange}
	{searchTags}
	{searchIngredients}
	{loadMore}
	initialTags={activeFilters.tags}
	initialIngredients={[
		...activeFilters.ingredients.map((label) => ({ label, include: true })),
		...activeFilters.excludedIngredients.map((label) => ({ label, include: false }))
	]}
	initialSort={sortParam}
	{onSearchbarSticky}
	initialSearchValue={searchValue}
	isLoadingMore={pagination.isLoading}
/>
