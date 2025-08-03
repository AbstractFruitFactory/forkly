<script lang="ts">
	import { goto } from '$app/navigation'
	import Profile from '$lib/pages/profile/Profile.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'
	import { getUserProfile } from './data.remote'

	let { params, data } = $props()

	const profileData = getUserProfile({ username: params.username, tab: data.initialTab })

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
	{#await profileData}
		<Profile userData={{ type: 'loading' }} isOwner={data.isOwner} />
	{:then profileData}
		<Profile
			userData={{ type: 'loaded', ...profileData }}
			onLogout={data.isOwner ? handleLogout : undefined}
			initialTab={profileData.initialTab}
			isOwner={data.isOwner}
			errors={undefined}
		/>
	{/await}
</div>
