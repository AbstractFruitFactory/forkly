<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import Layout from '$lib/components/layout/Layout.svelte'
	import SearchPopup from '$lib/components/search/SearchPopup.svelte'
	import '$lib/global.scss'
	import type { Snippet } from 'svelte'
	import type { LayoutData } from './$types'
	import { goto, invalidateAll } from '$app/navigation'
	import type { DietType } from '$lib/types'

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

	async function handleSearch(query: string) {
		if (!query.trim()) {
			searchSuggestions = []
			searchResults = []
			return
		}

		isSearchLoading = true
		isResultsLoading = true

		const response = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`)
		if (response.ok) {
			const data = await response.json()
			searchResults = data.results.map((recipe: any) => ({
				id: recipe.id,
				title: recipe.title,
				imageUrl: recipe.imageUrl,
				cookTime: recipe.cookTime,
				diets: recipe.diets
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

	function handleShowAllResults(query: string) {
		goto(`/?search=${encodeURIComponent(query)}`)
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
			aboutHref="/about"
			profileHref="/profile"
			loginHref="/login"
			onLogout={handleLogout}
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
	onSearch={handleSearch}
	onSelectRecipe={handleSelectRecipe}
	onShowAllResults={handleShowAllResults}
	{isSearchLoading}
	{searchResults}
	{isResultsLoading}
/>
