<script lang="ts">
	import type { Recipe } from '$lib/server/db/schema'
	import Button from '$lib/components/button/Button.svelte'

	let { recipe, recipeHref }: { recipe: Recipe; recipeHref: string } = $props()
</script>

<div class="recipe-card">
	<h3>{recipe.title}</h3>
	<div class="recipe-meta">
		<span>❤️ {recipe.likes || 0}</span>
		<span>📅 {new Date(recipe.createdAt).toLocaleDateString()}</span>
	</div>
	<Button href={`${recipeHref}/${recipe.id}`} variant="text" size="sm">View Recipe →</Button>
</div>

<style lang="scss">
	.recipe-card {
		background: var(--color-background);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-xl);
		transition: all var(--transition-fast) var(--ease-in-out);
		border: var(--border-width-thin) solid var(--color-neutral);
		box-shadow: var(--shadow-sm);

		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}

		h3 {
			margin: 0 0 1rem;
			color: white;
		}

		.recipe-meta {
			display: flex;
			gap: var(--spacing-md);
			font-size: var(--font-size-sm);
			color: var(--color-neutral-light);
			margin-bottom: var(--spacing-md);
		}
	}
</style>
