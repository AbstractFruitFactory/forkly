<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'

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
		dislikes?: number
		tags?: string[]
	}

	let {
		recipes = [],
		emptyMessage = 'No recipes found.',
		isLoading = false
	}: {
		recipes: Recipe[]
		emptyMessage?: string
		isLoading?: boolean
	} = $props()
</script>

{#if recipes.length === 0}
	<div class="empty-state">
		<p>{emptyMessage}</p>
	</div>
{:else}
	<div class="recipe-grid">
		{#each recipes as recipe}
			<RecipeCard {recipe} />
		{/each}

		{#if isLoading}
			{#each Array(18) as _}
				<RecipeCard loading />
			{/each}
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

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

	@media (max-width: 640px) {
		.recipe-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
