<script lang="ts">
	import type { RecipeData } from '$lib/types'
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { getFormattedIngredient as GetFormattedIngredient } from './utils/recipeUtils'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import DislikeButton from '$lib/components/dislike-button/DislikeButton.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import BookmarkButton from '$lib/components/bookmark-button/BookmarkButton.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import MediaPlayer from '$lib/components/media-player/MediaPlayer.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import { page } from '$app/state'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import RecipeInstruction from '$lib/components/accordion/RecipeInstruction.svelte'
	import RecipeMediaDisplay from '$lib/components/recipe-media/RecipeMediaDisplay.svelte'

	let {
		recipe,
		nutrition,
		getFormattedIngredient,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark,
		onBackClick,
		comments,
		formError,
		onLike,
		onDislike,
		chef = { name: 'Emma Brown', title: 'Professional Chef', avatar: '' }
	}: {
		recipe: RecipeData
		nutrition: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		getFormattedIngredient: typeof GetFormattedIngredient
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBookmark?: () => void
		onBackClick?: () => void
		onLike?: () => void
		onDislike?: () => void
		comments: any[]
		formError?: string
		chef?: { name: string; title: string; avatar: string }
	} = $props()

	// Section references for scrolling
	let ingredientsSection: HTMLElement
	let instructionsSection: HTMLElement
	let commentsSection: HTMLElement
	let contentContainer: HTMLElement

	// Track expanded instruction steps
	let expandedInstructions = $state<number[]>([])

	// Cooking mode state
	let isCookingMode = $state(false)
	let currentStep = $state(0)
	let videoLoaded = $state(false)
	let videoError = $state(false)

	function scrollToSection(section: HTMLElement) {
		section.scrollIntoView({ behavior: 'smooth' })
	}

	function toggleInstruction(index: number) {
		if (expandedInstructions.includes(index)) {
			expandedInstructions = expandedInstructions.filter((i) => i !== index)
		} else {
			expandedInstructions = [...expandedInstructions, index]
		}
	}

	function startCookingMode() {
		isCookingMode = true
		currentStep = 0
	}

	function exitCookingMode() {
		isCookingMode = false
	}

	function handleCookingVideoError() {
		videoError = true
		// Try to reload the video
		setTimeout(() => {
			const video = document.querySelector('.cooking-media video') as HTMLVideoElement
			if (video) {
				video.load()
			}
		}, 1000)
	}

	function handleCookingVideoLoaded() {
		videoLoaded = true
		videoError = false
	}

	function nextStep(e: Event) {
		e.preventDefault()
		if (currentStep < recipe.instructions.length - 1) {
			currentStep++
			videoLoaded = false
			videoError = false
		}
	}

	function prevStep(e: Event) {
		e.preventDefault()
		if (currentStep > 0) {
			currentStep--
			videoLoaded = false
			videoError = false
		}
	}

	// Swipe handling for cooking mode
	let touchStartX = 0
	let touchEndX = 0

	function handleCookingTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX
	}

	function handleCookingTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX
	}

	function handleCookingTouchEnd(e: TouchEvent) {
		e.preventDefault()
		if (touchStartX - touchEndX > 50) {
			// Swipe left - next step
			nextStep(e)
		} else if (touchEndX - touchStartX > 50) {
			// Swipe right - previous step
			prevStep(e)
		}
		// Reset values
		touchStartX = 0
		touchEndX = 0
	}
</script>

<div class="recipe-mobile-view" data-page="recipe">
	<button class="back-button" onclick={onBackClick}>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
		</svg>
	</button>

	<div class="recipe-image">
		<RecipeMediaDisplay
			mainImageUrl={recipe.imageUrl || undefined}
			instructions={recipe.instructions}
			aspectRatio="30/10"
		/>
	</div>

	<div class="content-container" bind:this={contentContainer}>
		{#if !isCookingMode}
			<div class="bottom-container">
				<div class="nav-buttons">
					<button class="nav-button" onclick={() => scrollToSection(ingredientsSection)}>
						Ingredients
					</button>
					<button class="nav-button" onclick={() => scrollToSection(instructionsSection)}>
						Instructions
					</button>
					<button class="nav-button" onclick={() => scrollToSection(commentsSection)}>
						Comments
					</button>
				</div>
				<div class="start-cooking-wrapper">
					<Button variant="primary" size="md" fullWidth onclick={() => startCookingMode()}
						>Start Cooking</Button
					>
				</div>
			</div>
		{/if}

		<div class="recipe-content">
			<div class="recipe-header">
				<h3>{recipe.title}</h3>
				{#if chef?.avatar && chef.avatar !== ''}
					<div class="author-avatar">
						<ProfilePic profilePicUrl={chef.avatar} size="32px" />
					</div>
				{/if}
			</div>
			<p class="description">{recipe.description}</p>

			<div class="action-buttons">
				<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />
				<DislikeButton
					isDisliked={recipe.isDisliked}
					interactive={!!onDislike}
					onDislike={isLoggedIn ? onDislike : undefined}
				/>
				<LikeButton
					count={recipe.likes}
					isLiked={recipe.isLiked}
					interactive={!!onLike}
					onLike={isLoggedIn ? onLike : undefined}
				/>
				<BookmarkButton
					count={recipe.bookmarks}
					isBookmarked={recipe.isBookmarked}
					interactive={!!onBookmark}
					{onBookmark}
				/>
			</div>

			{#if nutrition?.totalNutrition}
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
			{/if}

			<div class="section-container">
				<section class="content-section" bind:this={ingredientsSection}>
					<div class="section-header">
						<h4 class="section-title">Ingredients</h4>
						<div class="unit-toggle-container">
							<UnitToggle state={unitSystem} onSelect={onUnitChange} />
						</div>
					</div>
					<IngredientsList ingredients={recipe.ingredients} {unitSystem} {getFormattedIngredient} />
				</section>

				<section class="content-section" bind:this={instructionsSection}>
					<h4 class="section-title">Instructions</h4>
					<div class="instructions-list">
						{#each recipe.instructions as instruction, i}
							<RecipeInstruction {instruction} index={i} />
						{/each}
					</div>
				</section>

				<section class="content-section" bind:this={commentsSection}>
					<h4 class="section-title">Comments</h4>
					<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
				</section>
			</div>
		</div>
	</div>

	{#if isCookingMode}
		<div class="cooking-mode">
			<div class="cooking-header">
				<div class="cooking-progress">
					<div class="cooking-progress-text">
						Step {currentStep + 1} of {recipe.instructions.length}
					</div>
					<div class="cooking-progress-bar">
						<div
							class="cooking-progress-fill"
							style="width: {((currentStep + 1) / recipe.instructions.length) * 100}%"
						></div>
					</div>
				</div>
				<button class="cooking-close-button" onclick={exitCookingMode}>
					<svg width="20" height="20" viewBox="0 0 24 24">
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>
			</div>

			<div
				class="cooking-content"
				ontouchstart={handleCookingTouchStart}
				ontouchmove={handleCookingTouchMove}
				ontouchend={handleCookingTouchEnd}
			>
				{#if recipe.instructions[currentStep].mediaUrl}
					<div class="cooking-media">
						{#if recipe.instructions[currentStep].mediaType === 'video'}
							<video
								src={recipe.instructions[currentStep].mediaUrl}
								autoplay
								loop
								muted
								playsinline
								data-webkit-playsinline="true"
								preload="auto"
								class="cooking-media-content"
								onerror={handleCookingVideoError}
								onloadeddata={handleCookingVideoLoaded}
								onclick={(e) => e.preventDefault()}
							></video>
							{#if videoError}
								<div class="video-error">
									<p>Video loading error. Retrying...</p>
								</div>
							{/if}
							{#if !videoLoaded && !videoError}
								<div class="video-loading">
									<div class="spinner"></div>
								</div>
							{/if}
						{:else if recipe.instructions[currentStep].mediaType === 'image'}
							<img
								src={recipe.instructions[currentStep].mediaUrl}
								alt="Step {currentStep + 1}"
								class="cooking-media-content"
							/>
						{/if}
					</div>
				{/if}

				<div class="cooking-instruction">
					<p class="cooking-instruction-text">{recipe.instructions[currentStep].text}</p>
				</div>
			</div>

			<div class="cooking-navigation">
				<button class="cooking-nav-button" onclick={prevStep} disabled={currentStep === 0}>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
					</svg>
					Previous
				</button>
				<button
					class="cooking-nav-button"
					onclick={nextStep}
					disabled={currentStep === recipe.instructions.length - 1}
				>
					Next
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';
	.recipe-mobile-view {
		display: none;

		@include mobile() {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100dvh;
			overflow-y: auto;
			background: var(--color-neutral-dark);
		}
	}

	.back-button {
		position: absolute;
		top: var(--spacing-md);
		left: var(--spacing-md);
		z-index: var(--z-drawer);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

		svg {
			fill: white;
			width: 20px;
			height: 20px;
		}

		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.recipe-image {
		position: relative;
		width: 100%;
		height: 30dvh;
		background: transparent;
		overflow: visible;
		z-index: 1;

		:global(.recipe-media) {
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}
	}

	.content-container {
		position: relative;
		width: 100%;
		background: var(--color-neutral-dark);
		border-radius: 0;
		margin-top: 0;
		padding-bottom: calc(120px + env(safe-area-inset-bottom));
		z-index: 0;
	}

	.recipe-content {
		padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
	}

	.recipe-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin: 0 0 var(--spacing-md);
	}

	.recipe-header h3 {
		margin: 0;
		flex: 1;
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: white;
		padding: 0;
	}

	.author-avatar {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		border-radius: var(--border-radius-full);
		overflow: hidden;
	}

	.description {
		font-size: var(--font-size-md);
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0 0 var(--spacing-md) 0;
	}

	.recipe-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md) 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.meta-value {
		font-weight: var(--font-weight-semibold);
		color: white;
		margin-bottom: var(--spacing-xs);
	}

	.meta-label {
		font-size: var(--font-size-sm);
		color: rgba(255, 255, 255, 0.7);
	}

	.start-cooking-wrapper {
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.bottom-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-neutral-dark);
		z-index: var(--z-sticky);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.nav-buttons {
		display: flex;
		justify-content: space-around;
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.nav-button {
		flex: 1;
		background: none;
		border: none;
		padding: var(--spacing-sm) var(--spacing-xs);
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-medium);
		border-radius: var(--border-radius-sm);
		opacity: 0.8;

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

	.section-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.content-section {
		padding: var(--spacing-md) 0;
		scroll-margin-top: 0;
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
		color: white;
		padding-bottom: var(--spacing-xs);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-xs);

		@include mobile {
			flex-direction: row;
			align-items: center;
			gap: var(--spacing-sm);
		}

		.section-title {
			margin-bottom: 0;
			padding-bottom: 0;
		}
	}

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md) 0;
	}

	.cooking-mode {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		background: var(--color-background);
		z-index: var(--z-modal);
		display: flex;
		flex-direction: column;
	}

	.cooking-header {
		padding: var(--spacing-md);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		background: var(--color-neutral-darker);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.cooking-close-button {
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

		svg {
			fill: white;
			width: 20px;
			height: 20px;
		}

		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.cooking-progress {
		flex: 1;
	}

	.cooking-progress-text {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		margin-bottom: var(--spacing-xs);
	}

	.cooking-progress-bar {
		height: 2px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: var(--border-radius-full);
		overflow: hidden;
	}

	.cooking-progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.cooking-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.cooking-media {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
	}

	.cooking-media-content {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cooking-instruction {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: var(--color-neutral-darker);
		border-radius: var(--border-radius-lg);
	}

	.cooking-instruction-text {
		font-size: var(--font-size-md);
		color: var(--color-neutral-light);
		line-height: 1.6;
	}

	.cooking-navigation {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-md);
		border-top: 1px solid var(--color-neutral-dark);
		background: var(--color-neutral-dark);
	}

	.cooking-nav-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: var(--color-neutral-darker);
		border: none;
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md) var(--spacing-lg);
		color: var(--color-neutral-light);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
	}

	.cooking-nav-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cooking-nav-button svg {
		fill: currentColor;
	}

	.video-error,
	.video-loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		text-align: center;
		padding: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.slideshow-controls {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		display: flex;
		justify-content: space-between;
		padding: 0 var(--spacing-md);
		pointer-events: none;
	}

	.slideshow-button {
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		pointer-events: auto;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
			pointer-events: none;
		}

		&:not(:disabled) {
			&:hover {
				background: rgba(0, 0, 0, 0.7);
				transform: scale(1.05);
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}

	.slideshow-dots {
		position: absolute;
		bottom: var(--spacing-md);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: var(--spacing-xs);
		z-index: 5;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--border-radius-full);
		background: rgba(255, 255, 255, 0.5);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

		&.active {
			background: white;
			transform: scale(1.2);
		}

		&:hover {
			background: rgba(255, 255, 255, 0.8);
		}
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);

		@include mobile {
			margin-left: var(--spacing-sm);
		}
	}

	.nutrition-facts {
		margin: var(--spacing-md) 0;
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
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
		border-radius: 50%;
		background: var(--color-neutral-dark);
		border: 2px solid var(--color-primary);

		width: 48px;
		height: 48px;
		margin-bottom: var(--spacing-xs);
		border-width: 1.5px;
	}

	.value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);

		@include mobile {
			font-size: var(--font-size-sm);
		}
	}

	.label {
		display: block;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
		margin-top: var(--spacing-xs);
		letter-spacing: 0.5px;

		@include mobile {
			font-size: calc(var(--font-size-xs) * 0.9);
			margin-top: calc(var(--spacing-xs) / 2);
			letter-spacing: 0.3px;
		}
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		font-style: italic;

		@include mobile {
			font-size: calc(var(--font-size-xs) * 0.9);
			margin-top: var(--spacing-xs);
		}
	}

	.debug {
		margin: var(--spacing-md) 0;
		padding: var(--spacing-md);
		background: rgba(0, 0, 0, 0.5);
		border-radius: var(--border-radius-md);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		white-space: pre-wrap;
	}
</style>
