<script lang="ts">
	import Profile from '$lib/pages/profile/Profile.svelte'

	let { data, form } = $props()
</script>

<Profile user={form?.user ?? data.user} recipes={data.recipes} recipeHref="/recipe" />
