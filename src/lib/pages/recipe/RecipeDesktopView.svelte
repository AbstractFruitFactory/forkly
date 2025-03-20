<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData, Ingredient } from '$lib/types'
	import { dietColors } from '$lib/types'
	import { page } from '$app/state'
	import Pill from '$lib/components/pill/Pill.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import BookmarkButton from '$lib/components/bookmark-button/BookmarkButton.svelte'
	import DislikeButton from '$lib/components/dislike-button/DislikeButton.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'

	let {
		recipe,
		nutrition,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark,
		getFormattedIngredient,
		comments = [],
		formError
	} = $props<{
		recipe: RecipeData
		nutrition: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		onDislike?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBookmark?: () => void
		getFormattedIngredient: (ingredient: Ingredient, unitSystem: UnitSystem) => any
		comments?: any[]
		formError?: string | null
	}>()
</script>

<div class="desktop-view">
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

					{#snippet dislikeButton()}
						<DislikeButton
							isDisliked={recipe.isDisliked}
							interactive={!!onDislike}
							onDislike={isLoggedIn ? onDislike : undefined}
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
						{@render dislikeButton()}
						{@render likeButton()}
						{@render bookmarkButton()}
					{:else}
						<Popover type="warning">
							{#snippet trigger()}
								{@render dislikeButton()}
							{/snippet}

							{#snippet content()}
								Login to dislike recipes!
							{/snippet}
						</Popover>
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
							<Pill text={diet} color={dietColors[diet as keyof typeof dietColors]} />
						{/each}
					</div>
				{/if}
			</div>

			<div class="nutrition-facts">
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
			<IngredientsList 
				ingredients={recipe.ingredients} 
				{unitSystem} 
				{getFormattedIngredient} 
			/>
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

	<div class="comments-section">
		<div class="comments-content">
			<CommentList 
				{comments} 
				{isLoggedIn} 
				recipeId={recipe.id}
				{formError}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.desktop-view {
		margin: 0 auto;
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--spacing-xl);

		@include mobile {
			display: none;
		}
	}

	// Original styles (now applied to desktop view)
	.recipe-header-section {
		display: grid;
		grid-template-columns: minmax(250px, 40%) 1fr;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);

		@include tablet {
			grid-template-columns: 1fr;
		}
	}

	.recipe-image {
		position: relative;
		aspect-ratio: 1 / 1;
		width: 100%;
		overflow: hidden;
		border-radius: var(--border-radius-md);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		@include tablet {
			max-width: 400px;
			margin: 0 auto var(--spacing-md) auto;
		}
	}

	.recipe-intro {
		display: flex;
		flex-direction: column;

		h2 {
			margin-bottom: 0;
			color: var(--color-neutral-lightest);
			flex: 1;

			@include small-mobile {
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

		@include small-mobile {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.recipe-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);

		@include small-mobile {
			margin-top: var(--spacing-sm);
		}
	}

	.recipe-tags {
		margin-bottom: var(--spacing-md);

		.tags {
			display: flex;
			flex-wrap: wrap;
			gap: var(--spacing-xs);
		}
	}

	.nutrition-facts {
		margin-top: var(--spacing-md);
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);

		@include small-mobile {
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

			@include small-mobile {
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

		@include small-mobile {
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

		@include tablet {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}

	.recipe-sidebar {
		@include tablet {
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

		@include small-mobile {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);

		@include small-mobile {
			margin-left: 0;
		}
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

			@include small-mobile {
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

		@include small-mobile {
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

		@include small-mobile {
			max-width: 100%;
		}
	}

	// Utility Classes
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

	// Comments Section
	.comments-section {
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
