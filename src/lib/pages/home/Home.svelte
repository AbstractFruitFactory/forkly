<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import type { DietType } from '$lib/types'
	import Button from '$lib/components/button/Button.svelte'

	type Recipe = {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
		imageUrl?: string | null
		user?: {
			username: string
			avatarUrl?: string | null
		}
		likes: number
		bookmarks: number
		createdAt: string
	}

	let {
		recipes,
		searchQuery,
		filters = { diets: [], ingredients: [] },
		sortBy = 'popular',
		onSortChange = (newSortBy: 'popular' | 'newest' | 'easiest') => {}
	}: {
		recipes: Recipe[]
		searchQuery?: string
		filters?: {
			diets: DietType[]
			ingredients: string[]
		}
		sortBy?: 'popular' | 'newest' | 'easiest'
		onSortChange?: (newSortBy: 'popular' | 'newest' | 'easiest') => void
	} = $props()
</script>

{#snippet searchResultsHeader()}
	<div class="header-content">
		<div class="sort-controls">
			<Button
				variant={sortBy === 'popular' ? 'primary' : 'text'}
				size="sm"
				onclick={() => onSortChange('popular')}
			>
				Popular
			</Button>
			<Button
				variant={sortBy === 'newest' ? 'primary' : 'text'}
				size="sm"
				onclick={() => onSortChange('newest')}
			>
				Newest
			</Button>
			<Button
				variant={sortBy === 'easiest' ? 'primary' : 'text'}
				size="sm"
				onclick={() => onSortChange('easiest')}
			>
				Easiest
			</Button>
		</div>
	</div>
{/snippet}

<div class="home-container">
	{#if searchQuery || filters.diets.length > 0 || filters.ingredients.length > 0}
		<div class="search-results-header">
			{@render searchResultsHeader()}

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

			<p class="results-count">
				{recipes.length}
				{recipes.length === 1 ? 'recipe' : 'recipes'} found
			</p>
		</div>
	{:else}
		{@render searchResultsHeader()}
	{/if}

	{#if recipes.length === 0}
		<div class="empty-state">
			{#if searchQuery || filters.diets.length > 0 || filters.ingredients.length > 0}
				<p>
					No recipes found matching your criteria. Try different search terms or filters, or <a
						href="/">browse all recipes</a
					>.
				</p>
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
</div>

<style lang="scss">
	@import '$lib/global.scss';
	.home-container {
		@include mobile {
			padding: var(--spacing-lg);
			padding-bottom: 0;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-2xl) 0;
	}

	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-lg);

		&:last-child {
			padding-bottom: var(--spacing-lg);
		}

		@include mobile {
			overflow-y: auto;
		}
	}

	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.search-results-header h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-neutral-light);
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
		padding: var(--spacing-md);
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		border: 1px solid rgba(255, 255, 255, 0.1);
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

	.sort-controls {
		display: flex;
		gap: var(--spacing-xs);
	}

	@media (max-width: 640px) {
		.recipe-grid {
			grid-template-columns: 1fr;
		}

		.active-filters {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.sort-controls {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
