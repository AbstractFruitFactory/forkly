<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import type { DietType } from '$lib/types'

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

	let { 
		recipes, 
		searchQuery = '',
		filters = { diets: [], ingredients: [] }
	}: { 
		recipes: Recipe[], 
		searchQuery?: string,
		filters?: {
			diets: DietType[],
			ingredients: string[]
		}
	} = $props()
</script>

{#if searchQuery || filters.diets.length > 0 || filters.ingredients.length > 0}
	<div class="search-results-header">
		<h1>Search results {searchQuery ? `for "${searchQuery}"` : ''}</h1>
		
		{#if filters.diets.length > 0 || filters.ingredients.length > 0}
			<div class="active-filters">
				{#if filters.diets.length > 0}
					<div class="filter-group">
						<span class="filter-label">Diets:</span>
						{#each filters.diets as diet}
							<span class="filter-tag">{diet}</span>
						{/each}
					</div>
				{/if}
				
				{#if filters.ingredients.length > 0}
					<div class="filter-group">
						<span class="filter-label">Ingredients:</span>
						{#each filters.ingredients as ingredient}
							<span class="filter-tag">{ingredient}</span>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		
		<p class="results-count">{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found</p>
	</div>
{:else}
	<h1 style:text-align="center">Explore recipes</h1>
{/if}

{#if recipes.length === 0}
	<div class="empty-state">
		{#if searchQuery || filters.diets.length > 0 || filters.ingredients.length > 0}
			<p>No recipes found matching your criteria. Try different search terms or filters, or <a href="/">browse all recipes</a>.</p>
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

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin: var(--spacing-md) 0;
	}

	.filter-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.filter-label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		font-weight: 500;
	}

	.filter-tag {
		background: var(--color-primary);
		color: white;
		font-size: var(--font-size-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.recipe-grid {
			grid-template-columns: 1fr;
		}
		
		.active-filters {
			flex-direction: column;
			gap: var(--spacing-sm);
		}
	}
</style>
