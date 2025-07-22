<script lang="ts">
	import { goto } from '$app/navigation'
	import Profile from '$lib/pages/profile/Profile.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	let { data, form } = $props()

	async function handleLogout() {
		const response = await fetch('/logout', {
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

<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
	<Profile
		user={Promise.resolve(form?.user ?? data.profileUser!)}
		createdRecipes={Promise.resolve(data.recipes)}
		collections={Promise.resolve(data.collections)}
		onLogout={data.isOwner ? handleLogout : undefined}
		initialTab={data.initialTab}
		isOwner={data.isOwner ?? false}
	/>
</div> 