<script lang="ts">
	import Home from '$lib/pages/home/Home.svelte'

	let { data } = $props()
</script>

<Home
	recipes={data.recipes.map((recipe) => ({
		...recipe,
		ingredients: recipe.ingredients.length,
		instructions: recipe.instructions.length,
		imageUrl: recipe.imageUrl,
		user: recipe.user?.username
			? {
					username: recipe.user.username,
					avatarUrl: recipe.user.avatarUrl
				}
			: undefined
	}))}
/>
