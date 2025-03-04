<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import LikeButton from '$lib/components/like-button/LikeButton.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import ShareButton from '$lib/components/share-button/ShareButton.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import {
		convertMeasurement,
		formatMeasurement,
		UNIT_DISPLAY_TEXT,
		UNITS
	} from '$lib/utils/unitConversion'
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
		nutrition,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark
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

	const getFormattedIngredient = (ingredient: Ingredient) => {
		if (
			UNITS.other.includes(ingredient.measurement as string) ||
			ingredient.measurement === 'teaspoons' ||
			ingredient.measurement === 'tablespoons'
		) {
			const displayUnit = UNIT_DISPLAY_TEXT[ingredient.measurement] || ingredient.measurement
			return {
				...ingredient,
				displayQuantity: ingredient.quantity,
				displayUnit: ingredient.measurement,
				displayUnitText: displayUnit,
				formattedMeasurement: formatMeasurement(ingredient.quantity, ingredient.measurement)
			}
		}

		const { quantity, unit } = convertMeasurement(
			ingredient.quantity,
			ingredient.measurement,
			unitSystem
		)

		const displayUnit = UNIT_DISPLAY_TEXT[unit] || unit

		return {
			...ingredient,
			displayQuantity: quantity,
			displayUnit: unit,
			displayUnitText: displayUnit,
			formattedMeasurement: formatMeasurement(quantity, unit)
		}
	}
</script>

<div class="container">
	<article class="recipe">
		<!-- Desktop View -->
		<div class="desktop-view">
			<div class="recipe-header-section">
				{#if recipe.imageUrl}
					<div class="recipe-image">
						<img src={recipe.imageUrl} alt={recipe.title} />
					</div>
				{/if}

				<div class="recipe-intro">
					<div class="recipe-title-row">
						<h2>{recipe.title}</h2>
						<div class="recipe-actions">
							<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />

							{#snippet likeButton()}
								<LikeButton
									count={recipe.likes}
									isLiked={recipe.isLiked}
									interactive={!!onLike}
									onLike={isLoggedIn ? onLike : undefined}
								/>
							{/snippet}

							{#snippet dislikeButton()}
								<DislikeButton
									isDisliked={recipe.isDisliked}
									interactive={!!onDislike}
									onDislike={isLoggedIn ? onDislike : undefined}
								/>
							{/snippet}

							{#snippet bookmarkButton()}
								<BookmarkButton
									count={recipe.bookmarks}
									isBookmarked={recipe.isBookmarked}
									interactive={!!onBookmark}
									onBookmark={isLoggedIn ? onBookmark : undefined}
								/>
							{/snippet}

							{#if isLoggedIn}
								{@render dislikeButton()}
								{@render likeButton()}
								{@render bookmarkButton()}
							{:else}
								<Popover type="warning">
									{#snippet trigger()}
										{@render dislikeButton()}
									{/snippet}

									{#snippet content()}
										Login to dislike recipes!
									{/snippet}
								</Popover>
								<Popover type="warning">
									{#snippet trigger()}
										{@render likeButton()}
									{/snippet}

									{#snippet content()}
										Login to like recipes!
									{/snippet}
								</Popover>
								<Popover type="warning">
									{#snippet trigger()}
										{@render bookmarkButton()}
									{/snippet}

									{#snippet content()}
										Login to bookmark recipes!
									{/snippet}
								</Popover>
							{/if}
						</div>
					</div>

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
				</div>
			</div>

			<div class="recipe-content">
				<div class="recipe-sidebar">
					<div class="section-header">
						<h3>Ingredients</h3>
						<div class="unit-toggle-container">
							<UnitToggle state={unitSystem} onSelect={onUnitChange} />
						</div>
					</div>
					<ul class="ingredients-list">
						{#each recipe.ingredients as ingredient}
							{@const formattedIngredient = getFormattedIngredient(ingredient)}
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

				<div class="recipe-main">
					<div class="section-header">
						<h3>Instructions</h3>
					</div>
					<ol class="instructions-list">
						{#each recipe.instructions as instruction, i}
							<li>
								<div class="instruction-number">{i + 1}</div>
								<div class="instruction-content">
									{#if instruction.mediaUrl}
										<div class="instruction-media">
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
							</li>
						{/each}
					</ol>
				</div>
			</div>
		</div>

		<!-- Mobile Swipeable View -->
		<div
			class="mobile-view"
			bind:this={cardContainer}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			<div
				class="progress-bar"
				style:width={`${(currentCardIndex / (totalCards - 1)) * 100}%`}
			></div>

			<div class="card-container" style:transform={`translateX(-${currentCardIndex * 100}%)`}>
				<!-- Card 1: Overview -->
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
						</div>

						<div class="recipe-actions">
							<ShareButton url={`${page.url.origin}/recipe/${recipe.id}`} title={recipe.title} />
							{#if isLoggedIn}
								<DislikeButton
									isDisliked={recipe.isDisliked}
									interactive={!!onDislike}
									{onDislike}
								/>
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

				<!-- Card 2: Ingredients -->
				<div
					class="recipe-card ingredients-card"
					class:active={currentCardIndex === CARD_INGREDIENTS}
				>
					<div class="card-header">
						<h3>Ingredients</h3>
						<div class="unit-toggle-container">
							<UnitToggle state={unitSystem} onSelect={onUnitChange} />
						</div>
					</div>
					<div class="card-content">
						<ul class="ingredients-list">
							{#each recipe.ingredients as ingredient}
								{@const formattedIngredient = getFormattedIngredient(ingredient)}
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

				<!-- Cards 3+: Instructions (one per step) -->
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
								<div class="instruction-media">
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
	</article>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-md);

		@include mobile {
			padding: 0;
			display: flex;
			flex-direction: column;
			background-color: var(--color-neutral-darkest);
			overflow: hidden;
			margin: 0;
			width: 100%;
			max-width: 100%;
		}
	}

	.recipe {
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--spacing-xl);
		position: relative;
		overflow: hidden;

		@include small-mobile {
			padding: var(--spacing-lg);
			border-radius: var(--border-radius-md);
		}

		@include mobile {
			height: 100%;
			width: 100%;
			margin: 0;
			padding: 0;
			display: flex;
			flex-direction: column;
			border-radius: 0;
			flex: 1;
			overflow: hidden;
		}
	}

	// Desktop View Styles
	.desktop-view {
		display: block;

		@include mobile {
			display: none;
		}
	}

	// Mobile View Styles
	.mobile-view {
		display: none;
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease;
		touch-action: pan-x;
		position: relative;
		overflow: hidden;

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
			overflow: visible;
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
			overflow: hidden;
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

		@include mobile {
			margin-bottom: 0;
			padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
			flex-shrink: 0;
			background-color: var(--color-primary-dark);
			border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
			border-bottom: none;
		}

		h3 {
			@include mobile {
				color: var(--color-neutral-lightest);
				font-size: var(--font-size-lg);
				letter-spacing: 0.5px;

				&::after {
					display: none;
				}
			}
		}
	}

	.card-content {
		flex: 1;
		overflow-y: auto;
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

	.card-footer {
		display: flex;
		justify-content: space-between;
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-md);
		border-top: 1px solid rgba(255, 255, 255, 0.1);

		@include mobile {
			display: none; /* Hide individual card footers on mobile */
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

	// Original styles (now applied to desktop view)
	.recipe-header-section {
		display: grid;
		grid-template-columns: minmax(250px, 40%) 1fr;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);

		@include tablet {
			grid-template-columns: 1fr;
		}
	}

	.recipe-image {
		position: relative;
		aspect-ratio: 1 / 1;
		width: 100%;
		overflow: hidden;
		border-radius: var(--border-radius-md);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		@include tablet {
			max-width: 400px;
			margin: 0 auto var(--spacing-md) auto;
		}

		// Mobile card specific styles
		.mobile-view & {
			max-width: 100%;
			margin: 0 0 var(--spacing-md) 0;
			aspect-ratio: 16 / 9;

			@include mobile {
				max-height: 22vh;
				margin: 0 0 var(--spacing-sm) 0;
				border-radius: var(--border-radius-md);
				box-shadow: var(--shadow-sm);
				overflow: hidden;
				flex-shrink: 0;

				img {
					transform: scale(1.02);
					transition: transform 0.3s ease;
				}
			}
		}
	}

	.recipe-intro {
		display: flex;
		flex-direction: column;

		h2 {
			margin-bottom: 0;
			color: var(--color-neutral-lightest);
			flex: 1;

			@include small-mobile {
				font-size: var(--font-size-xl);
			}
		}

		h3 {
			margin-bottom: 0;
			color: var(--color-primary);
			position: relative;
			width: fit-content;

			&::after {
				content: '';
				position: absolute;
				bottom: -5px;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: var(--color-primary);
			}
		}

		.description {
			font-size: var(--font-size-md);
			line-height: 1.6;
			margin: 0 0 var(--spacing-md) 0;
			color: var(--color-neutral-light);
		}
	}

	.recipe-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-sm);

		@include small-mobile {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.recipe-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);

		@include small-mobile {
			margin-top: var(--spacing-sm);
		}

		// Mobile card specific styles
		.mobile-view & {
			margin-top: var(--spacing-md);
			justify-content: center;

			@include mobile {
				background-color: rgba(0, 0, 0, 0.2);
				padding: var(--spacing-sm);
				border-radius: var(--border-radius-md);
				margin-top: var(--spacing-sm);
				flex-shrink: 0;
			}
		}
	}

	.recipe-tags {
		margin-bottom: var(--spacing-md);

		@include mobile {
			flex-shrink: 0;
		}

		.tags {
			display: flex;
			flex-wrap: wrap;
			gap: var(--spacing-xs);

			@include mobile {
				justify-content: center;
			}
		}
	}

	.nutrition-facts {
		margin-top: var(--spacing-md);

		@include mobile {
			flex-shrink: 0;
		}
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);

		@include small-mobile {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg);
		}

		// Mobile card specific styles
		.mobile-view & {
			@include mobile {
				margin-top: var(--spacing-sm);
				gap: var(--spacing-sm);
				background-color: rgba(0, 0, 0, 0.2);
				padding: var(--spacing-sm);
				border-radius: var(--border-radius-md);
			}
		}
	}

	.nutrition-item {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;

		.value {
			font-size: var(--font-size-lg);
			font-weight: var(--font-weight-bold);
			color: var(--color-primary);

			@include small-mobile {
				font-size: var(--font-size-md);
			}
		}

		.label {
			display: block;
			font-size: var(--font-size-xs);
			color: var(--color-neutral-light);
			margin-top: var(--spacing-xs);
			letter-spacing: 0.5px;
		}
	}

	.nutrition-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		background: var(--color-neutral-dark);
		margin-bottom: var(--spacing-xs);
		border: 2px solid var(--color-primary);

		@include small-mobile {
			width: 60px;
			height: 60px;
		}

		// Mobile card specific styles
		.mobile-view & {
			@include mobile {
				width: 50px;
				height: 50px;
				background-color: var(--color-neutral-darkest);
			}
		}
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		margin-top: var(--spacing-md);
		font-style: italic;
	}

	// Main Content Section
	.recipe-content {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: var(--spacing-xl);
		margin-top: var(--spacing-xl);

		@include tablet {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}
	}

	.recipe-sidebar {
		@include tablet {
			max-width: 500px;
		}
	}

	// Section Headers
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-xs);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);

		h3 {
			margin-bottom: 0;
			color: var(--color-primary);
			position: relative;
			width: fit-content;

			&::after {
				content: '';
				position: absolute;
				bottom: -5px;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: var(--color-primary);
			}
		}

		@include small-mobile {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);

		@include small-mobile {
			margin-left: 0;
		}
	}

	// Ingredients List
	.ingredients-list {
		margin: 0;
		padding: 0;

		li {
			list-style: none;
			padding: var(--spacing-sm) 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			display: flex;
			justify-content: space-between;
			font-size: var(--font-size-sm);

			&:last-child {
				border-bottom: none;
			}

			@include tablet {
				font-size: var(--font-size-md);
			}
		}

		.mobile-view & {
			@include mobile {
				li {
					padding: var(--spacing-sm) 0;
					font-size: var(--font-size-sm);
					border-bottom: 1px solid rgba(255, 255, 255, 0.08);
				}

				.measurement {
					min-width: 40px;
					color: var(--color-primary-light);
				}

				.ingredient-name {
					font-weight: var(--font-weight-medium);
				}
			}
		}
	}

	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		min-width: 50px;

		@include tablet {
			min-width: 60px;
		}
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}

	// Instructions List
	.instructions-list {
		padding-left: 0;
		max-width: 800px;
		margin: 0;

		li {
			display: flex;
			margin-bottom: var(--spacing-xl);
			padding-bottom: var(--spacing-xl);
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			position: relative;

			&:last-child {
				border-bottom: none;
				margin-bottom: 0;
				padding-bottom: 0;
			}

			@include small-mobile {
				margin-bottom: var(--spacing-lg);
				padding-bottom: var(--spacing-lg);
			}
		}
	}

	.instruction-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background-color: var(--color-primary);
		color: var(--color-neutral-darkest);
		border-radius: 50%;
		font-weight: var(--font-weight-bold);
		margin-right: var(--spacing-md);
		flex-shrink: 0;
		font-size: var(--font-size-lg);
	}

	.instruction-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction-text {
		line-height: 1.6;
		font-size: var(--font-size-md);
		flex: 1;

		:global(span) {
			display: inline;
		}

		@include small-mobile {
			font-size: var(--font-size-base);
		}

		@include mobile {
			font-size: var(--font-size-sm);
			line-height: 1.5;
			color: var(--color-neutral-lightest);
			flex: 1;
			overflow-y: auto;
		}
	}

	// Media Styles
	.instruction-media {
		width: 100%;
		max-width: 450px;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		will-change: transform;
		content-visibility: auto;

		img,
		video {
			width: 100%;
			display: block;
			border-radius: var(--border-radius-md);
			aspect-ratio: 16 / 9;
			object-fit: cover;
			will-change: transform;
		}

		@include small-mobile {
			max-width: 100%;
		}

		@include mobile {
			flex-shrink: 0;
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

	// Mobile card specific styles for typography
	.mobile-view {
		h2 {
			@include mobile {
				font-size: 1.5rem;
				margin-top: 0;
				margin-bottom: var(--spacing-sm);
				color: var(--color-primary);
				text-align: center;
				font-weight: var(--font-weight-bold);
				flex-shrink: 0;
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
			}
		}

		.nutrition-item .value {
			@include mobile {
				font-size: var(--font-size-sm);
			}
		}

		.nutrition-item .label {
			@include mobile {
				font-size: 0.65rem;
			}
		}

		// Add progress indicator
		.progress-bar {
			position: absolute;
			top: 0;
			left: 0;
			height: 3px;
			background-color: var(--color-primary);
			transition: width 0.3s ease;
			z-index: 10;
		}
	}

	@keyframes fade-in-out {
		0% {
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
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

			.card-content {
				overflow-y: auto;
				-webkit-overflow-scrolling: touch;
				flex: 1;
				min-height: 0;
			}
		}
	}
</style>
