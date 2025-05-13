<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData } from '$lib/types'
	import DesktopLayout from './DesktopLayout.svelte'
	import MobileLayout from './MobileLayout.svelte'
	import RecipeMediaDisplay from '$lib/components/recipe-media/RecipeMediaDisplay.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import FloatingLikeButton from '$lib/components/floating-action-button/FloatingLikeButton.svelte'
	import FloatingSaveButton from '$lib/components/floating-action-button/FloatingSaveButton.svelte'
	import FloatingShareButton from '$lib/components/floating-action-button/FloatingShareButton.svelte'
	import SharePopup from '$lib/components/share-button/SharePopup.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import CookingMode from '$lib/components/cooking-mode/CookingMode.svelte'
	import RecipeInstructions from '$lib/components/recipe-instructions/RecipeInstructions.svelte'
	import Description from '$lib/components/Description.svelte'
	import { onMount, type Snippet } from 'svelte'
	import MessageSquare from 'lucide-svelte/icons/message-square'
	import Toast from '$lib/components/toast/Toast.svelte'

	let {
		recipe,
		nutritionInfo,
		onLike,
		onSave,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBackClick,
		recipeComments = [],
		formError
	}: {
		recipe: RecipeData
		nutritionInfo: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		onSave?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBackClick?: () => void
		recipeComments?: any[]
		formError?: string
	} = $props()

	let isLiked = $state(recipe.isLiked)
	let isSaved = $state(recipe.isSaved)
	let isSharePopupOpen = $state(false)
	let isCookingMode = $state(false)
	let shareUrl = $state('')
	let toastType = $state<'like' | 'save'>()
	let toastRef: Toast

	onMount(() => {
		shareUrl = `${window.location.origin}${window.location.pathname}`
	})

	const handleLike = () => {
		if (!isLoggedIn) {
			toastType = 'like'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onLike) return
		isLiked = !isLiked
		onLike()
	}

	const handleSave = () => {
		if (!isLoggedIn) {
			toastType = 'save'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onSave) return
		isSaved = !isSaved
		onSave()
	}

	const toggleSharePopup = () => {
		isSharePopupOpen = !isSharePopupOpen
	}

	let ingredientsSection: HTMLElement
	let instructionsSection: HTMLElement
	let commentsSection: HTMLElement

	const scrollToSection = (section: HTMLElement) => {
		section.scrollIntoView({ behavior: 'smooth' })
	}

	const singleServingNutrition = $derived({
		calories: nutritionInfo.totalNutrition.calories / recipe.servings,
		protein: nutritionInfo.totalNutrition.protein / recipe.servings,
		carbs: nutritionInfo.totalNutrition.carbs / recipe.servings,
		fat: nutritionInfo.totalNutrition.fat / recipe.servings
	})
</script>

{#snippet commonImage(img: Snippet)}
	{#if recipe.imageUrl}
		{@render img()}
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
{/snippet}

{#snippet tags()}
	{#if recipe.tags}
		{#each recipe.tags as tag}
			<Pill text={tag} />
		{/each}
	{/if}
{/snippet}

{#snippet title()}
	<h1>{recipe.title}</h1>
{/snippet}

{#snippet actionButtons()}
	<FloatingLikeButton isActive={isLiked} onClick={handleLike} />
	<FloatingSaveButton isActive={isSaved} onClick={handleSave} />
	<FloatingShareButton onClick={toggleSharePopup} />
{/snippet}

{#snippet description()}
	<Description
		description={recipe.description || ''}
		username={recipe.user?.username}
		userId={recipe.userId}
		profilePicUrl={recipe.user?.avatarUrl}
	/>
{/snippet}

{#snippet nutrition()}
	{#if singleServingNutrition}
		<div>
			<h3>Nutrition Per Serving</h3>
			<div class="card">
				<NutritionFacts nutrition={singleServingNutrition} />
			</div>
		</div>
	{/if}
{/snippet}

{#snippet ingredients()}
	{#if recipe.ingredients && recipe.ingredients.length > 0}
		<div class="ingredients-section" bind:this={ingredientsSection}>
			<div class="ingredients-header">
				<h3>Ingredients</h3>
				<UnitToggle state={unitSystem} onSelect={onUnitChange} />
			</div>
			<IngredientsList
				ingredients={recipe.ingredients}
				servings={recipe.servings}
				originalServings={recipe.servings}
			/>
		</div>
	{/if}
{/snippet}

{#snippet instructions()}
	{#if recipe.instructions && recipe.instructions.length > 0}
		<div bind:this={instructionsSection}>
			<h3>Instructions</h3>
			<RecipeInstructions instructions={recipe.instructions} />
		</div>
	{/if}
{/snippet}

{#snippet comments()}
	<div class="comments-section" bind:this={commentsSection}>
		<h3 style:display="flex" style:align-items="center" style:gap="var(--spacing-sm)">
			<MessageSquare size={20} />
			Comments
			<span style:font-size="var(--font-size-xl)" style:font-weight="500"
				>({recipeComments.length})</span
			>
		</h3>
		<CommentList comments={recipeComments} {isLoggedIn} recipeId={recipe.id} {formError} />
	</div>
{/snippet}

{#snippet navButtons()}
	<button class="nav-button" onclick={() => scrollToSection(ingredientsSection)}>
		Ingredients
	</button>
	<button class="nav-button" onclick={() => scrollToSection(instructionsSection)}>
		Instructions
	</button>
	<button class="nav-button" onclick={() => scrollToSection(commentsSection)}> Comments </button>
{/snippet}

<div class="recipe-desktop-view">
	<DesktopLayout
		{tags}
		{title}
		{actionButtons}
		{description}
		{nutrition}
		{ingredients}
		{instructions}
		{comments}
	>
		{#snippet image()}
			{#snippet img()}
				<RecipeMediaDisplay
					mainImageUrl={recipe.imageUrl || ''}
					media={recipe.instructions}
					aspectRatio="auto"
				/>
			{/snippet}
			{@render commonImage(img)}
		{/snippet}
	</DesktopLayout>
</div>

<div class="recipe-mobile-view">
	<MobileLayout
		{onBackClick}
		{tags}
		{title}
		{actionButtons}
		{description}
		{nutrition}
		{ingredients}
		{instructions}
		{comments}
		{navButtons}
	>
		{#snippet image()}
			{#snippet img()}
				<img src={recipe.imageUrl || ''} alt={recipe.title} />
			{/snippet}
			{@render commonImage(img)}
		{/snippet}
	</MobileLayout>
</div>

<CookingMode isOpen={isCookingMode} instructions={recipe.instructions} />

<SharePopup
	isOpen={isSharePopupOpen}
	onClose={toggleSharePopup}
	url={shareUrl}
	title={recipe.title}
/>

<Toast bind:this={toastRef} type="info">
	{#snippet message()}
		Please <a href="/login">log in</a> to {toastType === 'like' ? 'like' : 'save'} recipes.
	{/snippet}
</Toast>

<style lang="scss">
	@import '$lib/global.scss';

	.recipe-desktop-view {
		@include tablet {
			display: none;
		}
	}

	.recipe-mobile-view {
		@include desktop {
			display: none;
		}
	}

	h3 {
		margin-bottom: var(--spacing-md);
	}

	h1 {
		font-family: var(--font-serif);
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
	}

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);

		h3 {
			margin-bottom: 0;
		}
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

	.nav-button {
		flex: 1;
		background: none;
		border: none;
		padding: var(--spacing-sm) var(--spacing-xs);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-bold);
		border-radius: var(--border-radius-sm);

		&:hover {
			color: white;
			opacity: 1;
			background: rgba(255, 255, 255, 0.05);
		}

		&:active {
			color: var(--color-primary);
			opacity: 1;
			background: rgba(255, 255, 255, 0.08);
		}
	}
</style>
