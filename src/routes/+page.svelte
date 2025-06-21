<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server'
	import type { TagSearchResponse } from './api/tags/+server'
	import { scrolledDownHomepageStore } from './+layout.svelte'
	import { onMount, untrack } from 'svelte'
	import { useCookies } from '$lib/utils/cookies'

	let { data } = $props()

	let recipes = $state(data.recipes)

	$effect(() => {
		recipes = data.loadedPage ? [...untrack(() => recipes), ...data.recipes] : data.recipes
	})

	let searchValue = $derived(data.initialState.search)
	let isLoading = $state(false)
	let activeFilters = $derived({
		tags: data.initialState.tags,
		ingredients: data.initialState.ingredients,
		excludedIngredients: data.initialState.excludedIngredients
	})
	let sortParam = $derived(data.initialState.sort)

	// Pagination state
	let pagination = $state({
		page: 0,
		isLoading: false
	})

	onMount(() => {
		// Listen for search events from the layout
		window.addEventListener('search', ((e: CustomEvent) => {
			handleSearchChange(e.detail.query)
		}) as EventListener)

		return () => {
			window.removeEventListener('search', ((e: CustomEvent) => {
				handleSearchChange(e.detail.query)
			}) as EventListener)
		}
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
		// Reset pagination when performing a new search
		pagination = {
			page: 0,
			isLoading: false
		}

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
		if (pagination.isLoading || !data.hasMore) return

		pagination.isLoading = true

		useCookies('pagination').set({
			page: pagination.page + 1
		})

		pagination = {
			page: pagination.page + 1,
			isLoading: false
		}

		invalidateAll()
	}

	const onSearchbarSticky = (isSticky: boolean) => {
		isSticky ? scrolledDownHomepageStore.setTrue() : scrolledDownHomepageStore.setFalse()
	}
	$inspect(recipes.length)
</script>

<Home
	{recipes}
	{isLoading}
	onSearchChange={handleSearchChange}
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
/>
