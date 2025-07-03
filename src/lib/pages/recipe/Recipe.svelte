<script lang="ts">
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { NutritionInfo } from '$lib/server/food-api'
	import DesktopLayout from '$lib/pages/recipe/DesktopLayout.svelte'
	import MobileLayout from '$lib/pages/recipe/MobileLayout.svelte'
	import FloatingLikeButton from '$lib/components/floating-action-button/FloatingLikeButton.svelte'
	import FloatingSaveButton from '$lib/components/floating-action-button/FloatingSaveButton.svelte'
	import FloatingShareButton from '$lib/components/floating-action-button/FloatingShareButton.svelte'
	import SharePopup from '$lib/components/share-button/SharePopup.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import CirclePlus from 'lucide-svelte/icons/circle-plus'
	import MessageSquare from 'lucide-svelte/icons/message-square'
	import Description from '$lib/components/Description.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import RecipeInstructions from '$lib/components/recipe-instructions/RecipeInstructions.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import RecipeImagePlaceholder from '$lib/components/recipe-image-placeholder/RecipeImagePlaceholder.svelte'
	import Switch from '$lib/components/Switch.svelte'
	import { onMount } from 'svelte'
	import Toast from '$lib/components/toast/Toast.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'

	let {
		recipe,
		nutritionInfo,
		onLike,
		onSave,
		unitSystem,
		onUnitChange,
		user,
		onCreateCollection,
		onBackClick,
		recipeComments = [],
		formError
	}: {
		recipe: Promise<DetailedRecipe>
		nutritionInfo: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		onSave?: (collectionName?: string) => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		user?: {
			collections: string[]
		}
		onCreateCollection: (name: string) => Promise<void>
		onBackClick?: () => void
		recipeComments?: any[]
		formError?: string
	} = $props()

	let isLiked = $derived.by(() => recipe.then((r) => r.isLiked))
	let isSaved = $derived.by(() => recipe.then((r) => r.isSaved))
	let isSharePopupOpen = $state(false)
	let shareUrl = $state('')
	let toastType = $state<'like' | 'save'>()
	let toastRef: Toast
	let hideImages = $state(false)
	let savePopupOpen = $state(false)
	let isCreatingCollection = $state(false)
	let newCollectionName = $state('')
	let localCollections = $state<string[]>([])

	$effect(() => {
		if (user?.collections) {
			localCollections = [...user.collections]
		}
	})

	onMount(() => {
		shareUrl = `${window.location.origin}${window.location.pathname}`
	})

	const handleLike = async () => {
		if (!user) {
			toastType = 'like'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onLike) return
		const currentLiked = await isLiked
		isLiked = Promise.resolve(!currentLiked)
		onLike()
	}

	const handleSave = async (collectionName?: string) => {
		if (!user) {
			toastType = 'save'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onSave) return
		const currentSaved = await isSaved
		isSaved = Promise.resolve(!currentSaved)
		onSave(collectionName)
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

	const singleServingNutrition = $derived(
		recipe.then((r) => {
			if (!nutritionInfo.totalNutrition) {
				return undefined
			}
			return {
				calories: nutritionInfo.totalNutrition.calories / r.servings,
				protein: nutritionInfo.totalNutrition.protein / r.servings,
				carbs: nutritionInfo.totalNutrition.carbs / r.servings,
				fat: nutritionInfo.totalNutrition.fat / r.servings
			}
		})
	)

	const recipeTitle = $derived(recipe.then((r) => r.title))
</script>

{#snippet commonImage()}
	{#await recipe}
		<RecipeImagePlaceholder loading size="large" />
	{:then recipe}
		<img src={recipe.imageUrl || ''} alt={recipe.title} />
	{/await}
{/snippet}

{#snippet tags()}
	{#await recipe}
		<Skeleton />
	{:then recipe}
		{#if recipe.tags}
			{#each recipe.tags as tag}
				<Pill text={tag} />
			{/each}
		{/if}
	{/await}
{/snippet}

{#snippet title()}
	{#await recipe}
		<Skeleton width="20rem" height="2rem" />
	{:then recipe}
		<h1>{recipe.title}</h1>
	{/await}
{/snippet}

{#snippet actionButtons()}
	{#await Promise.all([isLiked, isSaved])}
		<FloatingLikeButton loading />
		<FloatingSaveButton loading />
		<FloatingShareButton loading />
	{:then [isLiked, isSaved]}
		<FloatingLikeButton isActive={isLiked} onClick={handleLike} />
		<FloatingSaveButton
			isActive={isSaved}
			onClick={() => {
				if (isSaved) {
					handleSave()
				} else {
					savePopupOpen = true
				}
			}}
		/>
		<FloatingShareButton onClick={toggleSharePopup} />
	{/await}
{/snippet}

{#snippet commonDescription(card: boolean)}
	{#await recipe}
		<Description
			description=""
			username={undefined}
			userId={undefined}
			profilePicUrl={undefined}
			{card}
			loading={true}
		/>
	{:then recipe}
		<Description
			description={recipe.description || ''}
			username={recipe.user?.username}
			userId={recipe.userId}
			profilePicUrl={recipe.user?.avatarUrl}
			{card}
		/>
	{/await}
{/snippet}

{#snippet nutrition()}
	{#await singleServingNutrition}
		<Skeleton />
	{:then singleServingNutrition}
		{#if singleServingNutrition}
			<div>
				<h3>Nutrition Per Serving</h3>
				<div class="card">
					<NutritionFacts nutrition={singleServingNutrition} />
				</div>
			</div>
		{/if}
	{/await}
{/snippet}

{#snippet ingredients()}
	<div class="ingredients-section" bind:this={ingredientsSection}>
		<div class="ingredients-header">
			<h3>Ingredients</h3>
			{#await recipe then _}
				<UnitToggle state={unitSystem} onSelect={onUnitChange} />
			{/await}
		</div>
		{#await recipe}
			<IngredientsList loading ingredients={[]} servings={0} originalServings={0} {unitSystem} />
		{:then recipe}
			<IngredientsList
				ingredients={recipe.ingredients}
				servings={recipe.servings}
				originalServings={recipe.servings}
				{unitSystem}
			/>
		{/await}
	</div>
{/snippet}

{#snippet instructions()}
	<div bind:this={instructionsSection}>
		<div class="instructions-header">
			<h3 style="margin-bottom: 0;">Instructions</h3>
			{#await recipe then _}
				<Switch bind:checked={hideImages} label="Hide media" />
			{/await}
		</div>
		{#await recipe}
			<RecipeInstructions instructions={[]} loading />
		{:then recipe}
			<RecipeInstructions instructions={recipe.instructions} bind:hideImages />
		{/await}
	</div>
{/snippet}

{#snippet comments()}
	<div class="comments-section" bind:this={commentsSection}>
		<h3 style:display="flex" style:align-items="center" style:gap="var(--spacing-sm)">
			<MessageSquare size={20} />
			Comments
			{#await recipe then _}
				<span style:font-size="var(--font-size-xl)" style:font-weight="500">
					({recipeComments.length})
				</span>
			{/await}
		</h3>
		{#await recipe}
			<CommentList comments={[]} isLoggedIn={!!user} recipeId="" {formError} loading={true} />
		{:then recipe}
			<CommentList comments={recipeComments} isLoggedIn={!!user} recipeId={recipe.id} {formError} />
		{/await}
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
	<DesktopLayout {tags} {title} {actionButtons} {nutrition} {ingredients} {instructions} {comments}>
		{#snippet image()}
			{@render commonImage()}
		{/snippet}

		{#snippet description()}
			{@render commonDescription(false)}
		{/snippet}
	</DesktopLayout>
</div>

<div class="recipe-mobile-view">
	<MobileLayout
		{onBackClick}
		{tags}
		{title}
		{actionButtons}
		{nutrition}
		{ingredients}
		{instructions}
		{comments}
		{navButtons}
	>
		{#snippet image()}
			{@render commonImage()}
		{/snippet}

		{#snippet description()}
			{@render commonDescription(true)}
		{/snippet}
	</MobileLayout>
</div>

{#await recipeTitle}
	<!-- Loading state for SharePopup -->
{:then title}
	<SharePopup isOpen={isSharePopupOpen} onClose={toggleSharePopup} url={shareUrl} {title} />
{/await}

{#if user}
	<Popup
		isOpen={savePopupOpen}
		onClose={() => {
			savePopupOpen = false
			isCreatingCollection = false
			newCollectionName = ''
		}}
	>
		<div class="collections-list">
			{#each localCollections as collection}
				<div class="collection-item">
					<div class="collection-item-name">{collection}</div>
					<div class="collection-item-icon">
						<CirclePlus
							size={16}
							onclick={() => {
								handleSave(collection)
								savePopupOpen = false
							}}
						/>
					</div>
				</div>
			{/each}
		</div>

		<div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
			{#if isCreatingCollection}
				<Input
					bind:value={newCollectionName}
					actionButton={{
						text: 'Save',
						onClick: async () => {
							if (newCollectionName.trim()) {
								await onCreateCollection(newCollectionName)
								localCollections = [...localCollections, newCollectionName]
								isCreatingCollection = false
								newCollectionName = ''
							}
						}
					}}
				>
					<input bind:value={newCollectionName} type="text" placeholder="Collection name" />
				</Input>
			{:else}
				<Button fullWidth color="primary" onclick={() => (isCreatingCollection = true)}>
					Create New Collection
				</Button>
			{/if}
			<Button
				fullWidth
				color="primary"
				onclick={() => {
					handleSave()
					savePopupOpen = false
				}}
			>
				Save
			</Button>
		</div>
	</Popup>
{/if}

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
		margin-bottom: 0;
	}

	.ingredients-header,
	.instructions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);

		h3 {
			margin-bottom: 0;
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
                        color: var(--color-text-on-surface);
                        opacity: 1;
                        background: rgba(255, 255, 255, 0.05);
                }

		&:active {
			color: var(--color-primary);
			opacity: 1;
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.collections-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.collection-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: background var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: var(--color-neutral);
		}

		.collection-item-name {
			font-size: var(--font-size-sm);
		}

		.collection-item-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
		}
	}
</style>
