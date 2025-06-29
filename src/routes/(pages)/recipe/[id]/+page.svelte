<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../api/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../api/recipes/save/+server.js'
	import type { RecipeData } from '$lib/types'
import type { CollectionsResponse } from '../../../api/collections/+server.js'
import Skeleton from '$lib/components/skeleton/Skeleton.svelte'

       let { data } = $props()

       let recipe: Awaited<ReturnType<typeof data.recipe>> | null = null
       let comments: Awaited<ReturnType<typeof data.comments>> = []
       let collections: Awaited<ReturnType<typeof data.collections>> | undefined = undefined
       let isLoading = $state(true)

       $effect(() => {
               const recipePromise = data.recipe
               const commentsPromise = data.comments
               const collectionsPromise = data.collections
               isLoading = true
               Promise.all([recipePromise, commentsPromise, collectionsPromise]).then(
                       ([r, c, cols]) => {
                               recipe = r
                               comments = c
                               collections = cols
                               isLoading = false
                       }
               )
       })

	const handleLike = async () => {
		await safeFetch<RecipesLikeResponse>()(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})
	}

	const handleSave = async (collectionName?: string) => {
		await safeFetch<RecipesSaveResponse>()(`/api/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id, collectionName })
		})
	}

	const createCollection = async (name: string) => {
		await safeFetch<CollectionsResponse>()(`/api/collections`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name })
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

       let recipeData: RecipeData | null = null

       $effect(() => {
               if (!recipe) return
               const createdAtStr =
                       typeof recipe.createdAt === 'string'
                               ? recipe.createdAt
                               : recipe.createdAt instanceof Date
                                       ? recipe.createdAt.toISOString()
                                       : new Date().toISOString()

               recipeData = {
                       ...recipe,
                       createdAt: createdAtStr,
                       ingredients: recipe.ingredients,
                       user: recipe.user
                               ? {
                                               username: recipe.user.username,
                                               avatarUrl: recipe.user.avatarUrl || undefined
                                       }
                               : undefined
               }
       })
</script>

<div class="recipe-page" data-page="recipe">
        {#if isLoading || !recipeData}
                <Skeleton height="20rem" />
        {:else}
                <Recipe
                        recipe={recipeData}
                        nutritionInfo={{
                                totalNutrition: recipeData.nutrition,
                                hasCustomIngredients: false
                        }}
                        {unitSystem}
                        onUnitChange={handleUnitChange}
                        onLike={handleLike}
                        onSave={handleSave}
                        onBackClick={() => goto('/')}
                        onCreateCollection={createCollection}
                        user={recipeData.user ? { collections: collections?.map((c) => c.name) } : undefined}
                        recipeComments={comments}
                        formError={page.form?.error}
                />
        {/if}
</div>
