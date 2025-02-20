<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'

	type Recipe = {
		id: string
		title: string
		description: string
		ingredients: number
		instructions: number
	}

	let { recipes }: { recipes: Recipe[] } = $props()
</script>

<h1>Latest Recipes</h1>

{#if recipes.length === 0}
	<div class="empty-state">
		<p>No recipes yet! Be the first to <a href="/new">create one</a>.</p>
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
		padding: 48px 0;
	}

	.recipe-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 24px;
	}

	@media (max-width: 640px) {
		.recipe-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
