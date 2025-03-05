<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData } from '$lib/types'
	import RecipeDesktopView from './RecipeDesktopView.svelte'
	import RecipeMobileView from './RecipeMobileView.svelte'
	import { getFormattedIngredient } from './utils/recipeUtils'

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
</script>

<div class="container">
	<article class="recipe">
		<!-- Desktop View -->
		<RecipeDesktopView
			{recipe}
			{nutrition}
			{onLike}
			{onDislike}
			{unitSystem}
			{onUnitChange}
			{isLoggedIn}
			{onBookmark}
			{getFormattedIngredient}
		/>

		<!-- Mobile Swipeable View -->
		<RecipeMobileView
			{recipe}
			{nutrition}
			{getFormattedIngredient}
			{unitSystem}
			{onUnitChange}
			{isLoggedIn}
			{onBookmark}
		/>
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
</style>
