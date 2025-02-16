<script lang="ts">
	interface Ingredient {
		quantity: number
		measurement: string
		name: string
	}

	interface RecipeData {
		title: string
		description?: string
		ingredients: Ingredient[]
		instructions: string[]
	}

	let { recipe }: { recipe: RecipeData } = $props()
</script>

<div class="container">
	<article class="recipe">
		<header>
			<h1>{recipe.title}</h1>
			{#if recipe.description}
				<p class="description">{recipe.description}</p>
			{/if}
		</header>

		<section class="ingredients">
			<h2>Ingredients</h2>
			<ul>
				{#each recipe.ingredients as { quantity, measurement, name }}
					<li>
						<span class="quantity">{quantity}</span>
						<span class="measurement">{measurement}</span>
						<span class="ingredient-name">{name}</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="instructions">
			<h2>Instructions</h2>
			<ol>
				{#each recipe.instructions as instruction}
					<li>{instruction}</li>
				{/each}
			</ol>
		</section>
	</article>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 16px;
	}

	.recipe {
		background-color: var(--color-neutral-dark);
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 32px;
	}

	header {
		margin-bottom: 32px;
	}

	h1 {
		font-size: 36px;
		margin: 0 0 16px;
	}

	.description {
		font-size: 18px;
		line-height: 1.6;
		margin: 0;
	}

	section {
		margin-bottom: 32px;
	}

	h2 {
		font-size: 24px;
		margin: 0 0 16px;
	}

	ul,
	ol {
		margin: 0;
		padding: 0;
	}

	li {
		margin-bottom: 8px;
		line-height: 1.6;
	}

	ul li {
		list-style: none;
	}

	ol li {
		margin-left: 24px;
		padding-left: 8px;
	}

	.quantity {
		font-weight: 600;
		margin-right: 4px;
	}

	.measurement {
		margin-right: 8px;
	}

	@media (max-width: 640px) {
		.recipe {
			padding: 24px;
		}

		h1 {
			font-size: 28px;
		}

		h2 {
			font-size: 20px;
		}
	}
</style>
