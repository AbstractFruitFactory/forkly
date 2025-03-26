<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData, Ingredient } from '$lib/types'
	import { page } from '$app/state'
	import Pill from '$lib/components/pill/Pill.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import DislikeButton from '$lib/components/dislike-button/DislikeButton.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import RecipeMediaDisplay from '$lib/components/recipe-media/RecipeMediaDisplay.svelte'
	import RecipeInstruction from '$lib/components/accordion/RecipeInstruction.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import {
		getFormattedIngredient as formatIngredient,
		scaleIngredientQuantity
	} from './utils/recipeUtils'

	let {
		recipe,
		nutrition,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
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
		getFormattedIngredient: (ingredient: Ingredient, unitSystem: UnitSystem) => any
		comments?: any[]
		formError?: string | null
	}>()

	let currentServings = $state(recipe.servings)
	let scaledIngredients = $derived(
		recipe.ingredients.map((ingredient: Ingredient) =>
			scaleIngredientQuantity(ingredient, currentServings, recipe.servings)
		)
	)

	function handleServingsChange(newServings: number) {
		currentServings = newServings
	}
</script>

<div class="desktop-view">
	<div class="recipe-header-section">
		<div class="recipe-image">
			<RecipeMediaDisplay
				mainImageUrl={recipe.imageUrl}
				instructions={recipe.instructions}
				aspectRatio="1/1"
			/>
		</div>

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

					{#if isLoggedIn}
						{@render dislikeButton()}
						{@render likeButton()}
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
					{/if}
				</div>
			</div>

			{#if recipe.description}
				<p class="description">{recipe.description}</p>
			{/if}

			{#if recipe.userId && recipe.user?.username}
				<div class="recipe-creator-wrapper">
					<RecipeCreator
						username={recipe.user.username}
						userId={recipe.userId}
						profilePicUrl={recipe.user?.avatarUrl}
					/>
				</div>
			{/if}

			<div class="recipe-tags">
				{#if recipe.diets && recipe.diets.length > 0}
					<div class="tags">
						{#each recipe.tags as tag}
							<Pill text={tag} />
						{/each}
					</div>
				{/if}
			</div>

			<div class="nutrition-facts-wrapper">
				<NutritionFacts {nutrition} />
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
			<IngredientsList ingredients={scaledIngredients} {unitSystem} {getFormattedIngredient} />
			<div class="servings-control">
				<ServingsAdjuster servings={currentServings} onServingsChange={handleServingsChange} />
			</div>
		</div>

		<div class="recipe-main">
			<div class="section-header">
				<h3>Instructions</h3>
			</div>
			<div class="instructions-list">
				{#each recipe.instructions as instruction, i}
					<RecipeInstruction {instruction} index={i} />
				{/each}
			</div>
		</div>
	</div>

	<div class="comments-section">
		<div class="comments-content">
			<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
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
		max-width: 1100px;

		@include mobile {
			display: none;
		}
	}

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

		:global(.recipe-media) {
			border-radius: var(--border-radius-md);
		}

		@include tablet {
			max-width: 400px;
			margin: 0 auto var(--spacing-md) auto;
		}
	}

	.recipe-intro {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

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

	.nutrition-facts-wrapper {
		margin-top: var(--spacing-md);
	}

	.recipe-content {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: var(--spacing-xl);
		margin-top: var(--spacing-xl);
		position: relative;

		@include tablet {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}

	.recipe-sidebar {
		@include desktop {
			position: sticky;
			top: var(--spacing-xl);
			height: fit-content;
			align-self: start;
		}
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
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

	.servings-control {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.instructions-list {
		padding-left: 0;
		max-width: 800px;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.comments-section {
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.recipe-creator-wrapper {
		margin-top: var(--spacing-sm);
	}
</style>
