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

	// Active tab state
	let activeTab = $state<'ingredients' | 'instructions' | 'comments'>('ingredients')

	// Track expanded instruction steps
	let expandedInstructions = $state<number[]>([])

	// Mock data for recipe metadata
	const cookTime = '30 Min'
	const difficulty = 'Medium'
	const servings = '2-3 Cal'

	function switchTab(tab: 'ingredients' | 'instructions' | 'comments') {
		activeTab = tab
	}

	function toggleInstruction(index: number) {
		if (expandedInstructions.includes(index)) {
			expandedInstructions = expandedInstructions.filter((i) => i !== index)
		} else {
			expandedInstructions = [...expandedInstructions, index]
		}
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

	<div class="background-box"></div>

	<div class="draggable-sheet" style="transform: translateY({sheetY.current}px)">
		<div
			class="drag-handle"
			bind:this={dragHandleElement}
			ontouchstart={handleDragHandleTouchStart}
		>
			<div class="handle-bar"></div>
		</div>

		<div
			class="recipe-content"
			style:--sheet-position="{sheetY.current}px"
			ontouchstart={handleContentTouchStart}
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

			<div class="tabs">
				<button
					class="tab-button"
					class:active={activeTab === 'ingredients'}
					onclick={() => switchTab('ingredients')}
				>
					<svelte:component this={Apple} class="tab-icon" size={18} />
					Ingredients
				</button>
				<button
					class="tab-button"
					class:active={activeTab === 'instructions'}
					onclick={() => switchTab('instructions')}
				>
					<svelte:component this={FileText} class="tab-icon" size={18} />
					Instructions
				</button>
				<button
					class="tab-button"
					class:active={activeTab === 'comments'}
					onclick={() => switchTab('comments')}
				>
					<svelte:component this={MessageSquare} class="tab-icon" size={18} />
					Comments
				</button>
			</div>

			<div class="tab-content">
				{#if activeTab === 'ingredients'}
					<IngredientsList ingredients={recipe.ingredients} {unitSystem} {getFormattedIngredient} />
				{:else if activeTab === 'instructions'}
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
				{:else if activeTab === 'comments'}
					<CommentList {comments} {isLoggedIn} recipeId={recipe.id} {formError} />
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.recipe-mobile-view {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: var(--color-background);
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
		height: 40vh;
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
		top: 33vh;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		height: 50%;
		background: var(--color-neutral);
		z-index: 1;
		border-radius: var(--border-radius-xl);
	}

	.draggable-sheet {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
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
		padding: 0 var(--spacing-lg) var(--spacing-lg);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		touch-action: pan-y;
		max-height: calc(100vh - var(--sheet-position) - 52px);
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

	.tabs {
		display: flex;
		margin-bottom: var(--spacing-lg);

		border-radius: var(--border-radius-xl);
		padding: var(--spacing-xs);
	}

	.tab-button {
		flex: 1;
		background: none;
		border: none;
		padding: var(--spacing-sm) 0;
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
		cursor: pointer;
		position: relative;
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		font-weight: var(--font-weight-medium);
	}

	.tab-button:hover {
		color: white;
	}

	.tab-button.active {
		color: var(--color-primary);
		background-color: var(--color-background);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.tab-content {
		padding: var(--spacing-md) 0;
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
</style>
