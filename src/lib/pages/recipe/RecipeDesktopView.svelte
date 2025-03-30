<script lang="ts">
	import type { RecipeData, Ingredient } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import RecipeMediaDisplay from '$lib/components/recipe-media/RecipeMediaDisplay.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import SaveButton from '$lib/components/save-button/SaveButton.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import RecipeInstruction from '$lib/components/accordion/RecipeInstruction.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import { scaleIngredientQuantity } from './utils/recipeUtils'
	import { page } from '$app/state'

	let {
		recipe,
		isLoggedIn,
		onLike,
		isSaved,
		onSave,
		nutrition,
		unitSystem,
		onUnitChange,
		comments = [],
		formError
	}: {
		recipe: RecipeData
		isLoggedIn: boolean
		onLike?: () => void
		isSaved: boolean
		onSave?: () => void
		nutrition?: {
			totalNutrition: {
				calories: number
				protein: number
				carbs: number
				fat: number
			}
		}
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		comments?: any[]
		formError?: string | null
	} = $props()

	// Serving size state
	let currentServings = $state(recipe.servings)
	
	// Scale ingredients based on serving size
	const scaledIngredients = $derived(
		recipe.ingredients?.map((ingredient: Ingredient) =>
			scaleIngredientQuantity(ingredient, currentServings, recipe.servings)
		) || []
	)

	// Create per-serving nutrition data if total nutrition is available
	const servingNutrition = $derived(
		nutrition?.totalNutrition && recipe.servings > 0
			? {
					calories: nutrition.totalNutrition.calories / recipe.servings,
					protein: nutrition.totalNutrition.protein / recipe.servings,
					carbs: nutrition.totalNutrition.carbs / recipe.servings,
					fat: nutrition.totalNutrition.fat / recipe.servings
				}
			: undefined
	)

	let isDescriptionExpanded = $state(false)

	const MAX_DESCRIPTION_LENGTH = 300

	const shouldTruncateDescription = $derived(
		recipe?.description && recipe.description.length > MAX_DESCRIPTION_LENGTH
	)

	const truncatedDescription = $derived(
		shouldTruncateDescription && recipe?.description
			? recipe.description.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
			: recipe?.description || ''
	)
	
	// Function to handle servings adjustment
	function handleServingsChange(newServings: number) {
		currentServings = newServings
	}
</script>

<div class="recipe-desktop-view-new">
	<div class="recipe-info">
		<div class="info-section">
			{#if recipe.tags && recipe.tags.length > 0}
				<div class="tags">
					{#each recipe.tags as tag}
						<Pill text={tag} />
					{/each}
				</div>
			{/if}

			<h1>{recipe.title}</h1>

			{#if recipe.userId && recipe.user?.username}
				<div class="recipe-creator-wrapper">
					<RecipeCreator
						username={recipe.user.username}
						userId={recipe.userId}
						profilePicUrl={recipe.user?.avatarUrl}
					/>

					<span class="published-date"
						>Published {new Date(recipe.createdAt).toLocaleDateString('en-US', {
							month: 'long',
							day: 'numeric',
							year: 'numeric'
						})}</span
					>
				</div>
			{/if}
		</div>

		<div class="actions-section">
			<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />
			<LikeButton
				count={recipe.likes}
				isLiked={recipe.isLiked}
				interactive={!!(isLoggedIn && onLike)}
				onLike={isLoggedIn ? onLike : undefined}
			/>
			<SaveButton {isSaved} interactive={!!isLoggedIn} onSave={isLoggedIn ? onSave : undefined} />
		</div>
	</div>

	<div class="media">
		<div class="recipe-media-container">
			{#if recipe.imageUrl}
				<RecipeMediaDisplay
					mainImageUrl={recipe.imageUrl}
					instructions={recipe.instructions}
					aspectRatio="auto"
				/>
			{:else}
				<div class="image-placeholder">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l4.47-4.47a.75.75 0 011.06 0l3.97 3.97 3.97-3.97a.75.75 0 011.06 0l4.47 4.47V6a.75.75 0 00-.75-.75H3.75A.75.75 0 003 6v10.06zM11.25 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
							clip-rule="evenodd"
						></path></svg
					>
				</div>
			{/if}
		</div>
	</div>

	{#if servingNutrition}
		<div class="nutrition-facts">
			<NutritionFacts nutrition={servingNutrition} />

			{#if recipe.ingredients && recipe.ingredients.length > 0}
				<h2 class="ingredients-header">
					Ingredients
					<div class="unit-toggle-wrapper">
						<UnitToggle state={unitSystem} onSelect={onUnitChange} />
					</div>
				</h2>

				<IngredientsList ingredients={scaledIngredients} {unitSystem} />
				
				<div class="servings-control">
					<ServingsAdjuster 
						servings={currentServings} 
						onServingsChange={handleServingsChange} 
					/>
				</div>
			{/if}
		</div>

		<div class="description">
			{#if recipe?.description}
				<div class="description-content">
					<p>{isDescriptionExpanded ? recipe.description : truncatedDescription}</p>
					{#if shouldTruncateDescription}
						{#if isDescriptionExpanded}
							<button class="view-more-button" onclick={() => (isDescriptionExpanded = false)}>
								<span class="view-more-button-text">- VIEW LESS</span>
							</button>
						{:else}
							<button class="view-more-button" onclick={() => (isDescriptionExpanded = true)}>
								<span class="view-more-button-text">+ VIEW MORE</span>
							</button>
						{/if}
					{/if}
				</div>
			{/if}

			{#if recipe.instructions && recipe.instructions.length > 0}
				<h2>Instructions</h2>
				<div class="instructions-list">
					{#each recipe.instructions as instruction, index}
						<RecipeInstruction {instruction} {index} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="comments-section">
			<h2>Comments</h2>
			<div class="comments-content">
				<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.recipe-desktop-view-new {
		display: grid;
		grid-template-areas:
			'recipe-text media'
			'nutrition   description'
			'comments    comments';
		grid-template-columns: 1fr 1.8fr;
		grid-template-rows: auto auto auto;
		gap: var(--spacing-xl);
		max-width: 1100px;
		margin: var(--spacing-xl) auto;
	}

	.recipe-info {
		grid-area: recipe-text;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--spacing-lg);
		padding-right: var(--spacing-xl);
	}

	.media {
		grid-area: media;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--border-radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		max-height: 500px;
	}

	.nutrition-facts {
		grid-area: nutrition;
		padding-right: var(--spacing-xl);
	}

	.description {
		grid-area: description;
		padding: var(--spacing-md) 0;
	}

	.comments-section {
		grid-area: comments;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.1);

		h2 {
			margin-bottom: var(--spacing-md);
		}
	}

	.info-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		height: 100%;
		justify-content: center;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.recipe-creator-wrapper {
		margin-top: var(--spacing-xs);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);

		.published-date {
			font-size: var(--font-size-sm);
			color: var(--color-text-secondary);
			margin-top: var(--spacing-xs);
		}
	}

	.actions-section {
		display: flex;
		align-items: center;
		justify-self: flex-end;
		gap: var(--spacing-sm);
		padding-top: var(--spacing-lg);
	}

	.btn {
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		transition: background-color 0.2s ease;

		svg {
			margin-right: var(--spacing-xxs);
		}

		&:hover:not(:disabled) {
			background-color: var(--color-background-hover);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.recipe-media-container {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--border-radius-md);
	}

	.image-placeholder {
		background-color: var(--color-neutral);
		border-radius: var(--border-radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-border);
		width: 100%;
		height: 100%;

		svg {
			width: 40%;
			height: 40%;
		}
	}

	.nutrition-facts-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--spacing-lg);
	}

	.unit-toggle-wrapper {
		margin-left: var(--spacing-md);
	}

	.description-content {
		position: relative;
		margin-bottom: var(--spacing-lg);

		p {
			font-size: var(--font-size-lg);
			margin-bottom: 0;
		}
	}

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.view-more-button {
		cursor: pointer;
		margin-top: var(--spacing-md);

		&:hover {
			text-decoration: underline;
		}

		.view-more-button-text {
			font-size: var(--font-size-sm);
			font-weight: var(--font-weight-bold);
			color: var(--color-primary);
		}
	}

	h1,
	h2 {
		font-family: var(--font-serif);
	}

	@include tablet {
		.recipe-desktop-view-new {
			grid-template-areas:
				'image image'
				'recipe-text recipe-text'
				'nutrition description'
				'comments comments';
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto auto auto;
			gap: var(--spacing-lg);
			max-width: 95%;
			margin: var(--spacing-lg);
		}

		.recipe-info {
			border-right: none;
			padding-right: 0;
			justify-content: flex-start;
		}

		.nutrition-facts {
			border-right: 1px solid var(--color-neutral);
			padding-right: var(--spacing-md);
		}

		.media {
			max-height: 400px;
		}
	}

	@include mobile {
		.recipe-desktop-view-new {
			grid-template-areas:
				'image'
				'recipe-text'
				'nutrition'
				'description'
				'comments';
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto auto auto;
			margin: var(--spacing-md);
		}

		.nutrition-facts {
			border-right: none;
			padding-right: 0;
		}

		.description-content {
			padding-left: 0;
			padding-top: var(--spacing-md);
			border-top: 1px solid var(--color-border);
		}
	}

	.servings-control {
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-md);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
