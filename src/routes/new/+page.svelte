<script lang="ts">
	import NewRecipePage from '$lib/pages/new-recipe/NewRecipe.svelte'

	let { errors } = $props()
</script>

<NewRecipePage {errors} />
