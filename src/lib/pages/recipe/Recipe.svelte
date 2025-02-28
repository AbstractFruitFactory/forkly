<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import {
		convertMeasurement,
		formatMeasurement,
		UNIT_DISPLAY_TEXT,
		UNITS
	} from '$lib/utils/unitConversion'
	import type { RecipeData, Ingredient } from '$lib/types'
	import { dietColors } from '$lib/types'
	import { page } from '$app/state'
	import Pill from '$lib/components/pill/Pill.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'

	let {
		recipe,
		nutrition,
		onLike,
		unitSystem,
		onUnitChange,
		isLoggedIn
	}: {
		recipe: RecipeData
		nutrition: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
	} = $props()

	const getFormattedIngredient = (ingredient: Ingredient) => {
		if (
			UNITS.other.includes(ingredient.measurement as string) ||
			ingredient.measurement === 'teaspoons' ||
			ingredient.measurement === 'tablespoons'
		) {
			const displayUnit = UNIT_DISPLAY_TEXT[ingredient.measurement] || ingredient.measurement
			return {
				...ingredient,
				displayQuantity: ingredient.quantity,
				displayUnit: ingredient.measurement,
				displayUnitText: displayUnit,
				formattedMeasurement: formatMeasurement(ingredient.quantity, ingredient.measurement)
			}
		}

		const { quantity, unit } = convertMeasurement(
			ingredient.quantity,
			ingredient.measurement,
			unitSystem
		)

		const displayUnit = UNIT_DISPLAY_TEXT[unit] || unit

		return {
			...ingredient,
			displayQuantity: quantity,
			displayUnit: unit,
			displayUnitText: displayUnit,
			formattedMeasurement: formatMeasurement(quantity, unit)
		}
	}
</script>

<div class="container">
	<article class="recipe">
		<header>
			{#if recipe.imageUrl}
				<div class="recipe-image">
					<img src={recipe.imageUrl} alt={recipe.title} />
				</div>
			{/if}
			<div class="recipe-header">
				<h1>{recipe.title}</h1>
				<div class="recipe-actions">
					<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />

					{#snippet likeButton()}
						<LikeButton
							count={recipe.likes}
							isLiked={recipe.isLiked}
							interactive={!!onLike}
							onLike={isLoggedIn ? onLike : undefined}
						/>
					{/snippet}

					{#if isLoggedIn}
						{@render likeButton()}
					{:else}
						<Popover type="warning">
							{#snippet trigger()}
								{@render likeButton()}
							{/snippet}

							{#snippet content()}
								Login to like recipes!
							{/snippet}
						</Popover>
					{/if}
				</div>
			</div>
			{#if recipe.description}
				<p class="description">{recipe.description}</p>
			{/if}

			<div class="recipe-tags">
				{#if recipe.diets && recipe.diets.length > 0}
					<div class="tag-group">
						<div class="tags">
							{#each recipe.diets as diet}
								<Pill text={diet} color={dietColors[diet]} />
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</header>

		<section class="ingredients">
			<div class="ingredients-header">
				<h2>Ingredients</h2>
				<div class="unit-toggle-container">
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				</div>
			</div>
			<ul>
				{#each recipe.ingredients as ingredient}
					{@const formattedIngredient = getFormattedIngredient(ingredient)}
					<li>
						{#if ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch'}
							<span class="measurement">{ingredient.measurement}</span>
						{:else}
							<span class="measurement">{formattedIngredient.formattedMeasurement}</span>
						{/if}
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

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);
	}

	h1 {
		font-size: var(--font-size-3xl);
		margin-bottom: var(--spacing-md);
		font-weight: 600;
	}

	h2 {
		font-size: var(--font-size-xl);
		margin-bottom: var(--spacing-md);
		font-weight: 600;
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

		.ingredients-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.unit-toggle-container {
			margin-left: 0;
			margin-top: var(--spacing-sm);
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
		margin: calc(var(--spacing-2xl) * -1) calc(var(--spacing-2xl) * -1) var(--spacing-xl);
		height: 400px;
		overflow: hidden;
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
	}

	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.recipe-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.recipe-header h1 {
		margin: 0;
		flex: 1;
	}

	.recipe-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.recipe-tags {
		margin-top: var(--spacing-lg);
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
	}

	.tag-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.tag-group h3 {
		font-size: var(--font-size-md);
		margin: 0;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}
</style>
