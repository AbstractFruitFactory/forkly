<script lang="ts">
	import Profile from '$lib/pages/profile/Profile.svelte'

	let { data } = $props()
</script>

<Profile user={data.user} recipes={data.recipes} recipeHref="/recipe" />
