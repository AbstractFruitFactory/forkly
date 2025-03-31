<script lang="ts">
	import type { RecipeData, Ingredient } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import RecipeMediaDisplay from '$lib/components/recipe-media/RecipeMediaDisplay.svelte'
	import RecipeCreator from '$lib/components/recipe-creator/RecipeCreator.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import RecipeInstruction from '$lib/components/accordion/RecipeInstruction.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import { scaleIngredientQuantity } from './utils/recipeUtils'
	import FloatingActionButton from '$lib/components/floating-action-button/FloatingActionButton.svelte'
	import Heart from 'lucide-svelte/icons/heart'
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import Share2 from 'lucide-svelte/icons/share-2'
	import SharePopup from '$lib/components/share-button/SharePopup.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'

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
	let isSharePopupOpen = $state(false)
	let shareUrl = $state('')

	const MAX_DESCRIPTION_LENGTH = 300

	const shouldTruncateDescription = $derived(
		recipe?.description && recipe.description.length > MAX_DESCRIPTION_LENGTH
	)

	const truncatedDescription = $derived(
		shouldTruncateDescription && recipe?.description
			? recipe.description.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
			: recipe?.description || ''
	)

	// Set the share URL when running on client side
	$effect(() => {
		if (typeof window !== 'undefined') {
			shareUrl = `${window.location.origin}${window.location.pathname}`
		}
	})

	// Function to handle servings adjustment
	function handleServingsChange(newServings: number) {
		currentServings = newServings
	}

	// Function to handle share button click
	function toggleSharePopup() {
		isSharePopupOpen = !isSharePopupOpen
	}
</script>

<div class="recipe-desktop-view-new">
	<div class="sidebar">
		<div class="action-buttons">
			<FloatingActionButton text="Like" onClick={onLike}>
				<Heart />
			</FloatingActionButton>
			<FloatingActionButton text="Save" onClick={onSave}>
				<Bookmark />
			</FloatingActionButton>
			<FloatingActionButton text="Share" onClick={toggleSharePopup}>
				<Share2 />
			</FloatingActionButton>
		</div>
	</div>

	<div class="main-content">
		<div class="content-grid">
			<div class="left-column card">
				<div class="recipe-info">
					{#if recipe.tags && recipe.tags.length > 0}
						<div class="tags">
							{#each recipe.tags as tag}
								<Pill text={tag} />
							{/each}
						</div>
					{/if}

					<h1 style:margin-bottom="0">{recipe.title}</h1>

					{#if recipe.userId && recipe.user?.username}
						<RecipeCreator
							username={recipe.user.username}
							userId={recipe.userId}
							profilePicUrl={recipe.user?.avatarUrl}
						/>
					{/if}

					{#if recipe?.description}
						<div class="description-content">
							<p>{isDescriptionExpanded ? recipe.description : truncatedDescription}</p>
							{#if shouldTruncateDescription}
								<button
									class="view-more-button"
									onclick={() => (isDescriptionExpanded = !isDescriptionExpanded)}
								>
									<span class="view-more-button-text">
										{isDescriptionExpanded ? '- VIEW LESS' : '+ VIEW MORE'}
									</span>
								</button>
							{/if}
						</div>
					{/if}

					{#if recipe.ingredients && recipe.ingredients.length > 0}
						<div class="ingredients-section">
							<div class="ingredients-header">
								<h2 style:margin-bottom="0">Ingredients</h2>
								<UnitToggle state={unitSystem} onSelect={onUnitChange} />
							</div>
							<IngredientsList ingredients={scaledIngredients} {unitSystem} />
							<div class="servings-control">
								<ServingsAdjuster
									servings={currentServings}
									onServingsChange={handleServingsChange}
								/>
							</div>
						</div>
					{/if}

					{#if servingNutrition}
						<div class="nutrition-facts">
							<NutritionFacts nutrition={servingNutrition} />
						</div>
					{/if}
				</div>
			</div>

			<div class="right-column">
				<div class="recipe-media card">
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
							>
								<path
									fill-rule="evenodd"
									d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l4.47-4.47a.75.75 0 011.06 0l3.97 3.97 3.97-3.97a.75.75 0 011.06 0l4.47 4.47V6a.75.75 0 00-.75-.75H3.75A.75.75 0 003 6v10.06zM11.25 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{/if}
				</div>

				{#if recipe.instructions && recipe.instructions.length > 0}
					<div class="instructions-list">
						{#each recipe.instructions as instruction, index}
							<div class="instruction-wrapper">
								<span class="step-number">{index + 1}</span>
								<RecipeInstruction {instruction} {index} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<div class="comments-section">
			<div class="comments-content">
				<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
			</div>
		</div>
	</div>
</div>

<SharePopup
	isOpen={isSharePopupOpen}
	onClose={toggleSharePopup}
	url={shareUrl}
	title={recipe.title}
/>

<style lang="scss">
	@import '$lib/global.scss';

	:global(body) {
		font-family:
			'DM Sans',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
	}

	.recipe-desktop-view-new {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: var(--spacing-xl);
		max-width: 1200px;
		margin: var(--spacing-xl) auto;
		padding: 0 var(--spacing-xl);
		background: var(--color-background);
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.5fr);
		gap: var(--spacing-lg);
	}

	.card {
		background: var(--color-neutral-dark);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-md);
	}

	.left-column {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.right-column {
		display: flex;
		flex-direction: column;

		.recipe-media {
			padding: 0;
			overflow: hidden;
			height: 400px;
			width: 100%;
			border-radius: var(--border-radius-lg);

			:global(img) {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
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

	.recipe-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
	}

	.recipe-creator-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

		.published-date {
			font-family: 'DM Sans', sans-serif;
			font-size: var(--font-size-sm);
			font-weight: 400;
			color: var(--color-neutral-light);
		}
	}

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.ingredients-section {
		border-top: var(--border-width-thin) solid var(--color-neutral);
		padding-top: var(--spacing-lg);
		margin-top: var(--spacing-lg);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		background: var(--color-neutral-dark);
	}

	.description-content {
		p {
			font-family: 'DM Sans', sans-serif;
			font-size: var(--font-size-md);
			line-height: 1.6;
			color: var(--color-neutral-light);
			font-weight: 400;
		}
	}

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		padding-top: var(--spacing-xl);
	}

	.instruction-wrapper {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-md);
		align-items: flex-start;
	}

	.step-number {
		font-family: 'DM Sans', sans-serif;
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-primary);
		text-align: right;
		padding-top: var(--spacing-xs);
	}

	.view-more-button {
		font-family: 'DM Sans', sans-serif;
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;

		&:hover {
			text-decoration: underline;
		}
	}

	.servings-control {
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
	}

	h1 {
		font-family: 'Fraunces', serif;
		font-size: var(--font-size-3xl);
		font-weight: 600;
		letter-spacing: -0.01em;
		margin-bottom: var(--spacing-lg);
		line-height: 1.2;
		color: var(--color-text);
	}

	h2 {
		font-family: 'DM Sans', sans-serif;
		font-size: var(--font-size-xl);
		font-weight: 500;
		letter-spacing: -0.02em;
		margin-bottom: var(--spacing-md);
		line-height: 1.3;
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		background-color: var(--color-neutral-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);

		svg {
			width: 48px;
			height: 48px;
		}
	}

	.sidebar {
		position: sticky;
		top: var(--spacing-xl);
		height: fit-content;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		align-items: center;
	}

	@include tablet {
		.recipe-desktop-view-new {
			grid-template-columns: 1fr;
			padding: var(--spacing-lg);
		}

		.content-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}

		.sidebar {
			position: static;
			margin-bottom: var(--spacing-xl);

			.action-buttons {
				flex-direction: row;
				justify-content: center;
				gap: var(--spacing-xl);
			}
		}

		.instruction-wrapper {
			grid-template-columns: 32px 1fr;
			gap: var(--spacing-sm);
		}

		.step-number {
			font-size: var(--font-size-lg);
		}

		.recipe-media {
			height: 300px;
		}
	}

	.nutrition-facts {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--spacing-xl) 0;
		margin: var(--spacing-md) 0;

		:global(.nutrition-chart) {
			max-width: 280px;
			margin: 0 auto;
		}
	}

	@include mobile {
		.recipe-desktop-view-new {
			padding: var(--spacing-md);
		}

		.card {
			padding: var(--spacing-md);
		}

		h1 {
			font-size: var(--font-size-xl);
		}

		h2 {
			font-size: var(--font-size-md);
		}

		.recipe-media {
			height: 250px;
		}
	}
</style>
