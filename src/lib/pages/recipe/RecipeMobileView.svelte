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

	let {
		recipe,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark,
		getFormattedIngredient
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
	} = $props()

	let currentCardIndex = $state(0)
	let touchStartX = $state(0)
	let touchEndX = $state(0)
	let cardContainer: HTMLDivElement | null = null

	const CARD_OVERVIEW = 0
	const CARD_INGREDIENTS = 1
	const CARD_INSTRUCTIONS_START = 2

	const totalCards = $derived(recipe.instructions ? recipe.instructions.length + 2 : 3)

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].clientX
		handleSwipe()
	}

	function handleSwipe() {
		const swipeThreshold = 50
		if (touchStartX - touchEndX > swipeThreshold) {
			// Swipe left - go to next card
			if (currentCardIndex < totalCards - 1) {
				currentCardIndex++
			}
		} else if (touchEndX - touchStartX > swipeThreshold) {
			// Swipe right - go to previous card
			if (currentCardIndex > 0) {
				currentCardIndex--
			}
		}
	}

	function goToCard(index: number) {
		if (index >= 0 && index < totalCards) {
			currentCardIndex = index
		}
	}
</script>

<div
	class="mobile-view"
	bind:this={cardContainer}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<div class="progress-bar" style:width={`${(currentCardIndex / (totalCards - 1)) * 100}%`}></div>

	<div class="card-container" style:transform={`translateX(-${currentCardIndex * 100}%)`}>
		<div class="recipe-card overview-card" class:active={currentCardIndex === CARD_OVERVIEW}>
			<div class="card-content">
				{#if recipe.imageUrl}
					<div class="recipe-image">
						<img src={recipe.imageUrl} alt={recipe.title} />
					</div>
				{/if}
				<h2>{recipe.title}</h2>

				{#if recipe.description}
					<p class="description">{recipe.description}</p>
				{/if}

				<div class="recipe-tags">
					{#if recipe.diets && recipe.diets.length > 0}
						<div class="tags">
							{#each recipe.diets as diet}
								<Pill text={diet} color={dietColors[diet]} />
							{/each}
						</div>
					{/if}
				</div>

				<div class="recipe-actions">
					<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />
					{#if isLoggedIn}
						<DislikeButton isDisliked={recipe.isDisliked} interactive={!!onDislike} {onDislike} />
						<LikeButton
							count={recipe.likes}
							isLiked={recipe.isLiked}
							interactive={!!onLike}
							{onLike}
						/>
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
			</div>
		</div>

		<div class="recipe-card ingredients-card" class:active={currentCardIndex === CARD_INGREDIENTS}>
			<div class="card-header">
				<h3>Ingredients</h3>
				<div class="unit-toggle-container">
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				</div>
			</div>
			<div class="card-content">
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
		</div>

		{#each recipe.instructions as instruction, i}
			<div
				class="recipe-card instruction-card"
				class:active={currentCardIndex === CARD_INSTRUCTIONS_START + i}
			>
				<div class="card-header">
					<h3>Step {i + 1}</h3>
				</div>
				<div class="card-content">
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
							{#if part.isTemperature && part.value !== undefined && part.unit}
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
			</div>
		{/each}
	</div>

	<!-- Fixed Navigation Footer -->
	<div class="fixed-navigation-footer">
		<div class="nav-button-container">
			{#if currentCardIndex > 0}
				<button
					class="nav-button prev"
					onclick={() =>
						goToCard(
							currentCardIndex === CARD_INGREDIENTS
								? CARD_OVERVIEW
								: currentCardIndex === CARD_INSTRUCTIONS_START
									? CARD_INGREDIENTS
									: CARD_INSTRUCTIONS_START + (currentCardIndex - CARD_INSTRUCTIONS_START - 1)
						)}
					aria-label={currentCardIndex === CARD_INGREDIENTS
						? 'Back to Overview'
						: currentCardIndex === CARD_INSTRUCTIONS_START
							? 'Back to Ingredients'
							: `Back to Step ${currentCardIndex - CARD_INSTRUCTIONS_START}`}
				>
					<ArrowLeft />
				</button>
			{:else}
				<div class="nav-button-placeholder"></div>
			{/if}
		</div>

		<!-- Mobile Navigation Dots -->
		<div class="mobile-nav-dots">
			{#each Array(totalCards) as _, i}
				<button
					class="nav-dot"
					class:active={currentCardIndex === i}
					onclick={() => goToCard(i)}
					aria-label={i === 0 ? 'Overview' : i === 1 ? 'Ingredients' : `Step ${i - 1}`}
				></button>
			{/each}
		</div>

		<div class="nav-button-container">
			{#if currentCardIndex < totalCards - 1}
				<button
					class="nav-button next"
					onclick={() => goToCard(currentCardIndex + 1)}
					aria-label={currentCardIndex === CARD_OVERVIEW
						? 'Go to Ingredients'
						: currentCardIndex === CARD_INGREDIENTS
							? 'Go to Instructions'
							: `Go to Step ${currentCardIndex - CARD_INSTRUCTIONS_START + 2}`}
				>
					<ArrowRight />
				</button>
			{:else}
				<div class="nav-button-placeholder"></div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.mobile-view {
		display: none;
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease;
		touch-action: pan-x;
		position: relative;

		@include mobile {
			display: flex;
			flex-direction: column;
			flex: 1;
			padding-top: 0;
			background-color: var(--color-neutral-darkest);
			height: 100%;
			min-height: 0;
			width: 100%;
		}
	}

	.card-container {
		display: flex;
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease;

		@include mobile {
			will-change: transform;
			min-width: 100%;
			flex-wrap: nowrap;
			flex: 1;
			padding-bottom: 0;
			padding: 0;
			display: flex;
			align-items: stretch;
			min-height: 0;
		}
	}

	.recipe-card {
		flex: 0 0 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: var(--spacing-md);
		box-sizing: border-box;
		position: relative;

		@include mobile {
			padding: 0;
			border-radius: 0;
			margin: 0;
			width: 100%;
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
		padding-bottom: var(--spacing-xs);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		width: 100%;

		@include mobile {
			margin: 0;
			padding: var(--spacing-sm) var(--spacing-md);
			flex-shrink: 0;
			background-color: var(--color-primary-dark);
			border-radius: 0;
			border-bottom: none;
		}

		h3 {
			@include mobile {
				color: var(--color-neutral-lightest);
				font-size: var(--font-size-lg);
				letter-spacing: 0.5px;
				margin: 0;

				&::after {
					display: none;
				}
			}
		}
	}

	.card-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--spacing-sm) 0;

		@include mobile {
			padding: var(--spacing-sm) var(--spacing-md);
			-webkit-overflow-scrolling: touch;
			scrollbar-width: thin;
			overflow-y: auto;
			flex: 1 1 auto;
			min-height: 0;
			display: flex;
			flex-direction: column;
			padding-bottom: 80px; /* Increase padding to account for fixed footer */

			&::-webkit-scrollbar {
				width: 4px;
			}

			&::-webkit-scrollbar-thumb {
				background-color: var(--color-primary);
				border-radius: 4px;
			}
		}
	}

	.fixed-navigation-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-neutral-darkest);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		z-index: 20;
		height: 70px;

		@include mobile {
			display: flex;
			padding: var(--spacing-md);
		}
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

	.recipe-image {
		aspect-ratio: 16 / 9;
		width: 100%;
		margin: 0 0 var(--spacing-md) 0;

		img {
			margin-top: -20px;
			margin-left: -20px;
			margin-right: -20px;
			width: calc(100% + 40px);
			object-fit: cover;
			object-position: center;
		}
	}

	h2 {
		@include mobile {
			font-size: 1.75rem;
			margin-top: var(--spacing-sm);
			margin-bottom: var(--spacing-md);
			color: var(--color-primary);
			text-align: center;
			font-weight: var(--font-weight-bold);
			flex-shrink: 0;
			width: 100%;
		}
	}

	h3 {
		@include mobile {
			font-size: 1.1rem;
			margin: 0;
		}
	}

	.description {
		@include mobile {
			font-size: var(--font-size-sm);
			margin-bottom: var(--spacing-md);
			line-height: 1.5;
			text-align: center;
			color: var(--color-neutral-lightest);
		}
	}

	.instruction-text {
		@include mobile {
			font-size: var(--font-size-sm);
			line-height: 1.5;
			color: var(--color-neutral-lightest);
			flex: 1;
			overflow-y: auto;
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
		margin-top: var(--spacing-lg);
		justify-content: center;
		width: 100%;

		@include mobile {
			background-color: rgba(0, 0, 0, 0.2);
			padding: var(--spacing-md);
			border-radius: var(--border-radius-md);
			margin-top: var(--spacing-md);
			flex-shrink: 0;
		}
	}

	// Recipe tags
	.recipe-tags {
		margin-bottom: var(--spacing-md);

		@include mobile {
			flex-shrink: 0;
		}

		.tags {
			@include mobile {
				display: flex;
				flex-wrap: wrap;
				gap: var(--spacing-sm);
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
</style>
