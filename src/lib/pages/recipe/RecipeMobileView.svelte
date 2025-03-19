<script lang="ts">
	import type { RecipeData } from '$lib/types'
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { Spring } from 'svelte/motion'
	import { onMount } from 'svelte'
	import Apple from 'lucide-svelte/icons/apple'
	import FileText from 'lucide-svelte/icons/file-text'
	import MessageSquare from 'lucide-svelte/icons/message-square'
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

	// Sheet drag state
	let sheetY = new Spring(0, {
		stiffness: 0.25,
		damping: 0.6
	})
	let startY: number
	let startSheetY: number
	let isDragging = false
	let windowHeight: number
	let dragHandleElement: HTMLDivElement

	// Section references for scrolling
	let ingredientsSection: HTMLElement
	let instructionsSection: HTMLElement
	let commentsSection: HTMLElement
	let recipeContent: HTMLElement

	// Track expanded instruction steps
	let expandedInstructions = $state<number[]>([])

	// Cooking mode state
	let isCookingMode = $state(false)
	let currentStep = $state(0)

	// Mock data for recipe metadata
	const cookTime = '30 Min'
	const difficulty = 'Medium'
	const servings = '2-3 Cal'

	// Transform recipe instructions with media into format for MediaPlayer
	const instructionMedia = $state<
		Array<{ type: 'image' | 'video'; url: string; duration?: number }>
	>(
		recipe.instructions
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
	)

	function scrollToSection(section: HTMLElement) {
		if (section && recipeContent) {
			// Calculate the position to scroll to
			// Subtract some extra pixels to position the header below the nav
			const navHeight = 70; // Approximate height of the sticky nav
			const topPosition = section.offsetTop - navHeight;
			
			recipeContent.scrollTo({
				top: topPosition,
				behavior: 'smooth'
			});
		}
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

	function nextStep(e: Event) {
		e.preventDefault()
		if (currentStep < recipe.instructions.length - 1) {
			currentStep++
		}
	}

	function prevStep(e: Event) {
		e.preventDefault()
		if (currentStep > 0) {
			currentStep--
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

	onMount(() => {
		windowHeight = window.innerHeight
		sheetY.set(windowHeight * 0.35)

		// Add document-level touch event listeners
		document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false })
		document.addEventListener('touchend', handleTouchEnd)

		return () => {
			document.removeEventListener('touchmove', handleDocumentTouchMove)
			document.removeEventListener('touchend', handleTouchEnd)
		}
	})

	function handleDragHandleTouchStart(e: TouchEvent) {
		isDragging = true
		startY = e.touches[0].clientY
		startSheetY = sheetY.current
		e.stopPropagation()
	}

	function handleDocumentTouchMove(e: TouchEvent) {
		if (!isDragging) return

		// Prevent scrolling when dragging
		e.preventDefault()

		const currentY = e.touches[0].clientY
		const deltaY = currentY - startY
		const newY = Math.max(70, Math.min(windowHeight - 60, startSheetY + deltaY))

		sheetY.set(newY)
	}

	function handleTouchEnd() {
		if (!isDragging) return

		isDragging = false

		// Calculate the threshold for snapping based on the current position
		const topPosition = 70
		const middlePosition = windowHeight * 0.35
		const bottomPosition = windowHeight - 60

		// Determine which position to snap to based on drag direction and velocity
		const currentPosition = sheetY.current
		const dragDistance = currentPosition - startSheetY

		// If dragged up significantly, snap to the next position up
		if (dragDistance < -20) {
			if (currentPosition < middlePosition) {
				sheetY.set(topPosition)
			} else {
				sheetY.set(middlePosition)
			}
		}
		// If dragged down significantly, snap to the next position down
		else if (dragDistance > 20) {
			if (currentPosition > middlePosition) {
				sheetY.set(bottomPosition)
			} else {
				sheetY.set(middlePosition)
			}
		}
		// For small movements, snap to the closest position
		else {
			const distanceToTop = Math.abs(currentPosition - topPosition)
			const distanceToMiddle = Math.abs(currentPosition - middlePosition)
			const distanceToBottom = Math.abs(currentPosition - bottomPosition)

			if (distanceToTop <= distanceToMiddle && distanceToTop <= distanceToBottom) {
				sheetY.set(topPosition)
			} else if (distanceToMiddle <= distanceToTop && distanceToMiddle <= distanceToBottom) {
				sheetY.set(middlePosition)
			} else {
				sheetY.set(bottomPosition)
			}
		}
	}

	// Add this function to handle touch events in the content area
	function handleContentTouchStart(e: TouchEvent) {
		// Don't start dragging when touching the content area
		e.stopPropagation()
	}
</script>

<div class="recipe-mobile-view" data-page="recipe">
	<button class="back-button" onclick={onBackClick}>
		<svg width="24" height="24" viewBox="0 0 24 24">
			<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
		</svg>
	</button>

	<div class="recipe-image">
		<img src={recipe.imageUrl} alt={recipe.title} />

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
	</div>

	<div class="background-box">
		<div class="start-cooking-wrapper">
			<Button variant="primary" size="lg" onclick={() => startCookingMode()}>Start Cooking</Button>
		</div>
		{#if instructionMedia.length > 0}
			<MediaPlayer {instructionMedia} />
		{:else}
			<div class="no-media">No media available</div>
		{/if}
	</div>

	<div class="draggable-sheet" style="transform: translateY({sheetY.current}px)">
		<div
			class="drag-handle"
			bind:this={dragHandleElement}
			ontouchstart={handleDragHandleTouchStart}
		>
			<div class="handle-bar"></div>
		</div>

		<div class="sticky-nav">
			<button class="nav-button" onclick={() => scrollToSection(ingredientsSection)}>
				<svelte:component this={Apple} class="nav-icon" size={14} />
				<span>Ingredients</span>
			</button>
			<button class="nav-button" onclick={() => scrollToSection(instructionsSection)}>
				<svelte:component this={FileText} class="nav-icon" size={14} />
				<span>Instructions</span>
			</button>
			<button class="nav-button" onclick={() => scrollToSection(commentsSection)}>
				<svelte:component this={MessageSquare} class="nav-icon" size={14} />
				<span>Comments</span>
			</button>
		</div>

		<div
			class="recipe-content"
			style:--sheet-position="{sheetY.current}px"
			ontouchstart={handleContentTouchStart}
			bind:this={recipeContent}
		>
			<h3>{recipe.title}</h3>
			<p class="description">{recipe.description}</p>

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

			<div class="chef-info">
				<div class="chef-avatar">
					<ProfilePic profilePicUrl={chef.avatar} size="40px" />
				</div>
				<div class="chef-details">
					<div class="chef-name">{chef.name}</div>
					<div class="chef-title">{chef.title}</div>
				</div>
				<button class="follow-button">+ Follow</button>
			</div>

			<div class="section-container">
				<section class="content-section" bind:this={ingredientsSection}>
					<h4 class="section-title">Ingredients</h4>
					<IngredientsList ingredients={recipe.ingredients} {unitSystem} {getFormattedIngredient} />
				</section>

				<section class="content-section" bind:this={instructionsSection}>
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

				<section class="content-section" bind:this={commentsSection}>
					<h4 class="section-title">Comments</h4>
					<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
				</section>
			</div>
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
							controls
							autoplay
							muted
							class="cooking-media-content"
						></video>
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
			overflow: hidden;
			background: var(--color-background);
		}
	}

	.back-button {
		position: fixed;
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
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 40dvh;
		background: var(--color-neutral-dark);
	}

	.recipe-image::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 20%;
		background: linear-gradient(to bottom, rgba(11, 25, 44, 0), var(--color-background));
		pointer-events: none;
	}

	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.background-box {
		position: absolute;
		top: 33dvh;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		height: 50%;
		background: white;
		z-index: 1;
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-lg);
	}

	.no-media {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--color-neutral);
		font-style: italic;
	}

	.draggable-sheet {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-3xl) var(--border-radius-3xl) 0 0;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		z-index: 2;
	}

	.drag-handle {
		width: 100%;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--spacing-md) 0;
		cursor: grab;
		touch-action: none;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.handle-bar {
		width: 40px;
		height: 4px;
		background: var(--color-neutral);
		border-radius: var(--border-radius-full);
	}

	.recipe-content {
		padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		touch-action: pan-y;
		max-height: calc(100dvh - var(--sheet-position) - 100px);
	}

	.description {
		font-size: var(--font-size-md);
		color: var(--color-neutral);
		line-height: 1.5;
		margin: 0 0 var(--spacing-md) 0;
	}

	.recipe-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md) 0;
		border-bottom: 1px solid var(--color-neutral-dark);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.meta-value {
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-light);
		margin-bottom: var(--spacing-xs);
	}

	.meta-label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
	}

	.chef-info {
		display: flex;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-neutral-dark);
	}

	.chef-avatar {
		width: 40px;
		height: 40px;
		border-radius: var(--border-radius-full);
		overflow: hidden;
		margin-right: var(--spacing-md);
	}

	.chef-details {
		flex: 1;
	}

	.chef-name {
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-light);
	}

	.chef-title {
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
	}

	.follow-button {
		background: transparent;
		border: 1px solid var(--color-primary);
		color: var(--color-primary);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-xs) var(--spacing-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
	}

	.follow-button:hover {
		background: var(--color-primary);
		color: white;
	}

	.sticky-nav {
		display: flex;
		position: sticky;
		top: 0;
		background: var(--color-background);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xs) var(--spacing-sm);
		z-index: 10;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		margin: 0 var(--spacing-md) var(--spacing-sm);
	}

	.nav-button {
		flex: 1;
		background: none;
		border: none;
		padding: var(--spacing-xs) var(--spacing-xs);
		color: var(--color-neutral-light);
		font-size: var(--font-size-xs);
		cursor: pointer;
		position: relative;
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		justify-content: center;
		gap: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		font-weight: var(--font-weight-medium);
	}

	.nav-icon {
		flex-shrink: 0;
	}

	.nav-button:hover {
		color: white;
	}

	.nav-button:active {
		color: var(--color-primary);
		background-color: var(--color-background);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.section-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.content-section {
		padding: var(--spacing-md) 0;
		scroll-margin-top: 60px;
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
		color: var(--color-neutral-light);
		border-bottom: 1px solid var(--color-neutral-dark);
		padding-bottom: var(--spacing-xs);
	}

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.action-buttons {
		position: absolute;
		top: 16px;
		right: 16px;
		display: flex;
		gap: 8px;
		z-index: var(--z-elevated);
	}

	.start-cooking-wrapper {
		position: absolute;
		bottom: var(--spacing-md);
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		z-index: 3;
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
</style>
