<script lang="ts">
  import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
  import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
  import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
  import type { TagSearchResponse } from '../../../(api)/tags/+server'
  import { safeFetch } from '$lib/utils/fetch'
  import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
  import { fly } from 'svelte/transition'
  import { isLoggedIn } from '../data.remote'

  let tagSearchTimeout: ReturnType<typeof setTimeout>

  let createdRecipeId = $state<string | null>(null)
  let errors = $state<{ path: string; message: string }[] | undefined>(undefined)

  const handleSearchTags = async (query: string): Promise<{ name: string; count: number }[]> => {
    clearTimeout(tagSearchTimeout)
    return new Promise((resolve) => {
      tagSearchTimeout = setTimeout(async () => {
        const response = await safeFetch<TagSearchResponse>()(`/tags?q=${encodeURIComponent(query)}`)
        if (response.isOk()) resolve(response.value.tags)
        else resolve([])
      }, 300)
    })
  }

  const handleUnitChange = (system: UnitSystem) => {
    if (system === 'metric') unitPreferenceStore.setMetric()
    else unitPreferenceStore.setImperial()
  }

  const unitSystem = $derived(unitPreferenceStore.value)
</script>

{#if createdRecipeId}
  <div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
    <RecipeSuccess recipeId={createdRecipeId} />
  </div>
{:else}
  <div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
    <NewRecipe
      {errors}
      onSearchTags={handleSearchTags}
      {unitSystem}
      onUnitChange={handleUnitChange}
      isLoggedIn={isLoggedIn()}
      onCreated={(id) => {
        errors = undefined
        createdRecipeId = id
      }}
    />
  </div>
{/if}


