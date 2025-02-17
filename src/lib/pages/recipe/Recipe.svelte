<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'

	interface Ingredient {
		quantity: number
		measurement: string
		name: string
		nutrition?: NutritionInfo
	}

	interface RecipeData {
		title: string
		description?: string
		ingredients: Ingredient[]
		instructions: string[]
		totalNutrition?: {
			calories: number
			protein: number
			carbs: number
			fat: number
		}
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

		{#if recipe.totalNutrition}
			<section class="nutrition">
				<h2>Nutrition Facts</h2>
				<div class="nutrition-grid">
					<div class="nutrition-item">
						<span class="value">{Math.round(recipe.totalNutrition.calories)}</span>
						<span class="label">Calories</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(recipe.totalNutrition.protein)}g</span>
						<span class="label">Protein</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(recipe.totalNutrition.carbs)}g</span>
						<span class="label">Carbs</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(recipe.totalNutrition.fat)}g</span>
						<span class="label">Fat</span>
					</div>
				</div>
				<p class="nutrition-disclaimer">* Nutrition information is estimated</p>
			</section>
		{/if}

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

	.nutrition {
		background: var(--color-neutral-darker);
		padding: 24px;
		border-radius: 8px;
		margin: 32px 0;
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 24px;
		margin-top: 16px;
	}

	.nutrition-item {
		text-align: center;
	}

	.nutrition-item .value {
		display: block;
		font-size: 24px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.nutrition-item .label {
		display: block;
		font-size: 14px;
		color: var(--color-neutral);
		margin-top: 4px;
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: 12px;
		color: var(--color-neutral);
		margin-top: 16px;
	}
</style>
