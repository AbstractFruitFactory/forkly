<script lang="ts">
	interface Recipe {
		id: string
		title: string
		description?: string
		ingredients: number
		instructions: number
	}

	let { recipe }: { recipe: Recipe } = $props()
</script>

<a href="/recipe/{recipe.id}" class="recipe-card">
	<h2>{recipe.title}</h2>
	{#if recipe.description}
		<p class="description">{recipe.description}</p>
	{/if}
	<div class="meta">
		<span>{recipe.ingredients} ingredients</span>
		<span>{recipe.instructions} steps</span>
	</div>
</a>

<style>
	.recipe-card {
		display: block;
		padding: 24px;
		border-radius: 8px;
		background: var(--color-neutral-dark);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.recipe-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.recipe-card h2 {
		margin: 0 0 12px;
		font-size: 24px;
	}

	.description {
		margin: 0 0 16px;
		overflow: hidden;
	}

	.meta {
		display: flex;
		gap: 16px;
		font-size: 14px;
	}
</style>
