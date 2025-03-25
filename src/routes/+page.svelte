<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesSearchResponse } from './api/recipes/search/+server.js'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server.js'
	import type { TagSearchResponse } from './api/tags/+server.js'
	import { nullToUndefined } from '$lib/utils/nullToUndefined.js'
	import { toHomePageRecipe } from '$lib/utils/recipe'
	import { onMount } from 'svelte'

	let { data } = $props()

	let recipes = $state(data.recipes)
	let searchValue = $state('')
	let isLoading = $state(false)
	let searchResults = $state<ReturnType<typeof toHomePageRecipe>[] | null>(null)
	let activeFilters = $state({
		tags: [] as string[],
		ingredients: [] as string[]
	})
	let sortParam = $state<'popular' | 'newest' | 'easiest'>('popular')

	// Pagination state
	let pagination = $state({
		offset: 0,
		limit: 18,
		hasMore: true,
		isLoading: false
	})

	let observer: IntersectionObserver
	let loadMoreTrigger: HTMLElement

	const handleSearch = async (
		query: string,
		filters?: { tags: string[]; ingredients: string[] }
	) => {
		if (
			!query.trim() &&
			(!filters || (filters.tags.length === 0 && filters.ingredients.length === 0))
		) {
			searchResults = null
			pagination = {
				offset: 0,
				limit: 18,
				hasMore: true,
				isLoading: false
			}
			return
		}

		isLoading = true
		pagination = {
			offset: 0,
			limit: 18,
			hasMore: true,
			isLoading: false
		}

		let url = `/api/recipes/search?q=${encodeURIComponent(query)}`
		url += `&limit=${pagination.limit}&offset=0`

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
			pagination.hasMore = data.results.length === pagination.limit
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
		if (filters.tags.length === 0 && filters.ingredients.length === 0 && !searchValue.trim()) {
			searchResults = null
			pagination = {
				offset: 0,
				limit: 18,
				hasMore: true,
				isLoading: false
			}
		} else {
			handleSearch(searchValue, filters)
		}
	}

	const handleSearchChange = (query: string) => {
		searchValue = query
		if (
			!query.trim() &&
			activeFilters.tags.length === 0 &&
			activeFilters.ingredients.length === 0
		) {
			searchResults = null
			pagination = {
				offset: 0,
				limit: 18,
				hasMore: true,
				isLoading: false
			}
		} else {
			handleSearch(query, activeFilters)
		}
	}

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
	}

	const displayedRecipes = $derived(
		searchResults &&
			(searchValue.trim() || activeFilters.tags.length > 0 || activeFilters.ingredients.length > 0)
			? searchResults
			: recipes
	)

	async function loadMore() {
		if (pagination.isLoading || !pagination.hasMore) return

		pagination.isLoading = true

		const url = new URL('/api/recipes/search', window.location.origin)
		url.searchParams.set('limit', pagination.limit.toString())
		url.searchParams.set('offset', (pagination.offset + pagination.limit).toString())
		url.searchParams.set('q', searchValue)

		if (activeFilters.tags.length > 0) {
			url.searchParams.set('tags', activeFilters.tags.join(','))
		}
		if (activeFilters.ingredients.length > 0) {
			url.searchParams.set('ingredients', activeFilters.ingredients.join(','))
		}

		try {
			const response = await fetch(url.toString())
			const newData = await response.json()

			const newRecipes = newData.results.map(toHomePageRecipe)

			if (searchResults) {
				searchResults = [...searchResults, ...newRecipes]
			} else {
				recipes = [...recipes, ...newRecipes]
			}

			pagination = {
				...pagination,
				hasMore: newRecipes.length === pagination.limit,
				offset: pagination.offset + pagination.limit,
				isLoading: false
			}
		} catch (error) {
			console.error('Failed to load more recipes:', error)
			pagination.isLoading = false
		}
	}

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !pagination.isLoading && pagination.hasMore) {
					loadMore()
				}
			},
			{ threshold: 0.5, rootMargin: '100px' }
		)

		if (loadMoreTrigger) {
			observer.observe(loadMoreTrigger)
		}

		return () => {
			if (loadMoreTrigger) {
				observer.unobserve(loadMoreTrigger)
			}
		}
	})
</script>

<svelte:head>
	<title>Forkly - Discover and Share Recipes</title>
</svelte:head>

<Home
	recipes={displayedRecipes}
	isLoading={pagination.isLoading}
	onSearchChange={handleSearchChange}
	onFiltersChange={handleFiltersChange}
	onSortChange={handleSortChange}
	{searchTags}
	{searchIngredients}
/>

{#if pagination.hasMore}
	<div bind:this={loadMoreTrigger} class="load-more-trigger"></div>
{/if}
