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
		onSave,
		unitSystem,
		onUnitChange,
		isLoggedIn,
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
		onSave?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBackClick?: () => void
		comments?: any[]
		formError?: string
	} = $props()

	let isLiked = $state(recipe.isLiked)
	let isSaved = $state(recipe.isSaved)

	function handleLike() {
		if (!isLoggedIn || !onLike) return
		isLiked = !isLiked
		onLike()
	}

	function handleSave() {
		if (!isLoggedIn || !onSave) return
		isSaved = !isSaved
		onSave()
	}
</script>

<RecipeDesktopView
	{recipe}
	{nutrition}
	onLike={handleLike}
	onSave={handleSave}
	{isLiked}
	{isSaved}
	{unitSystem}
	{onUnitChange}
	{isLoggedIn}
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
	{onBackClick}
	onLike={handleLike}
	{onDislike}
	onSave={handleSave}
	{comments}
	{formError}
/>
