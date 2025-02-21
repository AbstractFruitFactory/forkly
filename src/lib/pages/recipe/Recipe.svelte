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
		nutrition: NutritionInfo
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
		nutrition: Promise<{
			totalNutrition: {
				calories: number
				protein: number
				carbs: number
				fat: number
			}
		}>
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
			{#await nutrition}
				<div class="nutrition-loading">
					<p>Calculating nutrition facts...</p>
				</div>
			{:then nutritionData}
				<div class="nutrition-grid">
					<div class="nutrition-item">
						<span class="value">{Math.round(nutritionData.totalNutrition.calories)}</span>
						<span class="label">Calories</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(nutritionData.totalNutrition.protein)}g</span>
						<span class="label">Protein</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(nutritionData.totalNutrition.carbs)}g</span>
						<span class="label">Carbs</span>
					</div>
					<div class="nutrition-item">
						<span class="value">{Math.round(nutritionData.totalNutrition.fat)}g</span>
						<span class="label">Fat</span>
					</div>
				</div>
				<p class="nutrition-disclaimer">* Nutrition information is estimated</p>
			{/await}
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
		overflow: hidden;
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

	.nutrition-loading {
		text-align: center;
		padding: 20px;
		color: var(--color-neutral);
	}

	.custom-badge {
		font-size: 12px;
		background: var(--color-neutral);
		color: var(--color-neutral-darker);
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 8px;
		vertical-align: middle;
	}

	.recipe-image {
		margin: -32px -32px 32px;
		height: 400px;
		overflow: hidden;
		border-radius: 8px 8px 0 0;
	}

	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
