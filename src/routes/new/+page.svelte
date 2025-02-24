<script lang="ts">
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'

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
</script>

{#if form?.success}
	<RecipeSuccess recipeId={form.recipeId} />
{:else}
	<NewRecipe errors={form?.errors} onSearchIngredients={handleSearchIngredients} />
{/if}
