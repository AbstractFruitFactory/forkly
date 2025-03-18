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

	let { data } = $props()

	let sortParam = $state<'popular' | 'newest' | 'easiest'>('popular')

	const handleSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {
		sortParam = sortBy
	}

	const sortedRecipes = $derived(
		[...data.recipes].sort((a, b) => {
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
</script>

<svelte:head>
	{#if data.searchQuery}
		<title>Search results for "{data.searchQuery}" - Forkly</title>
	{:else}
		<title>Forkly - Discover and Share Recipes</title>
	{/if}
</svelte:head>

<Home
	recipes={sortedRecipes}
	searchQuery={data.searchQuery}
	filters={data.filters}
	sortBy={sortParam}
	onSortChange={handleSortChange}
/>
