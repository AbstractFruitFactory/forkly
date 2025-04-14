<script lang="ts">
	import { goto } from '$app/navigation'
	import Profile from '$lib/pages/profile/Profile.svelte'

	let { data, form } = $props()

	async function handleLogout() {
		const response = await fetch('/api/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		if (response.ok) {
			goto('/', { invalidateAll: true })
		}
	}
</script>

<Profile
	user={form?.user ?? data.user}
	recipes={data.recipes}
	savedRecipes={data.saved}
	recipeHref="/recipe"
	onLogout={handleLogout}
/>
