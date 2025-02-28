<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'

	type Recipe = {
		id: string
		title: string
		description: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
		user?: {
			username: string
			avatarUrl?: string | null
		}
		likes: number
	}

	let { recipes, searchQuery = '' }: { recipes: Recipe[], searchQuery?: string } = $props()
</script>

{#if searchQuery}
	<div class="search-results-header">
		<h1>Search results for "{searchQuery}"</h1>
		<p class="results-count">{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found</p>
	</div>
{:else}
	<h1 style:text-align="center">Explore recipes</h1>
{/if}

{#if recipes.length === 0}
	<div class="empty-state">
		{#if searchQuery}
			<p>No recipes found matching "{searchQuery}". Try a different search term or <a href="/">browse all recipes</a>.</p>
		{:else}
			<p>No recipes yet! Be the first to <a href="/new">create one</a>.</p>
		{/if}
	</div>
{:else}
	<div class="recipe-grid">
		{#each recipes as recipe}
			<RecipeCard {recipe} />
		{/each}
	</div>
{/if}

<style>
	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-lg);
	}
	
	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}
	
	.search-results-header h1 {
		margin-bottom: var(--spacing-xs);
	}
	
	.results-count {
		color: var(--color-neutral);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	@media (max-width: 640px) {
		.recipe-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
