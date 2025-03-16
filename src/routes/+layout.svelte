<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import SearchPopup from '$lib/components/search/SearchPopup.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { goto, invalidateAll } from '$app/navigation'
	import type { DietType } from '$lib/types'
	import { safeFetch } from '$lib/utils/fetch'
	import type { IngredientLookupResult } from './api/ingredients/lookup/[query]/+server'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	let searchSuggestions = $state<Array<{ name: string }>>([])
	let isSearchLoading = $state(false)
	let searchResults = $state<
		Array<{ id: string; title: string; imageUrl?: string; cookTime?: number; diets?: DietType[] }>
	>([])
	let isResultsLoading = $state(false)
	let isSearchPopupOpen = $state(false)

	function openSearchPopup() {
		isSearchPopupOpen = true
	}

	function closeSearchPopup() {
		isSearchPopupOpen = false
	}

	async function handleLogout() {
		const response = await fetch('/api/logout', { method: 'POST' })
		if (response.ok) {
			await invalidateAll()
			goto('/')
		}
	}

	async function handleSearch(
		query: string,
		filters?: { diets: DietType[]; ingredients: string[] }
	) {
		if (
			!query.trim() &&
			(!filters || (filters.diets.length === 0 && filters.ingredients.length === 0))
		) {
			searchSuggestions = []
			searchResults = []
			return
		}

		isSearchLoading = true
		isResultsLoading = true

		let url = `/api/recipes/search?q=${encodeURIComponent(query)}`

		// Add filters to the URL if they exist
		if (filters) {
			if (filters.diets.length > 0) {
				url += `&diets=${filters.diets.join(',')}`
			}
			if (filters.ingredients.length > 0) {
				url += `&ingredients=${filters.ingredients.join(',')}`
			}
		}

		const response = await fetch(url)
		if (response.ok) {
			const data = await response.json()
			searchResults = data.results.map((recipe: any) => ({
				id: recipe.id,
				title: recipe.title,
				imageUrl: recipe.imageUrl,
				cookTime: recipe.cookTime,
				diets: recipe.diets,
				likes: recipe.likes
			}))

			searchSuggestions = data.results.map((recipe: any) => ({
				name: recipe.title
			}))
		}

		isSearchLoading = false
		isResultsLoading = false
	}

	function handleSelectRecipe(recipe: { name: string }) {
		const selectedRecipe = searchResults.find((r) => r.title === recipe.name)
		if (selectedRecipe) {
			isSearchPopupOpen = false
			goto(`/recipe/${selectedRecipe.id}`)
		}
	}

	function handleShowAllResults(
		query: string,
		filters?: { diets: DietType[]; ingredients: string[] }
	) {
		let url = `/?search=${encodeURIComponent(query)}`

		if (filters) {
			if (filters.diets.length > 0) {
				url += `&diets=${filters.diets.join(',')}`
			}
			if (filters.ingredients.length > 0) {
				url += `&ingredients=${filters.ingredients.join(',')}`
			}
		}

		goto(url)
	}

	const searchIngredients = async (query: string) => {
		if (!query.trim()) return []

		const result = await safeFetch<IngredientLookupResult>()(`/api/ingredients/lookup/${query}`)

		if (result.isOk()) {
			return result.value
		}

		return []
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Pacifico&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Layout>
	{#snippet header()}
		<Header
			loggedIn={!!data.user}
			newRecipeHref="/new"
			profileHref="/profile"
			loginHref="/login"
			onOpenSearch={openSearchPopup}
		/>
	{/snippet}

	{#snippet content()}
		{@render children()}
	{/snippet}
</Layout>

<SearchPopup
	isOpen={isSearchPopupOpen}
	onClose={closeSearchPopup}
	{isSearchLoading}
	{searchResults}
	{isResultsLoading}
	onSearch={handleSearch}
	onSelectRecipe={handleSelectRecipe}
	onShowAllResults={handleShowAllResults}
	onIngredientSearch={searchIngredients}
/>

<style lang="scss">
	@import '$lib/global.scss';

	@include mobile {
		:global(.recipe-page) {
			--header-display: none;
		}
	}

	:global(.header) {
		display: var(--header-display, block);
	}
</style>
