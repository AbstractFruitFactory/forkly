<script lang="ts">
	import { goto } from '$app/navigation'
	import Profile from '$lib/pages/profile/Profile.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'
	import { getUserProfile } from './data.remote'
	import { page } from '$app/state'

	let { params } = $props()

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

<div in:fly={FLY_LEFT_IN} out:fly={FLY_LEFT_OUT}>
	{#await profileData}
		<Profile userData={{ type: 'loading' }} isOwner={false} username={params.username} />
	{:then data}
		<Profile
			username={params.username}
			userData={{ type: 'loaded', ...data }}
			onLogout={data.currentUser ? handleLogout : undefined}
			initialTab={data.initialTab}
			isOwner={!!(data.currentUser && data.currentUser.username === params.username)}
			errors={undefined}
		/>
	{/await}
</div>
