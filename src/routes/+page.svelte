<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let { data } = $props()

	let sortBy = $state<'popular' | 'newest' | 'easiest'>(
		(page.url.searchParams.get('sort') as 'popular' | 'newest' | 'easiest') || 'popular'
	)

	const calculatePopularityScore = (recipe: any): number => {
		const dislikes = recipe.dislikes || 0
		const engagementScore = recipe.bookmarks * 2 + recipe.likes - dislikes * 1.5

		const ageInDays = (Date.now() - new Date(recipe.createdAt).getTime()) / (1000 * 60 * 60 * 24)
		const recencyBoost = Math.max(0, 10 - Math.min(10, ageInDays / 30))

		return engagementScore + recencyBoost
	}

	$effect(() => {
		const url = new URL(window.location.href)
		url.searchParams.set('sort', sortBy)
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true })
	})

	const handleSortChange = (newSortBy: 'popular' | 'newest' | 'easiest') => {
		sortBy = newSortBy
	}

	const recipes = $derived(
		data.recipes
			.map((recipe) => ({
				...recipe,
				ingredients: recipe.ingredients.length,
				instructions: recipe.instructions.length,
				imageUrl: recipe.imageUrl,
				createdAt: recipe.createdAt.toISOString(),
				user: recipe.user?.username
					? {
							username: recipe.user.username,
							avatarUrl: recipe.user.avatarUrl
						}
					: undefined
			}))
			.sort((a, b) => {
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
</script>

<svelte:head>
	{#if data.searchQuery}
		<title>Search results for "{data.searchQuery}" - Forkly</title>
	{:else}
		<title>Forkly - Discover and Share Recipes</title>
	{/if}
</svelte:head>

<Home
	{recipes}
	searchQuery={data.searchQuery}
	filters={data.filters}
	{sortBy}
	onSortChange={handleSortChange}
/>
