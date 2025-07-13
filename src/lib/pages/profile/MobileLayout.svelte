<script lang="ts">
	import type { Snippet } from 'svelte'
	import User from 'lucide-svelte/icons/user'
	import SquarePlus from 'lucide-svelte/icons/square-plus'
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import { goto } from '$app/navigation'
	import Drawer from '$lib/components/drawer/Drawer.svelte'

	let {
		avatar,
		name,
		email,
		signOut,
		location,
		profileInfo,
		createdRecipes,
		savedRecipes,
		initialView
	}: {
		avatar: Snippet
		name: Snippet
		email: Snippet
		signOut: Snippet<[fullWidth: boolean]>
		location?: Snippet
		profileInfo: Snippet
		createdRecipes: Snippet
		savedRecipes: Snippet
		initialView?: string
	} = $props()

	let view = $state(initialView)
	let isDrawerOpen = $state(!!initialView)

	function open(viewName?: typeof view) {
		view = viewName
		isDrawerOpen = !!viewName
		//goto(viewName ? `/profile?tab=${viewName}` : '/profile', { replaceState: true })
	}

	function handleBack() {
		open()
	}

	function getDrawerTitle() {
		return view === 'Profile info'
			? 'Profile'
			: view === 'Created recipes'
				? 'Created recipes'
				: 'Saved recipes'
	}
</script>

<div class="profile-view">
	<div class="profile-card card">
		<div class="avatar-row">{@render avatar()}</div>
		<div class="name-row">{@render name()}</div>
		<div class="email-row">{@render email()}</div>
		{#if location}
			<div class="location-row">{@render location()}</div>
		{/if}
	</div>
	<div class="profile-menu">
		<button class="menu-btn card" onclick={() => open('Profile info')}>
			<span class="menu-icon"><User size={20} /></span>
			<span>Profile info</span>
		</button>
		<button class="menu-btn card" onclick={() => open('Created recipes')}>
			<span class="menu-icon"><SquarePlus size={20} /></span>
			<span>Created recipes</span>
		</button>
		<button class="menu-btn card" onclick={() => open('Saved recipes')}>
			<span class="menu-icon"><Bookmark size={20} /></span>
			<span>Saved recipes</span>
		</button>
	</div>
	<div class="signout-row">{@render signOut(true)}</div>
</div>

<Drawer 
	bind:isOpen={isDrawerOpen}
	title={getDrawerTitle()}
	position="side"
	showBackButton={true}
	onBack={handleBack}
>
	{#if view === 'Profile info'}
		<div class="card">
			{@render profileInfo()}
		</div>
	{:else if view === 'Created recipes'}
		{@render createdRecipes()}
	{:else if view === 'Saved recipes'}
		{@render savedRecipes()}
	{/if}
</Drawer>

<style lang="scss">
	@import '$lib/global.scss';

	.profile-view {
		position: relative;
		margin: 0 auto;

		@include tablet {
			max-width: 480px;
		}
	}

	.profile-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.avatar-row {
		margin-bottom: var(--spacing-md);
	}

	.name-row {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-on-primary);
	}

	.email-row {
		font-size: var(--font-size-md);
		color: var(--color-neutral-light);
	}

	.location-row {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.profile-menu {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.menu-btn {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.menu-icon {
		display: flex;
		align-items: center;
		margin-right: var(--spacing-sm);
	}

	.signout-row {
		margin-top: var(--spacing-lg);
		display: flex;
		justify-content: center;
	}
</style>
