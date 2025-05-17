<script lang="ts">
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
	import {
		unitPreferenceStore,
		type UnitSystem
	} from '$lib/state/unitPreference.svelte'
	import type { TagSearchResponse } from '../api/tags/+server'
	import { safeFetch } from '$lib/utils/fetch'

	let { form, data } = $props()

	let searchTimeout: ReturnType<typeof setTimeout>
	let tagSearchTimeout: ReturnType<typeof setTimeout>

	const handleSearchIngredients = async (query: string): Promise<IngredientSearchResult> => {
		clearTimeout(searchTimeout)

		return new Promise((resolve) => {
			searchTimeout = setTimeout(async () => {
				const response = await safeFetch<IngredientSearchResult>()(`/api/ingredients/search/${query}`)
				if (response.isOk()) {
					resolve(response.value)
				} else {
					console.error('Failed to fetch ingredients:', response.error)
					resolve([])
				}
			}, 300)
		})
	}

	const handleSearchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
		clearTimeout(tagSearchTimeout)

		return new Promise((resolve) => {
			tagSearchTimeout = setTimeout(async () => {
				const response = await safeFetch<TagSearchResponse>()(`/api/tags?q=${encodeURIComponent(query)}`)
				if (response.isOk()) {
					resolve(response.value.tags)
				} else {
					console.error('Failed to fetch tags:', response.error)
					resolve([])
				}
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
		onSearchTags={handleSearchTags}
		availableTags={data?.availableTags ?? []}
		{unitSystem}
		onUnitChange={handleUnitChange}
	/>
{/if}
