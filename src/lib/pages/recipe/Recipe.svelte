<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'

	type BaseIngredient = {
		quantity: number
		measurement: string
		name: string
	}

	type CustomIngredient = BaseIngredient & {
		custom: true
	}

	type LookupIngredient = BaseIngredient & {
		custom: false
	}

	type Ingredient = CustomIngredient | LookupIngredient

	type RecipeData = {
		title: string
		description?: string
		ingredients: Ingredient[]
		instructions: string[]
		imageUrl?: string | null
		totalNutrition?: {
			calories: number
			protein: number
			carbs: number
			fat: number
		}
	}

	let {
		recipe,
		nutrition
	}: {
		recipe: RecipeData
		nutrition: {
			totalNutrition: {
				calories: number
				protein: number
				carbs: number
				fat: number
			}
		}
	} = $props()
</script>

<div class="container">
	<article class="recipe">
		<header>
			{#if recipe.imageUrl}
				<div class="recipe-image">
					<img src={recipe.imageUrl} alt={recipe.title} />
				</div>
			{/if}
			<h1>{recipe.title}</h1>
			{#if recipe.description}
				<p class="description">{recipe.description}</p>
			{/if}
		</header>

		<section class="ingredients">
			<h2>Ingredients</h2>
			<ul>
				{#each recipe.ingredients as ingredient}
					<li>
						<span class="quantity">{ingredient.quantity}</span>
						<span class="measurement">{ingredient.measurement}</span>
						<span class="ingredient-name">
							{ingredient.name}
							{#if ingredient.custom}
								<span class="custom-badge">custom</span>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="nutrition">
			<h2>Nutrition Facts</h2>

			<div class="nutrition-grid">
				<div class="nutrition-item">
					<span class="value">{Math.round(nutrition.totalNutrition.calories)}</span>
					<span class="label">Calories</span>
				</div>
				<div class="nutrition-item">
					<span class="value">{Math.round(nutrition.totalNutrition.protein)}g</span>
					<span class="label">Protein</span>
				</div>
				<div class="nutrition-item">
					<span class="value">{Math.round(nutrition.totalNutrition.carbs)}g</span>
					<span class="label">Carbs</span>
				</div>
				<div class="nutrition-item">
					<span class="value">{Math.round(nutrition.totalNutrition.fat)}g</span>
					<span class="label">Fat</span>
				</div>
			</div>
			<p class="nutrition-disclaimer">* Nutrition information is estimated</p>
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
		padding: var(--spacing-2xl) var(--spacing-md);
	}

	.recipe {
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		padding: var(--spacing-2xl);
		overflow: hidden;
	}

	header {
		margin-bottom: var(--spacing-2xl);
	}

	.description {
		font-size: var(--font-size-lg);
		line-height: 1.6;
		margin: 0;
	}

	section {
		margin-bottom: var(--spacing-2xl);
	}

	ul,
	ol {
		margin: 0;
		padding: 0;
	}

	li {
		margin-bottom: var(--spacing-sm);
		line-height: 1.6;
	}

	ul li {
		list-style: none;
	}

	ol li {
		margin-left: var(--spacing-xl);
		padding-left: var(--spacing-sm);
	}

	.quantity {
		font-weight: var(--font-weight-semibold);
		margin-right: var(--spacing-xs);
	}

	.measurement {
		margin-right: var(--spacing-sm);
	}

	@media (max-width: 640px) {
		.recipe {
			padding: var(--spacing-xl);
		}

		h1 {
			font-size: var(--font-size-2xl);
		}

		h2 {
			font-size: var(--font-size-xl);
		}
	}

	.nutrition {
		background: var(--color-neutral-darker);
		padding: var(--spacing-xl);
		border-radius: var(--border-radius-lg);
		margin: var(--spacing-2xl) 0;
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: var(--spacing-xl);
		margin-top: var(--spacing-md);
	}

	.nutrition-item {
		text-align: center;
	}

	.nutrition-item .value {
		display: block;
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
	}

	.nutrition-item .label {
		display: block;
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		margin-top: var(--spacing-xs);
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		margin-top: var(--spacing-md);
	}

	.nutrition-loading {
		text-align: center;
		padding: var(--spacing-lg);
		color: var(--color-neutral);
	}

	.custom-badge {
		font-size: var(--font-size-xs);
		background: var(--color-neutral);
		color: var(--color-neutral-darker);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		margin-left: var(--spacing-sm);
		vertical-align: middle;
	}

	.recipe-image {
		margin: calc(var(--spacing-2xl) * -1) calc(var(--spacing-2xl) * -1) var(--spacing-2xl);
		height: 400px;
		overflow: hidden;
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
	}

	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
