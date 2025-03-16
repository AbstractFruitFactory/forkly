<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData, Ingredient } from '$lib/types'
	import { dietColors } from '$lib/types'
	import { page } from '$app/state'
	import Pill from '$lib/components/pill/Pill.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import BookmarkButton from '$lib/components/bookmark-button/BookmarkButton.svelte'
	import DislikeButton from '$lib/components/dislike-button/DislikeButton.svelte'
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'
	import ArrowRight from 'lucide-svelte/icons/arrow-right'
	import CommentList from '$lib/components/comment/CommentList.svelte'

	let {
		recipe,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark,
		getFormattedIngredient,
		onBackClick,
		comments = [],
		onAddComment
	}: {
		recipe: RecipeData
		nutrition: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		onDislike?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBookmark?: () => void
		getFormattedIngredient: (ingredient: Ingredient, unitSystem: UnitSystem) => any
		onBackClick?: () => void
		comments?: {
			id: string
			content: string
			createdAt: string | Date
			user: {
				id: string
				username: string
				avatarUrl: string | null
			}
		}[]
		onAddComment?: (content: string) => Promise<void>
	} = $props()

	let activeTab = $state('overview')
	let currentStep = $state(0)
	let stepsContainer: HTMLElement | null = null
	let showActions = $state(true)

	// Default implementation for onAddComment if not provided
	const handleAddComment = async (content: string) => {
		if (onAddComment) {
			return onAddComment(content)
		}
		return Promise.resolve()
	}

	function goToStep(index: number) {
		if (index >= 0 && index < recipe.instructions.length) {
			currentStep = index
			const stepElement = document.getElementById(`instruction-step-${index}`)
			if (stepElement && stepsContainer) {
				stepsContainer.scrollTo({
					left: stepElement.offsetLeft,
					behavior: 'smooth'
				})
			}
		}
	}

	function handleScroll(e: Event) {
		if (stepsContainer) {
			// Use requestAnimationFrame to avoid excessive calculations during scroll
			requestAnimationFrame(() => {
				if (stepsContainer) {
					const containerWidth = stepsContainer.clientWidth
					const scrollPosition = stepsContainer.scrollLeft
					const newStep = Math.round(scrollPosition / containerWidth)

					if (newStep !== currentStep && newStep >= 0 && newStep < recipe.instructions.length) {
						currentStep = newStep
					}
				}
			})
		}
	}
</script>

<div class="mobile-view">
	<div class="tabs">
		<button
			class="tab-button"
			class:active={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>
			Overview
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'ingredients'}
			onclick={() => (activeTab = 'ingredients')}
		>
			Ingredients
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'instructions'}
			onclick={() => (activeTab = 'instructions')}
		>
			Instructions
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'comments'}
			onclick={() => (activeTab = 'comments')}
		>
			Comments
		</button>
	</div>

	<div class="tab-content" class:allow-scroll={activeTab === 'instructions'}>
		{#if activeTab === 'overview'}
			<div class="overview-content">
				{#if recipe.imageUrl}
					<div class="recipe-image">
						<img src={recipe.imageUrl} alt={recipe.title} />
						<button class="back-button" onclick={onBackClick} aria-label="Back to home">
							<ArrowLeft size={20} />
						</button>
						{#if recipe.diets && recipe.diets.length > 0}
							<div class="diet-pills-overlay">
								{#each recipe.diets as diet}
									<Pill text={diet} color={dietColors[diet]} />
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				<div class="recipe-details">
					<h2 class="recipe-title">{recipe.title}</h2>

					{#if recipe.description}
						<p class="description">{recipe.description}</p>
					{/if}
				</div>
			</div>
		{:else if activeTab === 'ingredients'}
			<div class="ingredients-content">
				<div class="unit-toggle-container">
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				</div>
				<ul class="ingredients-list">
					{#each recipe.ingredients as ingredient}
						{@const formattedIngredient = getFormattedIngredient(ingredient, unitSystem)}
						<li>
							<span class="measurement">
								{#if ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch'}
									{ingredient.measurement}
								{:else}
									{formattedIngredient.formattedMeasurement}
								{/if}
							</span>
							<span class="ingredient-name">
								{ingredient.name}
								{#if ingredient.custom}
									<span class="custom-badge">custom</span>
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		{:else if activeTab === 'comments'}
			<div class="comments-content">
				<CommentList {comments} {isLoggedIn} onAddComment={handleAddComment} />
			</div>
		{:else}
			<div class="instructions-content">
				<div class="steps-container" bind:this={stepsContainer} onscroll={handleScroll}>
					{#each recipe.instructions as instruction, i}
						<div class="instruction-step" id="instruction-step-{i}">
							{#if instruction.mediaUrl}
								<div class="recipe-image">
									{#if instruction.mediaType === 'image'}
										<img
											src={instruction.mediaUrl}
											alt={`Step ${i + 1} visual`}
											loading="lazy"
											decoding="async"
										/>
									{:else if instruction.mediaType === 'video'}
										<video src={instruction.mediaUrl} controls muted></video>
									{/if}
								</div>
							{/if}
							<div class="instruction-text">
								{#each parseTemperature(instruction.text) as part}
									{#if part.isTemperature}
										<span class="temperature-wrapper">
											<Popover triggerOn="hover" placement="top">
												{#snippet trigger()}
													<span class="temperature">{part.text}</span>
												{/snippet}

												{#snippet content()}
													<span class="conversion"
														>{getConversionText(
															part.value as number,
															part.unit as TemperatureUnit
														)}</span
													>
												{/snippet}
											</Popover>
										</span>
									{:else}
										<span>{part.text}</span>
									{/if}
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Instructions Navigation Dots -->
				<div class="fixed-navigation-footer">
					<div class="nav-button-container">
						{#if currentStep > 0}
							<button
								class="nav-button prev"
								onclick={() => goToStep(currentStep - 1)}
								aria-label="Previous step"
							>
								<ArrowLeft />
							</button>
						{:else}
							<div class="nav-button-placeholder"></div>
						{/if}
					</div>

					<div class="mobile-nav-dots">
						{#each recipe.instructions as _, i}
							<button
								class="nav-dot"
								class:active={currentStep === i}
								onclick={() => goToStep(i)}
								aria-label={`Go to Step ${i + 1}`}
							></button>
						{/each}
					</div>

					<div class="nav-button-container">
						{#if currentStep < recipe.instructions.length - 1}
							<button
								class="nav-button next"
								onclick={() => goToStep(currentStep + 1)}
								aria-label="Next step"
							>
								<ArrowRight />
							</button>
						{:else}
							<div class="nav-button-placeholder"></div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if activeTab === 'overview' && showActions}
		<div class="floating-actions">
			<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />
			{#if isLoggedIn}
				<DislikeButton isDisliked={recipe.isDisliked} interactive={!!onDislike} {onDislike} />
				<LikeButton count={recipe.likes} isLiked={recipe.isLiked} interactive={!!onLike} {onLike} />
				<BookmarkButton
					count={recipe.bookmarks}
					isBookmarked={recipe.isBookmarked}
					interactive={!!onBookmark}
					{onBookmark}
				/>
			{:else}
				<Popover type="warning">
					{#snippet trigger()}
						<DislikeButton isDisliked={recipe.isDisliked} interactive={false} />
					{/snippet}
					{#snippet content()}
						Login to dislike recipes!
					{/snippet}
				</Popover>
				<Popover type="warning">
					{#snippet trigger()}
						<LikeButton count={recipe.likes} isLiked={recipe.isLiked} interactive={false} />
					{/snippet}
					{#snippet content()}
						Login to like recipes!
					{/snippet}
				</Popover>
				<Popover type="warning">
					{#snippet trigger()}
						<BookmarkButton
							count={recipe.bookmarks}
							isBookmarked={recipe.isBookmarked}
							interactive={false}
						/>
					{/snippet}
					{#snippet content()}
						Login to bookmark recipes!
					{/snippet}
				</Popover>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.mobile-view {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-drawer);
		background-color: var(--color-neutral-darkest);
		overflow: hidden;

		@include mobile {
			display: flex;
			flex-direction: column;
		}
	}

	.back-button {
		position: absolute;
		top: 16px;
		left: 16px;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: background-color 0.2s ease;

		&:hover {
			background-color: rgba(0, 0, 0, 0.8);
		}
	}

	.tabs {
		display: flex;
		justify-content: space-between;
		background-color: var(--color-neutral-dark);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-button {
		flex: 1;
		padding: var(--spacing-md);
		background: none;
		border: none;
		color: var(--color-neutral-light);
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;

		&:after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 3px;
			background-color: var(--color-primary);
			transform: scaleX(0);
			transition: transform 0.2s ease;
		}

		&.active {
			color: var(--color-primary);

			&:after {
				transform: scaleX(1);
			}
		}

		&:hover {
			color: var(--color-primary-light);
		}
	}

	.tab-content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		position: relative;
		background: var(--color-background);

		&.allow-scroll {
			overflow: hidden;
		}
	}

	.overview-content {
		display: flex;
		flex-direction: column;
		padding: 0;
		overflow: hidden;
	}

	.recipe-details {
		padding: var(--spacing-md) var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.recipe-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		margin: 0;
		color: var(--color-neutral-lightest);
		line-height: 1.2;
	}

	.ingredients-content {
		padding: var(--spacing-md);
		overflow: hidden;

		.unit-toggle-container {
			margin-bottom: var(--spacing-md);
			display: flex;
			justify-content: flex-end;
		}
	}

	.comments-content {
		padding: 0;
		overflow-y: auto;
		height: 100%;
		background-color: var(--color-neutral-darkest);
	}

	.instructions-content {
		position: relative;
		height: calc(100vh - 126px); /* Account for tabs (56px) and navigation footer (70px) */
		overflow: hidden;
		padding-bottom: 70px; /* Space for the navigation footer */
		background-color: var(--color-neutral-darkest);
	}

	.steps-container {
		display: flex;
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
		scroll-behavior: smooth;
		gap: 0; /* Ensure no gap between steps */

		&::-webkit-scrollbar {
			display: none; /* Chrome, Safari and Opera */
		}
	}

	.instruction-step {
		flex: 0 0 100%;
		width: 100vw;
		min-width: 100vw;
		max-width: 100vw;
		height: 100%;
		padding: var(--spacing-md);
		scroll-snap-align: center;
		scroll-snap-stop: always;
		overflow-y: auto;
		overflow-x: hidden;
		box-sizing: border-box;
		background-color: var(--color-neutral-darkest);
		isolation: isolate; /* Create a new stacking context */

		.recipe-image {
			margin-top: 0;
			margin-bottom: var(--spacing-lg);
		}
	}

	.recipe-image {
		width: 100%;
		height: 280px;
		position: relative;
		overflow: hidden;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 150px;
			background: linear-gradient(
				to top, 
				var(--color-background) 0%,
				color-mix(in srgb, var(--color-background) 90%, transparent) 20%, 
				color-mix(in srgb, var(--color-background) 70%, transparent) 40%,
				color-mix(in srgb, var(--color-background) 40%, transparent) 70%, 
				transparent 100%
			);
			pointer-events: none;
		}
	}

	.diet-pills-overlay {
		position: absolute;
		bottom: var(--spacing-md);
		left: 0;
		right: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		justify-content: center;
		z-index: 5;
		padding: 0 var(--spacing-md);

		:global(.pill) {
			margin: 0;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		}
	}

	.description {
		font-size: var(--font-size-md);
		line-height: 1.6;
		color: var(--color-neutral-light);
		margin: 0;
	}

	.instruction-text {
		@include mobile {
			font-size: var(--font-size-sm);
			line-height: 1.5;
			color: var(--color-neutral-lightest);
			flex: 1;
			overflow-y: auto;
			margin-top: var(--spacing-md);
		}
	}

	.nutrition-item .value {
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-lightest);

		@include mobile {
			font-size: var(--font-size-md);
		}
	}

	.nutrition-item .label {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
		text-transform: uppercase;
		letter-spacing: 0.5px;

		@include mobile {
			font-size: 0.7rem;
			margin-top: var(--spacing-xs);
		}
	}

	// Recipe actions
	.recipe-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
	}

	// Recipe tags
	.recipe-tags {
		margin: var(--spacing-sm) 0 var(--spacing-md);
		width: 100%;

		@include mobile {
			flex-shrink: 0;
		}

		.tags {
			@include mobile {
				display: flex;
				flex-wrap: wrap;
				gap: var(--spacing-sm);
				justify-content: center;
				align-items: center;

				:global(.pill) {
					margin: 0;
				}
			}
		}
	}

	// Nutrition facts
	.nutrition-facts {
		margin-top: var(--spacing-md);
		width: 100%;

		@include mobile {
			flex-shrink: 0;
		}
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);

		@include mobile {
			margin-top: var(--spacing-sm);
			gap: var(--spacing-sm);
			background-color: rgba(0, 0, 0, 0.2);
			padding: var(--spacing-md);
			border-radius: var(--border-radius-md);
			width: 100%;
		}
	}

	.nutrition-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.nutrition-circle {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: var(--color-primary-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--spacing-xs);

		@include mobile {
			width: 60px;
			height: 60px;
			background-color: var(--color-neutral-darkest);
		}
	}

	.ingredients-list {
		width: 100%;
		padding: 0;
		margin: 0;
		list-style-type: none;

		@include mobile {
			li {
				display: flex;
				padding: var(--spacing-sm) 0;
				font-size: var(--font-size-md);
				border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			}

			.measurement {
				min-width: 80px;
				color: var(--color-primary-light);
				font-weight: var(--font-weight-bold);
				margin-right: var(--spacing-sm);
			}

			.ingredient-name {
				font-weight: var(--font-weight-medium);
				color: var(--color-neutral-lightest);
				flex: 1;
				text-align: right;
			}
		}
	}

	.progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 3px;
		background-color: var(--color-primary);
		transition: width 0.3s ease;
		z-index: 10;

		@include mobile {
			height: 4px;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		}
	}

	.overview-card,
	.ingredients-card,
	.instruction-card {
		@include mobile {
			display: flex;
			flex-direction: column;
			height: 100%;
			background-color: var(--color-neutral-dark);
			border-radius: 0;
			margin: 0;
			overflow: hidden;

			.card-content {
				overflow-y: auto;
				-webkit-overflow-scrolling: touch;
				flex: 1;
				min-height: 0;
				padding: var(--spacing-md);
			}
		}
	}

	.overview-card {
		@include mobile {
			.card-content {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
		}
	}

	.ingredients-card {
		@include mobile {
			.card-content {
				padding: var(--spacing-md) var(--spacing-md) 80px var(--spacing-md);
			}
		}
	}

	// Utility Classes
	.custom-badge {
		font-size: var(--font-size-xs);
		background: var(--color-primary-light);
		color: var(--color-neutral-darkest);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		margin-left: var(--spacing-sm);
		vertical-align: middle;
		font-weight: var(--font-weight-semibold);
	}

	.temperature {
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
		display: inline;
	}

	.conversion {
		font-size: var(--font-size-sm);
		white-space: nowrap;
		display: inline;
	}

	.temperature-wrapper {
		display: inline;
	}

	.fixed-navigation-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-neutral-dark);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		z-index: 20;
		height: 70px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
	}

	.nav-button-container {
		width: 60px;
		display: flex;
		justify-content: flex-start;

		&:last-child {
			justify-content: flex-end;
		}
	}

	.nav-button-placeholder {
		width: 40px;
		height: 40px;
	}

	.nav-button {
		background-color: var(--color-primary-dark);
		color: var(--color-neutral-lightest);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: background-color 0.2s ease;
		z-index: 21;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;

		&:hover {
			background-color: var(--color-primary-light);
		}

		@include mobile {
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
			font-weight: var(--font-weight-bold);
		}
	}

	.mobile-nav-dots {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xs);
		margin: 0;
		padding: 6px 10px;
		background-color: rgba(0, 0, 0, 0.6);
		border-radius: 20px;
		width: fit-content;
		box-shadow: var(--shadow-sm);
		z-index: 20;
	}

	.nav-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-neutral);
		border: none;
		padding: 0;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.2s ease;

		&.active {
			background-color: var(--color-primary);
			transform: scale(1.3);
		}

		margin: 0 2px;
	}

	.floating-actions {
		position: fixed;
		bottom: 20px;
		display: flex;
		gap: var(--spacing-md);
		background-color: var(--color-neutral-dark);
		padding: 10px 16px;
		border-radius: 50px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 30;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		width: fit-content;
	}

	.diet-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		margin: var(--spacing-sm) 0 var(--spacing-md);
		justify-content: center;

		:global(.pill) {
			margin: 0;
		}
	}
</style>
