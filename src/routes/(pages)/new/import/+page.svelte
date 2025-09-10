<script lang="ts">
  import ImportRecipe from '$lib/pages/new-recipe/ImportRecipe.svelte'
  import { goto } from '$app/navigation'
</script>

<ImportRecipe
  onBack={() => goto('/new')}
  onRecipeScraped={(recipe) => {
    try { sessionStorage.setItem('forkly_prefilled_recipe', JSON.stringify(recipe)) } catch {}
    goto('/new/form')
  }}
/>


