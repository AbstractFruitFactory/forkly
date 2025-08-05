<script lang="ts">
	import { goto } from '$app/navigation'
	import Profile from '$lib/pages/profile/Profile.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'
	import { getUserProfile } from './data.remote'
	import { page } from '$app/state'

	let { params, form } = $props()

	const tab = $derived(page.url.searchParams.get('tab') ?? undefined)
	const profileData = $derived(getUserProfile({ username: params.username, tab }))

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
		username={params.username}
		userData={profileData}
		onLogout={handleLogout}
		initialTab={tab}
		errors={form?.errors}
	/>
</div>
