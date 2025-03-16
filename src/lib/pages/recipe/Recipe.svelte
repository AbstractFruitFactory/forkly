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
		onBookmark,
		onBackClick,
		comments = [],
		formError
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
		onBackClick?: () => void
		comments?: any[]
		formError?: string | null
	} = $props()
</script>

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
	{comments}
	{formError}
/>

<RecipeMobileView
	{recipe}
	{nutrition}
	{getFormattedIngredient}
	{unitSystem}
	{onUnitChange}
	{isLoggedIn}
	{onBookmark}
	{onBackClick}
	{comments}
	{formError}
/>
