<script lang="ts">
	import type { ActionData, PageData } from './$types'
	import Profile from '$lib/pages/profile/Profile.svelte'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<Profile
	user={{
		...data.user,
		bio: form?.bio ?? data.user.bio
	}}
	recipes={data.recipes}
	recipeHref="/recipe"
/>
