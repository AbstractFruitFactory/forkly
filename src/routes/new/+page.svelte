<script lang="ts">
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
	import {
		unitPreferenceStore,
		type UnitSystem
	} from '$lib/state/unitPreference.svelte'

	let { form } = $props()

	let searchTimeout: ReturnType<typeof setTimeout>

	const handleSearchIngredients = async (query: string): Promise<IngredientSearchResult> => {
		clearTimeout(searchTimeout)

		return new Promise((resolve) => {
			searchTimeout = setTimeout(async () => {
				const response = await fetch(`/api/ingredients/search/${query}`)
				if (!response.ok) {
					console.error('Failed to fetch ingredients:', await response.text())
					resolve([])
					return
				}
				const results = await response.json()
				resolve(results)
			}, 300)
		})
	}

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

{#if form?.success}
	<RecipeSuccess recipeId={form.recipeId!} />
{:else}
	<NewRecipe
		errors={form?.errors}
		onSearchIngredients={handleSearchIngredients}
		{unitSystem}
		onUnitChange={handleUnitChange}
	/>
{/if}
