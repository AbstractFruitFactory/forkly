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
	import FloatingLikeButton from '$lib/components/floating-action-button/FloatingLikeButton.svelte'
	import FloatingSaveButton from '$lib/components/floating-action-button/FloatingSaveButton.svelte'
	import FloatingShareButton from '$lib/components/floating-action-button/FloatingShareButton.svelte'
	import SharePopup from '$lib/components/share-button/SharePopup.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import { onMount } from 'svelte'
	import CookingMode from '$lib/components/cooking-mode/CookingMode.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import { fly } from 'svelte/transition'

	let {
		recipe,
		isLoggedIn,
		onLike,
		isLiked = false,
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
		isLiked?: boolean
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
	let isCookingMode = $state(false)

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
	let nutritionOpacity = $state(1)

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

	let ingredientsSection: HTMLElement
	let nutritionFacts: HTMLElement

	const checkOverlap = () => {
		const ingredientsRect = ingredientsSection.getBoundingClientRect()
		const nutritionRect = nutritionFacts.getBoundingClientRect()

		if (ingredientsRect.bottom > nutritionRect.top && ingredientsRect.top < nutritionRect.bottom) {
			const overlapAmount = Math.min(
				(ingredientsRect.bottom - nutritionRect.top) / nutritionRect.height,
				1.0
			)
			nutritionOpacity = Math.max(0, 1 - overlapAmount * 2)
		} else {
			nutritionOpacity = 1
		}
	}

	onMount(() => {
		document.querySelector('.main')?.addEventListener('scroll', checkOverlap)
	})

	function startCookingMode() {
		isCookingMode = true
	}

	function exitCookingMode() {
		isCookingMode = false
	}
</script>

{#snippet actionButtons()}
	<FloatingLikeButton isActive={isLiked} onClick={onLike} />
	<FloatingSaveButton isActive={isSaved} onClick={onSave} />
	<FloatingShareButton onClick={toggleSharePopup} />
{/snippet}

<div class="recipe-desktop-view-new">
	<div class="sidebar">
		<div
			class="action-buttons"
			in:fly={{ x: -50, duration: 300, delay: 300 }}
			out:fly={{ x: -50, duration: 300 }}
		>
			{@render actionButtons()}
		</div>
	</div>

	<div class="main-content">
		<div class="content-grid">
			<div
				class="left-column card"
				in:fly={{ x: -50, duration: 300, delay: 300 }}
				out:fly={{ x: -50, duration: 300 }}
			>
				<div class="recipe-info">
					{#if recipe.tags && recipe.tags.length > 0}
						<div class="tags-and-action-buttons">
							<div class="tags">
								{#each recipe.tags as tag}
									<Pill text={tag} />
								{/each}
							</div>

							<div class="action-buttons-tablet">
								{@render actionButtons()}
							</div>
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
						<div class="ingredients-section" bind:this={ingredientsSection}>
							<div class="ingredients-header">
								<h3 style:margin-bottom="0">Ingredients</h3>
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
						<div
							class="nutrition-facts"
							bind:this={nutritionFacts}
							style="opacity: {nutritionOpacity}; transition: opacity 0.2s ease-out;"
						>
							<NutritionFacts nutrition={servingNutrition} />
						</div>
					{/if}
				</div>
			</div>

			<div
				class="right-column"
				in:fly={{ y: 50, duration: 300, delay: 300 }}
				out:fly={{ x: -50, duration: 300 }}
			>
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
					<div class="instructions-section">
						<div class="instructions-header">
							<Button variant="primary" fullWidth onclick={startCookingMode}>Start Cooking</Button>
						</div>
						<div class="instructions-list">
							{#each recipe.instructions as instruction, index}
								<div class="instruction-wrapper">
									<span class="step-number">{index + 1}</span>
									<RecipeInstruction {instruction} {index} />
								</div>
							{/each}
						</div>
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

<CookingMode {recipe} onClose={exitCookingMode} isOpen={isCookingMode} />

<SharePopup
	isOpen={isSharePopupOpen}
	onClose={toggleSharePopup}
	url={shareUrl}
	title={recipe.title}
/>

<style lang="scss">
	@import '$lib/global.scss';

	.recipe-desktop-view-new {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: var(--spacing-xl);
		max-width: 1200px;
		padding: 0 var(--spacing-xl);
		background: var(--color-background);

		@include tablet {
			grid-template-columns: 1fr;
			padding: var(--spacing-lg);
		}

		@include mobile {
			padding: var(--spacing-md);
		}
	}

	.content-grid {
		display: grid;
		grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.5fr);
		gap: var(--spacing-lg);

		@include tablet {
			display: grid;
			grid-template-areas:
				'image'
				'info'
				'instructions';
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
			gap: var(--spacing-lg);
		}
	}

	.card {
		background: var(--color-neutral-dark);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-md);

		@include mobile {
			padding: var(--spacing-md);
		}
	}

	.left-column {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);

		@include tablet {
			grid-area: info;
		}
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);

		@include tablet {
			display: contents;
		}

		.recipe-media {
			padding: 0;
			overflow: hidden;
			height: 400px;
			width: 100%;
			border-radius: var(--border-radius-lg);

			@include tablet {
				grid-area: image;
				height: 300px;
				margin-bottom: var(--spacing-md);
			}

			@include mobile {
				height: 250px;
			}

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
	}

	.recipe-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.tags-and-action-buttons {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.recipe-creator-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
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
		top: 0;
		z-index: 10;
		background: var(--color-neutral-dark);

		@include desktop {
			position: sticky;
			top: -1px;
		}
	}

	.description-content {
		p {
			font-size: var(--font-size-md);
			color: var(--color-neutral-light);
		}
	}

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);

		@include tablet {
			grid-area: instructions;
		}
	}

	.instruction-wrapper {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-md);
		align-items: flex-start;
	}

	.step-number {
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-primary);
		text-align: right;
		padding-top: var(--spacing-xs);

		@include tablet {
			font-size: var(--font-size-lg);
		}
	}

	.view-more-button {
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
		font-family: var(--font-serif);
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-semibold);
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

		@include tablet {
			display: none;
		}
	}

	.action-buttons {
		display: none;

		@include desktop {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-xl);
			align-items: center;
		}
	}

	.action-buttons-tablet {
		display: flex;
		gap: var(--spacing-md);

		@include desktop {
			display: none;
		}
	}

	.nutrition-facts {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--spacing-xl) 0;
		margin: var(--spacing-md) 0;
		position: relative;
		z-index: 1;

		:global(.nutrition-chart) {
			max-width: 280px;
			margin: 0 auto;
		}
	}

	.instructions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}
</style>
