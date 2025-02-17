<script lang="ts">
	import Recipe from '$lib/pages/recipe/Recipe.svelte'

	let { data } = $props()
</script>

<Recipe recipe={data.recipe} nutrition={data.nutrition} />