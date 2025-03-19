<script lang="ts">
	import type { RecipeData } from '$lib/types'
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { onMount } from 'svelte'
	import Apple from 'lucide-svelte/icons/apple'
	import FileText from 'lucide-svelte/icons/file-text'
	import MessageSquare from 'lucide-svelte/icons/message-square'
	import Play from 'lucide-svelte/icons/play'
	import ChevronLeft from 'lucide-svelte/icons/chevron-left'
	import ChevronRight from 'lucide-svelte/icons/chevron-right'
	import type { getFormattedIngredient as GetFormattedIngredient } from './utils/recipeUtils'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import CommentList from '$lib/components/comment/CommentList.svelte'
	import InstructionAccordion from '$lib/components/accordion/InstructionAccordion.svelte'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import DislikeButton from '$lib/components/dislike-button/DislikeButton.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import BookmarkButton from '$lib/components/bookmark-button/BookmarkButton.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import MediaPlayer from '$lib/components/media-player/MediaPlayer.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import { page } from '$app/state'

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

	// Video player and slideshow state
	let videoPlayerVisible = $state(false)
	let currentSlideIndex = $state(0)

	// Mock data for recipe metadata
	const cookTime = '30 Min'
	const difficulty = 'Medium'
	const servings = '2-3 Cal'

	// Transform recipe instructions with media into format for MediaPlayer
	const instructionMedia = $state<
		Array<{ type: 'image' | 'video'; url: string; duration?: number }>
	>([
		// Add main recipe image as first slide if it exists
		...(recipe.imageUrl ? [{ type: 'image' as const, url: recipe.imageUrl }] : []),
		// Then add instruction media
		...recipe.instructions
			.filter(
				(
					instruction
				): instruction is typeof instruction & { mediaUrl: string; mediaType: 'image' | 'video' } =>
					!!instruction.mediaUrl &&
					!!instruction.mediaType &&
					(instruction.mediaType === 'image' || instruction.mediaType === 'video')
			)
			.map((instruction) => ({
				type: instruction.mediaType,
				url: instruction.mediaUrl,
				duration: 3000 // Default duration
			}))
	])

	// Check if we only have images (including main recipe image)
	const hasOnlyImages = $derived(instructionMedia.every((media) => media.type === 'image'))
	const hasVideos = $derived(instructionMedia.some((media) => media.type === 'video'))

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

	function toggleVideoPlayer() {
		videoPlayerVisible = !videoPlayerVisible
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

	function nextSlide() {
		if (currentSlideIndex < instructionMedia.length - 1) {
			currentSlideIndex = currentSlideIndex + 1
		}
	}

	function prevSlide() {
		if (currentSlideIndex > 0) {
			currentSlideIndex = currentSlideIndex - 1
		}
	}
</script>

<div class="recipe-mobile-view" data-page="recipe">
	<button class="back-button" onclick={onBackClick}>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
		</svg>
	</button>

	<div class="recipe-image">
		{#if hasOnlyImages}
			<div class="slideshow-container">
				<div class="slides-wrapper" style="transform: translateX(-{currentSlideIndex * 100}%)">
					{#each instructionMedia as media}
						<div class="slide">
							<img src={media.url} alt={recipe.title} />
						</div>
					{/each}
				</div>
			</div>
			{#if instructionMedia.length > 1}
				<div class="slideshow-controls">
					<button
						class="slideshow-button prev"
						onclick={prevSlide}
						disabled={currentSlideIndex === 0}
					>
						<svelte:component this={ChevronLeft} size={24} color="white" />
					</button>
					<button
						class="slideshow-button next"
						onclick={nextSlide}
						disabled={currentSlideIndex === instructionMedia.length - 1}
					>
						<svelte:component this={ChevronRight} size={24} color="white" />
					</button>
				</div>
				<div class="slideshow-dots">
					{#each instructionMedia as _, index}
						<button
							class="dot {currentSlideIndex === index ? 'active' : ''}"
							onclick={() => (currentSlideIndex = index)}
						></button>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="slideshow-container">
				{#if videoPlayerVisible}
					<div class="video-player-container">
						<button class="close-button" onclick={toggleVideoPlayer}>
							<svg width="24" height="24" viewBox="0 0 24 24">
								<path
									d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
								/>
							</svg>
						</button>
						<div class="video-player-content">
							<MediaPlayer {instructionMedia} />
						</div>
					</div>
				{:else}
					<div class="slide">
						<img src={instructionMedia[0].url} alt={recipe.title} />
					</div>
					{#if hasVideos}
						<button class="play-button" onclick={toggleVideoPlayer}>
							<svelte:component this={Play} size={28} color="white" />
						</button>
					{/if}
				{/if}
			</div>
		{/if}
	</div>

	<div class="content-container" bind:this={contentContainer}>
		<div class="sticky-nav">
			<button class="nav-button" onclick={() => scrollToSection(ingredientsSection)}>
				<svelte:component this={Apple} class="nav-icon" size={18} />
				<span>Ingredients</span>
			</button>
			<button class="nav-button" onclick={() => scrollToSection(instructionsSection)}>
				<svelte:component this={FileText} class="nav-icon" size={18} />
				<span>Instructions</span>
			</button>
			<button class="nav-button" onclick={() => scrollToSection(commentsSection)}>
				<svelte:component this={MessageSquare} class="nav-icon" size={18} />
				<span>Comments</span>
			</button>
		</div>

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

			<div class="recipe-meta">
				<div class="meta-item">
					<span class="meta-value">{cookTime}</span>
					<span class="meta-label">Cook Time</span>
				</div>
				<div class="meta-item">
					<span class="meta-value">{difficulty}</span>
					<span class="meta-label">Difficulty</span>
				</div>
				<div class="meta-item">
					<span class="meta-value">{servings}</span>
					<span class="meta-label">Servings</span>
				</div>
			</div>

			<div class="start-cooking-wrapper">
				<Button variant="primary" size="md" onclick={() => startCookingMode()}>Start Cooking</Button
				>
			</div>

			<div class="section-container">
				<section class="content-section" bind:this={ingredientsSection} id="ingredients-section">
					<h4 class="section-title">Ingredients</h4>
					<IngredientsList ingredients={recipe.ingredients} {unitSystem} {getFormattedIngredient} />
				</section>

				<section class="content-section" bind:this={instructionsSection} id="instructions-section">
					<h4 class="section-title">Instructions</h4>
					<div class="instructions-list">
						{#each recipe.instructions as instruction, i}
							<InstructionAccordion
								{instruction}
								index={i}
								isOpen={expandedInstructions.includes(i)}
								onToggle={toggleInstruction}
							/>
						{/each}
					</div>
				</section>

				<section class="content-section" bind:this={commentsSection} id="comments-section">
					<h4 class="section-title">Comments</h4>
					<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
				</section>
			</div>
		</div>
	</div>

	{#if isCookingMode}
		<div class="cooking-mode">
			<div class="cooking-header">
				<button class="cooking-close-button" onclick={exitCookingMode}>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path
							d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
						/>
					</svg>
				</button>
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
		top: 16px;
		left: 16px;
		z-index: var(--z-elevated);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.back-button svg {
		fill: white;
	}

	.recipe-image {
		position: relative;
		width: 100%;
		height: 40dvh;
		background: var(--color-neutral-dark);
		overflow: hidden;
	}

	.slideshow-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.slides-wrapper {
		display: flex;
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease-in-out;
	}

	.slide {
		flex: 0 0 100%;
		width: 100%;
		height: 100%;
	}

	.slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.play-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.3);
		border: none;
		border-radius: var(--border-radius-full);
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		z-index: 5;
		transition: all var(--transition-fast) var(--ease-in-out);
	}

	.play-button:hover {
		background: rgba(0, 0, 0, 0.5);
		transform: translate(-50%, -50%) scale(1.05);
	}

	.play-button:active {
		transform: translate(-50%, -50%) scale(0.95);
	}

	.content-container {
		position: relative;
		width: 100%;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-3xl) var(--border-radius-3xl) 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		margin-top: -25px;
		padding-bottom: 100px;
	}

	.recipe-content {
		padding: 0 var(--spacing-lg) var(--spacing-lg);
	}

	.recipe-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin: var(--spacing-lg) 0 var(--spacing-md);
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
		margin: var(--spacing-md) 0 var(--spacing-lg) 0;
		display: flex;
		justify-content: center;
	}

	.sticky-nav {
		display: flex;
		position: sticky;
		top: 0;
		background: var(--color-neutral-dark);
		border-radius: 0;
		padding: var(--spacing-md) 0;
		z-index: 10;
		box-shadow: none;
		margin: 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		justify-content: space-around;
	}

	.nav-button {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		font-weight: var(--font-weight-medium);
	}

	.nav-icon {
		flex-shrink: 0;
		margin-bottom: var(--spacing-xs);
	}

	.nav-button:hover {
		color: white;
	}

	.nav-button:active {
		color: var(--color-primary);
	}

	.section-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.content-section {
		padding: var(--spacing-md) 0;
		scroll-margin-top: 80px;
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
		color: white;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: var(--spacing-xs);
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
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.video-player-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-neutral-darker);
		z-index: 10;
	}

	.video-player-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 11;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}

		svg {
			fill: white;
			width: 20px;
			height: 20px;
		}
	}

	.cooking-mode {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		background: var(--color-background);
		z-index: 1000;
		display: flex;
		flex-direction: column;
	}

	.cooking-header {
		padding: var(--spacing-md);
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--color-neutral-dark);
		background: var(--color-neutral-dark);
	}

	.cooking-close-button {
		background: transparent;
		border: none;
		padding: var(--spacing-xs);
		margin-right: var(--spacing-md);
		cursor: pointer;
	}

	.cooking-close-button svg {
		fill: var(--color-neutral-light);
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
		height: 4px;
		background: var(--color-neutral);
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
</style>
