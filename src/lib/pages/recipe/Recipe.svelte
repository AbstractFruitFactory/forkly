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
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import BookmarkButton from '$lib/components/bookmark-button/BookmarkButton.svelte'

	let {
		recipe,
		nutrition,
		onLike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark
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
		onBookmark?: () => void
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
				</div>
			{/if}

			<div class="recipe-intro">
				<div class="recipe-title-row">
					<h2>{recipe.title}</h2>
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

						{#snippet bookmarkButton()}
							<BookmarkButton
								count={recipe.bookmarks}
								isBookmarked={recipe.isBookmarked}
								interactive={!!onBookmark}
								onBookmark={isLoggedIn ? onBookmark : undefined}
							/>
						{/snippet}

						{#if isLoggedIn}
							{@render likeButton()}
							{@render bookmarkButton()}
						{:else}
							<Popover type="warning">
								{#snippet trigger()}
									{@render likeButton()}
								{/snippet}

								{#snippet content()}
									Login to like recipes!
								{/snippet}
							</Popover>
							<Popover type="warning">
								{#snippet trigger()}
									{@render bookmarkButton()}
								{/snippet}

								{#snippet content()}
									Login to bookmark recipes!
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
						<div class="tags">
							{#each recipe.diets as diet}
								<Pill text={diet} color={dietColors[diet]} />
							{/each}
						</div>
					{/if}
				</div>

				<div class="nutrition-facts">
					<h3>Nutrition Facts</h3>
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
					<h3>Ingredients</h3>
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
					<h3>Instructions</h3>
				</div>
				<ol class="instructions-list">
					{#each recipe.instructions as instruction, i}
						<li>
							<div class="instruction-number">{i + 1}</div>
							<div class="instruction-content">
								{#if instruction.mediaUrl}
									<div class="instruction-media">
										{#if instruction.mediaType === 'image'}
											<img
												src={instruction.mediaUrl}
												alt={`Step ${i + 1} visual`}
												loading="lazy"
												decoding="async"
											/>
										{:else if instruction.mediaType === 'video'}
											<video src={instruction.mediaUrl} controls muted></video>
										{/if}
									</div>
								{/if}
								<div class="instruction-text">
									{#each parseTemperature(instruction.text) as part}
										{#if part.isTemperature && part.value !== undefined && part.unit}
											<span class="temperature-wrapper">
												<Popover triggerOn="hover" placement="top">
													{#snippet trigger()}
														<span class="temperature">{part.text}</span>
													{/snippet}

													{#snippet content()}
														<span class="conversion"
															>{getConversionText(
																part.value as number,
																part.unit as TemperatureUnit
															)}</span
														>
													{/snippet}
												</Popover>
											</span>
										{:else}
											<span>{part.text}</span>
										{/if}
									{/each}
								</div>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</article>
</div>

<style lang="scss">
	// Layout and Container Styles
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

		@media (max-width: 640px) {
			padding: var(--spacing-lg);
			border-radius: var(--border-radius-md);
		}
	}

	// Header Section
	.recipe-header-section {
		display: grid;
		grid-template-columns: minmax(250px, 40%) 1fr;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	.recipe-image {
		position: relative;
		height: 100%;
		min-height: 300px;
		overflow: hidden;
		border-radius: var(--border-radius-md);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		@media (max-width: 900px) {
			min-height: 250px;
			margin-bottom: var(--spacing-md);
		}
	}

	.recipe-intro {
		display: flex;
		flex-direction: column;

		h2 {
			margin-bottom: 0;
			color: var(--color-neutral-lightest);
			flex: 1;

			@media (max-width: 640px) {
				font-size: var(--font-size-xl);
			}
		}

		h3 {
			margin-bottom: 0;
			color: var(--color-primary);
			position: relative;
			width: fit-content;

			&::after {
				content: '';
				position: absolute;
				bottom: -5px;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: var(--color-primary);
			}
		}

		.description {
			font-size: var(--font-size-md);
			line-height: 1.6;
			margin: 0 0 var(--spacing-md) 0;
			color: var(--color-neutral-light);
		}
	}

	.recipe-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-sm);

		@media (max-width: 640px) {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.recipe-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-shrink: 0;

		@media (max-width: 640px) {
			margin-top: var(--spacing-sm);
		}
	}

	// Tags Section
	.recipe-tags {
		margin-bottom: var(--spacing-md);

		.tags {
			display: flex;
			flex-wrap: wrap;
			gap: var(--spacing-xs);
		}
	}

	// Nutrition Section
	.nutrition-facts {
		margin-top: var(--spacing-md);
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);

		@media (max-width: 640px) {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}
	}

	.nutrition-item {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;

		.value {
			font-size: var(--font-size-lg);
			font-weight: var(--font-weight-bold);
			color: var(--color-primary);

			@media (max-width: 640px) {
				font-size: var(--font-size-md);
			}
		}

		.label {
			display: block;
			font-size: var(--font-size-xs);
			color: var(--color-neutral-light);
			margin-top: var(--spacing-xs);
			letter-spacing: 0.5px;
		}
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

		@media (max-width: 640px) {
			width: 60px;
			height: 60px;
		}
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		margin-top: var(--spacing-md);
		font-style: italic;
	}

	// Main Content Section
	.recipe-content {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: var(--spacing-xl);
		margin-top: var(--spacing-xl);

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}

	.recipe-sidebar {
		@media (max-width: 900px) {
			max-width: 500px;
		}
	}

	// Section Headers
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-xs);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);

		h3 {
			margin-bottom: 0;
			color: var(--color-primary);
			position: relative;
			width: fit-content;

			&::after {
				content: '';
				position: absolute;
				bottom: -5px;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: var(--color-primary);
			}
		}

		@media (max-width: 640px) {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);

		@media (max-width: 640px) {
			margin-left: 0;
		}
	}

	// Ingredients List
	.ingredients-list {
		margin: 0;
		padding: 0;

		li {
			list-style: none;
			padding: var(--spacing-sm) 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			display: flex;
			justify-content: space-between;
			font-size: var(--font-size-sm);

			&:last-child {
				border-bottom: none;
			}

			@media (max-width: 900px) {
				font-size: var(--font-size-md);
			}
		}
	}

	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		min-width: 50px;

		@media (max-width: 900px) {
			min-width: 60px;
		}
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}

	// Instructions List
	.instructions-list {
		padding-left: 0;
		max-width: 800px;
		margin: 0;

		li {
			display: flex;
			margin-bottom: var(--spacing-xl);
			padding-bottom: var(--spacing-xl);
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			position: relative;

			&:last-child {
				border-bottom: none;
				margin-bottom: 0;
				padding-bottom: 0;
			}

			@media (max-width: 640px) {
				margin-bottom: var(--spacing-lg);
				padding-bottom: var(--spacing-lg);
			}
		}
	}

	.instruction-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background-color: var(--color-primary);
		color: var(--color-neutral-darkest);
		border-radius: 50%;
		font-weight: var(--font-weight-bold);
		margin-right: var(--spacing-md);
		flex-shrink: 0;
		font-size: var(--font-size-lg);
	}

	.instruction-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction-text {
		line-height: 1.6;
		font-size: var(--font-size-md);
		flex: 1;

		:global(span) {
			display: inline;
		}

		@media (max-width: 640px) {
			font-size: var(--font-size-base);
		}
	}

	// Media Styles
	.instruction-media {
		width: 100%;
		max-width: 450px;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		will-change: transform;
		content-visibility: auto;

		img,
		video {
			width: 100%;
			display: block;
			border-radius: var(--border-radius-md);
			aspect-ratio: 16 / 9;
			object-fit: cover;
			will-change: transform;
		}

		@media (max-width: 640px) {
			max-width: 100%;
		}
	}

	// Utility Classes
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

	.temperature {
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
		display: inline;
	}

	.conversion {
		font-size: var(--font-size-sm);
		white-space: nowrap;
		display: inline;
	}

	.temperature-wrapper {
		display: inline;
	}
</style>
