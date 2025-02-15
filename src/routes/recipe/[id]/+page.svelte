<script lang="ts">
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<Recipe recipe={data.recipe} />