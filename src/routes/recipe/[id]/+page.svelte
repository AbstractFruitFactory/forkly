<script lang="ts">
	import Recipe from '$lib/pages/recipe/Recipe.svelte'

	let { data } = $props()

	const handleLike = async () => {
		const response = await fetch(`/api/recipes/${data.recipe.id}/like`, {
			method: 'POST'
		})

		if (response.ok) {
			isLiked = !isLiked
			likes = isLiked ? likes + 1 : likes - 1
		}
	}

	let isLiked = $state(data.recipe.isLiked)
	let likes = $state(data.recipe.likes)
</script>

<Recipe
	recipe={{
		...data.recipe,
		likes,
		isLiked
	}}
	nutrition={data.nutrition}
	onLike={handleLike}
/>
