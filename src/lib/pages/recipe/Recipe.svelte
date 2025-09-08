<script lang="ts">
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import DesktopLayout from '$lib/pages/recipe/DesktopLayout.svelte'
	import MobileLayout from '$lib/pages/recipe/MobileLayout.svelte'
	import FloatingLikeButton from '$lib/components/floating-action-button/FloatingLikeButton.svelte'
	import FloatingSaveButton from '$lib/components/floating-action-button/FloatingSaveButton.svelte'
	import FloatingShareButton from '$lib/components/floating-action-button/FloatingShareButton.svelte'
	import SharePopup from '$lib/components/share-popup/SharePopup.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import MessageSquare from 'lucide-svelte/icons/message-square'
	import Description from '$lib/components/Description.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import RecipeInstructions from '$lib/components/recipe-instructions/RecipeInstructions.svelte'
	import CommentList, { type CommentT } from '$lib/components/comment/CommentList.svelte'
	import NutritionFacts from '$lib/components/nutrition-facts/NutritionFacts.svelte'
	import RecipeImagePlaceholder from '$lib/components/recipe-image-placeholder/RecipeImagePlaceholder.svelte'
	import { onMount } from 'svelte'
	import Toast from '$lib/components/toast/Toast.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import WarningBox from '$lib/components/warning-box/WarningBox.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import CookingMode from '$lib/components/cooking-mode/CookingMode.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'

	let {
		recipeData,
		onLike,
		onSave,
		unitSystem,
		onUnitChange,
		onCreateCollection,
		onBackClick,
		formError,
		loadComments,
		preview = false
	}: {
		recipeData: Promise<{
			recipe: DetailedRecipe
			comments: {
				comments: CommentT[]
				total: number
			}
			collections: string[]
			isLoggedIn: boolean
		}>
		onLike?: () => void
		onSave?: (collectionName?: string) => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		onCreateCollection: (name: string) => Promise<void>
		onBackClick?: () => void
		formError?: string
		loadComments: (pageNum: number) => Promise<{ comments: CommentT[]; total: number }>
		preview?: boolean
	} = $props()

	let data = $derived.by(async () => await recipeData)

	let isLoggedIn = $derived.by(() => data.then((d) => d.isLoggedIn))

	let isLiked = $derived.by(() => data.then((d) => d.recipe.isLiked))
	let isSaved = $derived.by(() => data.then((d) => d.recipe.isSaved))
	let likes = $derived.by(() => data.then((d) => d.recipe.likes))
	let isSharePopupOpen = $state(false)
	let shareUrl = $state('')
	let toastType = $state<'like' | 'save'>()
	let toastRef: Toast
	let savePopupOpen = $state(false)
	let isCreatingCollection = $state(false)
	let newCollectionName = $state('')
	let localCollections = $state<string[]>([])
	let selectedCollection = $state<string | undefined>('All Recipes')
	let showDuplicateWarning = $state(false)
	let totalComments = $state<number>(0)
	let imageBroken = $state(false)
	let currentServings = $state<number>(1)

	$effect(() => {
		data.then((r) => {
			totalComments = r.comments.total
		})
	})

	$effect(() => {
		data.then((r) => {
			localCollections = [...r.collections]
		})
	})

	$effect(() => {
		if (newCollectionName.trim() && showDuplicateWarning) {
			const trimmedName = newCollectionName.trim()
			if (!localCollections.includes(trimmedName)) {
				showDuplicateWarning = false
			}
		}
	})

	$effect(() => {
		data.then((r) => {
			imageBroken = false
			currentServings = r.recipe.servings
		})
	})

	onMount(() => {
		shareUrl = `${window.location.origin}${window.location.pathname}`
	})

	const handleLike = async () => {
		const loggedIn = await isLoggedIn

		if (!loggedIn) {
			toastType = 'like'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onLike) return
		const currentLiked = await isLiked
		const currentLikes = await likes
		isLiked = Promise.resolve(!currentLiked)
		likes = Promise.resolve(currentLikes + (currentLiked ? -1 : 1))
		onLike()
	}

	const handleSave = async (collectionName?: string) => {
		const data = await recipeData
		const loggedIn = data.isLoggedIn
		if (!loggedIn) {
			toastType = 'save'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onSave) return
		const currentSaved = await isSaved
		isSaved = Promise.resolve(!currentSaved)
		onSave(collectionName)
	}

	const handleSaveToCollections = async () => {
		const data = await recipeData
		const loggedIn = data.isLoggedIn
		if (!loggedIn) {
			toastType = 'save'
			if (toastRef) toastRef.trigger()
			return
		}
		if (!onSave) return

		const currentSaved = await isSaved
		isSaved = Promise.resolve(!currentSaved)

		if (!selectedCollection || selectedCollection === 'All Recipes') {
			onSave()
		} else {
			onSave(selectedCollection)
		}

		savePopupOpen = false
		selectedCollection = undefined
	}

	const selectCollection = (collection: string) => {
		selectedCollection = selectedCollection === collection ? undefined : collection
	}

	const toggleSharePopup = () => {
		isSharePopupOpen = !isSharePopupOpen
	}

	const handleCreateCollection = async () => {
		if (newCollectionName.trim()) {
			const trimmedName = newCollectionName.trim()
			if (localCollections.includes(trimmedName)) {
				showDuplicateWarning = true
				return false
			}
			await onCreateCollection(trimmedName)
			localCollections = [...localCollections, trimmedName]
			isCreatingCollection = false
			newCollectionName = ''
			return true
		}
		return false
	}

	let ingredientsSection = $state<HTMLElement>()
	let instructionsSection = $state<HTMLElement>()
	let commentsSection = $state<HTMLElement>()

	const scrollToSection = (section: HTMLElement) => {
		section.scrollIntoView({ behavior: 'smooth' })
	}

	const singleServingNutrition = $derived(
		data.then((r) => {
			if (!r.recipe.nutrition) {
				return undefined
			}

			const { calories, protein, carbs, fat } = r.recipe.nutrition

			if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
				return undefined
			}

			return {
				calories: calories / r.recipe.servings,
				protein: protein / r.recipe.servings,
				carbs: carbs / r.recipe.servings,
				fat: fat / r.recipe.servings
			}
		})
	)

	const recipeTitle = $derived(data.then((r) => r.recipe.title))

	const handleServingsChange = (newServings: number) => {
		currentServings = newServings
	}
</script>

{#snippet commonImage()}
	{#await data}
		<RecipeImagePlaceholder loading size="large" />
	{:then recipeData}
		{#if recipeData.recipe.imageUrl && !imageBroken}
			<img
				src={recipeData.recipe.imageUrl}
				alt={recipeData.recipe.title}
				onerror={() => (imageBroken = true)}
				onload={() => (imageBroken = false)}
			/>
		{:else}
			<RecipeImagePlaceholder size="large" broken={imageBroken} />
		{/if}
	{/await}
{/snippet}

{#snippet tags()}
	{#await data}
		<Skeleton />
	{:then recipeData}
		{#if recipeData.recipe.tags}
			{#each recipeData.recipe.tags as tag}
				<Pill text={tag} color="var(--color-text-on-background)" />
			{/each}
		{/if}
	{/await}
{/snippet}

{#snippet title()}
	{#await data}
		<Skeleton width="20rem" height="2rem" />
	{:then recipeData}
		<h1>{recipeData.recipe.title}</h1>
	{/await}
{/snippet}

{#snippet actionButtons()}
	{#if !preview}
		{#await Promise.all([isLiked, likes, isSaved])}
			<FloatingLikeButton loading />
			<FloatingSaveButton loading />
			<FloatingShareButton loading />
		{:then [isLiked, likes, isSaved]}
			<FloatingLikeButton isActive={isLiked} count={likes} onClick={handleLike} />
			<FloatingSaveButton
				isActive={isSaved}
				onClick={() => {
					if (!isLoggedIn) {
						handleSave()
						return
					}

					if (isSaved) {
						handleSave()
					} else {
						savePopupOpen = true
					}
				}}
			/>
			<FloatingShareButton onClick={toggleSharePopup} />
		{/await}
	{/if}
{/snippet}

{#snippet commonDescription(card: boolean)}
	{#await data}
		<Description
			description=""
			username={undefined}
			userId={undefined}
			profilePicUrl={undefined}
			{card}
			loading={true}
		/>
	{:then recipeData}
		<Description
			description={recipeData.recipe.description || ''}
			username={recipeData.recipe.user?.username}
			userId={recipeData.recipe.userId}
			profilePicUrl={recipeData.recipe.user?.avatarUrl}
			{card}
		/>
	{/await}
{/snippet}

{#snippet nutrition()}
	{#await singleServingNutrition}
		<Skeleton />
	{:then singleServingNutrition}
		{#if singleServingNutrition}
			<h3 class="header no-top-margin-mobile">Nutrition Per Serving</h3>

			<div class="card desktop-only">
				<NutritionFacts nutrition={singleServingNutrition} />
			</div>

			<div class="mobile-only">
				<NutritionFacts nutrition={singleServingNutrition} />
			</div>
		{/if}
	{/await}
{/snippet}

{#snippet ingredients()}
	<div class="ingredients-section" bind:this={ingredientsSection}>
		<div class="header no-top-margin-mobile">
			<h3>Ingredients</h3>
		</div>

		{#snippet ingredientsCard()}
			<div class="ingredients-settings">
				<ServingsAdjuster servings={currentServings} onServingsChange={handleServingsChange} />
				{#await data then _}
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				{/await}
			</div>

			{#await data}
				<IngredientsList loading ingredients={[]} servings={0} originalServings={0} {unitSystem} />
			{:then recipeData}
				<IngredientsList
					ingredients={recipeData.recipe.ingredients}
					servings={currentServings}
					originalServings={recipeData.recipe.servings}
					{unitSystem}
				/>
			{/await}
		{/snippet}

		<div class="ingredients-card card desktop-only">
			{@render ingredientsCard()}
		</div>

		<div class="ingredients-card mobile-only">
			{@render ingredientsCard()}
		</div>
	</div>
{/snippet}

{#snippet instructions(useCookingMode: boolean = false)}
	<div bind:this={instructionsSection}>
		<div class="header no-top-margin-mobile">
			<h3 style="margin-bottom: 0;">Instructions</h3>
		</div>
		{#await data}
			<RecipeInstructions instructions={[]} loading />
		{:then recipeData}
			{#if useCookingMode}
				<CookingMode
					inline={true}
					isOpen={true}
					instructions={recipeData.recipe.instructions}
					servings={currentServings}
					originalServings={recipeData.recipe.servings}
					{unitSystem}
				/>
			{:else}
				<RecipeInstructions instructions={recipeData.recipe.instructions} />
			{/if}
		{/await}
	</div>
{/snippet}

{#snippet comments()}
	{#if !preview}
		<div class="comments-section" bind:this={commentsSection}>
			<div class="header no-top-margin-mobile">
				<h3 style:display="flex" style:align-items="center" style:gap="var(--spacing-sm)">
					<MessageSquare size={20} />
					Comments
					{#if totalComments}
						<span style:font-size="var(--font-size-xl)" style:font-weight="500">
							({totalComments})
						</span>
					{/if}
				</h3>
			</div>
			{#await data}
				<CommentList
					comments={[]}
					isLoggedIn={false}
					recipeId=""
					{formError}
					loading={true}
					total={0}
					loadComments={() => Promise.resolve({ comments: [], total: 0 })}
				/>
			{:then recipeData}
				<CommentList
					comments={recipeData.comments.comments}
					isLoggedIn={recipeData.isLoggedIn}
					recipeId={recipeData.recipe.id}
					{formError}
					bind:total={totalComments}
					{loadComments}
				/>
			{/await}
		</div>
	{/if}
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
	<MobileLayout {tags} {title} {actionButtons} {nutrition} {ingredients} {instructions} {comments}>
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

{#await isLoggedIn}
	<!-- Loading state for popup -->
{:then loggedIn}
	{#if loggedIn}
		<Popup
			isOpen={savePopupOpen}
			title="Save recipe"
			onClose={() => {
				savePopupOpen = false
				isCreatingCollection = false
				newCollectionName = ''
				selectedCollection = undefined
			}}
		>
			<div class="collections-list">
				{#each localCollections as collection (collection)}
					<button
						class="collection-item"
						animate:flip
						in:scale
						onclick={() => selectCollection(collection)}
					>
						<div class="collection-item-name">{collection}</div>
						<div class="collection-item-checkbox">
							<input
								type="radio"
								name="collection-selection"
								value={collection}
								checked={selectedCollection === collection}
								bind:group={selectedCollection}
							/>
						</div>
					</button>
				{/each}
			</div>

			<div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
				<Input
					bind:value={newCollectionName}
					actionButton={{
						text: 'Create',
						onClick: async () => {
							await handleCreateCollection()
						}
					}}
				>
					<input bind:value={newCollectionName} type="text" placeholder="Collection name" />
				</Input>

				{#if showDuplicateWarning}
					<WarningBox message="A collection with this name already exists." />
				{/if}

				<Button fullWidth color="primary" onclick={handleSaveToCollections}>Save</Button>
			</div>
		</Popup>
	{/if}
{/await}

<Toast bind:this={toastRef} type="info">
	{#snippet message()}
		Please <a class="toast-link" href="/login">log in</a> to {toastType === 'like'
			? 'like'
			: 'save'} recipes.
	{/snippet}
</Toast>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

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
		word-break: break-word;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		margin-top: var(--spacing-xl);

		h3 {
			margin-bottom: 0;
		}
	}

	.no-top-margin-mobile {
		@include mobile {
			margin-top: 0;
		}
	}

	.ingredients-settings {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
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
		max-height: 200px;
		overflow-y: auto;
	}

	.collection-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: background var(--transition-fast) var(--ease-in-out);
		cursor: pointer;

		&:hover {
			background: var(--color-neutral);
		}

		.collection-item-name {
			font-size: var(--font-size-sm);
		}

		.collection-item-checkbox {
			display: flex;
			align-items: center;
			justify-content: center;

			input[type='radio'] {
				width: 18px;
				height: 18px;
				cursor: pointer;
				accent-color: var(--color-primary);
			}
		}
	}

	.toast-link {
		color: var(--color-text-on-primary) !important;
		text-decoration: underline !important;
	}
</style>
