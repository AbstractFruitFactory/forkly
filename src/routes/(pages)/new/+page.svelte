<script lang="ts">
	import ImportRecipe from '$lib/pages/new-recipe/ImportRecipe.svelte'
	import { fly } from 'svelte/transition'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { goto } from '$app/navigation'
</script>

<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
	<ImportRecipe
		onRecipeScraped={(recipe) => {
			try {
				sessionStorage.setItem('forkly_prefilled_recipe', JSON.stringify(recipe))
			} catch {}
			goto('/new/form')
		}}
	/>
</div>
