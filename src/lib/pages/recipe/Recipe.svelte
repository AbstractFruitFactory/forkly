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
		<div class="recipe-header-section">
			{#if recipe.imageUrl}
				<div class="recipe-image">
					<img src={recipe.imageUrl} alt={recipe.title} />
					<div class="recipe-actions-overlay">
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
			{/if}
			
			<div class="recipe-intro">
				<h1>{recipe.title}</h1>
				
				{#if recipe.description}
					<p class="description">{recipe.description}</p>
				{/if}

				<div class="recipe-tags">
					{#if recipe.diets && recipe.diets.length > 0}
						<div class="tags">
							{#each recipe.diets as diet}
								<Pill text={diet} color={dietColors[diet]} />
							{/each}
						</div>
					{/if}
				</div>
				
				<div class="nutrition-facts">
					<h2>Nutrition Facts</h2>
					<div class="nutrition-grid">
						<div class="nutrition-item">
							<div class="nutrition-circle">
								<span class="value">{Math.round(nutrition.totalNutrition.calories)}</span>
							</div>
							<span class="label">CALORIES</span>
						</div>
						<div class="nutrition-item">
							<div class="nutrition-circle">
								<span class="value">{Math.round(nutrition.totalNutrition.protein)}g</span>
							</div>
							<span class="label">PROTEIN</span>
						</div>
						<div class="nutrition-item">
							<div class="nutrition-circle">
								<span class="value">{Math.round(nutrition.totalNutrition.carbs)}g</span>
							</div>
							<span class="label">CARBS</span>
						</div>
						<div class="nutrition-item">
							<div class="nutrition-circle">
								<span class="value">{Math.round(nutrition.totalNutrition.fat)}g</span>
							</div>
							<span class="label">FAT</span>
						</div>
					</div>
					<p class="nutrition-disclaimer">* Nutrition information is estimated</p>
				</div>
			</div>
		</div>

		<div class="recipe-content">
			<div class="recipe-sidebar">
				<div class="section-header">
					<h2>Ingredients</h2>
					<div class="unit-toggle-container">
						<UnitToggle state={unitSystem} onSelect={onUnitChange} />
					</div>
				</div>
				<ul class="ingredients-list">
					{#each recipe.ingredients as ingredient}
						{@const formattedIngredient = getFormattedIngredient(ingredient)}
						<li>
							<span class="measurement">
								{#if ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch'}
									{ingredient.measurement}
								{:else}
									{formattedIngredient.formattedMeasurement}
								{/if}
							</span>
							<span class="ingredient-name">
								{ingredient.name}
								{#if ingredient.custom}
									<span class="custom-badge">custom</span>
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="recipe-main">
				<div class="section-header">
					<h2>Instructions</h2>
				</div>
				<ol class="instructions-list">
					{#each recipe.instructions as instruction, i}
						<li>
							<div class="instruction-number">{i + 1}</div>
							<div class="instruction-text">{instruction}</div>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</article>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-md);
	}

	.recipe {
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
		padding: var(--spacing-xl);
		overflow: hidden;
	}

	.recipe-header-section {
		display: grid;
		grid-template-columns: minmax(250px, 40%) 1fr;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
	}

	.recipe-image {
		position: relative;
		height: 100%;
		min-height: 300px;
		overflow: hidden;
		border-radius: var(--border-radius-md);
	}

	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.recipe-actions-overlay {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		display: flex;
		gap: var(--spacing-sm);
		z-index: 2;
	}

	.recipe-intro {
		display: flex;
		flex-direction: column;
	}

	h1 {
		margin: 0 0 var(--spacing-sm) 0;
		font-size: var(--font-size-2xl);
		color: var(--color-neutral-lightest);
		line-height: 1.2;
	}

	h2 {
		font-size: var(--font-size-lg);
		color: var(--color-primary);
		margin: 0 0 var(--spacing-md) 0;
		position: relative;
		display: inline-block;
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: var(--color-primary);
	}

	.description {
		font-size: var(--font-size-md);
		line-height: 1.6;
		margin: 0 0 var(--spacing-md) 0;
		color: var(--color-neutral-light);
	}

	.recipe-tags {
		margin-bottom: var(--spacing-md);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.nutrition-facts {
		margin-top: var(--spacing-md);
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-sm);
	}

	.nutrition-item {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nutrition-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: var(--color-neutral-dark);
		margin-bottom: var(--spacing-xs);
		border: 2px solid var(--color-primary);
	}

	.nutrition-item .value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
	}

	.nutrition-item .label {
		display: block;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
		margin-top: var(--spacing-xs);
		letter-spacing: 0.5px;
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		margin-top: var(--spacing-md);
		font-style: italic;
	}

	.recipe-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: var(--spacing-xl);
		margin-top: var(--spacing-xl);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
		border-bottom: 2px solid var(--color-primary);
		padding-bottom: var(--spacing-xs);
	}

	.section-header h2 {
		margin: 0;
	}

	.section-header h2::after {
		display: none;
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);
	}

	.ingredients-list,
	.instructions-list {
		margin: 0;
		padding: 0;
	}

	.ingredients-list li {
		list-style: none;
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
	}

	.ingredients-list li:last-child {
		border-bottom: none;
	}

	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		min-width: 60px;
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}

	.instructions-list {
		counter-reset: instruction;
		padding-left: 0;
	}

	.instructions-list li {
		display: flex;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
	}

	.instructions-list li:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.instruction-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		background-color: var(--color-primary);
		color: var(--color-neutral-darkest);
		border-radius: 50%;
		font-weight: var(--font-weight-bold);
		margin-right: var(--spacing-md);
		flex-shrink: 0;
	}

	.instruction-text {
		flex: 1;
		line-height: 1.5;
	}

	.custom-badge {
		font-size: var(--font-size-xs);
		background: var(--color-primary-light);
		color: var(--color-neutral-darkest);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		margin-left: var(--spacing-sm);
		vertical-align: middle;
		font-weight: var(--font-weight-semibold);
	}

	@media (max-width: 900px) {
		.recipe-header-section {
			grid-template-columns: 1fr;
		}
		
		.recipe-image {
			min-height: 250px;
			margin-bottom: var(--spacing-md);
		}
		
		.recipe-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
		
		.nutrition-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 640px) {
		.recipe {
			padding: var(--spacing-lg);
			border-radius: var(--border-radius-md);
		}

		h1 {
			font-size: var(--font-size-xl);
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.unit-toggle-container {
			margin-left: 0;
			margin-top: var(--spacing-sm);
		}

		.nutrition-circle {
			width: 60px;
			height: 60px;
		}

		.nutrition-item .value {
			font-size: var(--font-size-md);
		}

		.instructions-list li {
			flex-direction: column;
		}

		.instruction-number {
			margin-bottom: var(--spacing-sm);
		}
	}
</style>
