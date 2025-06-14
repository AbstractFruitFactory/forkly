<script lang="ts">
	import type { Snippet } from 'svelte'
	import User from 'lucide-svelte/icons/user'
	import SquarePlus from 'lucide-svelte/icons/square-plus'
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'
	import { fly } from 'svelte/transition'

	let {
		avatar,
		name,
		email,
		signOut,
		location,
		profileInfo,
		createdRecipes,
		savedRecipes
	}: {
		avatar: Snippet
		name: Snippet
		email: Snippet
		signOut: Snippet<[fullWidth: boolean]>
		location?: Snippet
		profileInfo: Snippet
		createdRecipes: Snippet
		savedRecipes: Snippet
	} = $props()

	let view: 'menu' | 'profile' | 'created' | 'saved' = $state('menu')

	function open(viewName: typeof view) {
		view = viewName
	}
</script>

<div
	class="profile-view"
	in:fly={{ x: -50, duration: 300, delay: 500 }}
	out:fly={{ x: -50, duration: 300 }}
>
	<div class="profile-card card">
		<div class="avatar-row">{@render avatar()}</div>
		<div class="name-row">{@render name()}</div>
		<div class="email-row">{@render email()}</div>
		{#if location}
			<div class="location-row">{@render location()}</div>
		{/if}
	</div>
	<div class="profile-menu">
		<button class="menu-btn card" onclick={() => open('profile')}>
			<span class="menu-icon"><User size={20} /></span>
			<span>Profile info</span>
		</button>
		<button class="menu-btn card" onclick={() => open('created')}>
			<span class="menu-icon"><SquarePlus size={20} /></span>
			<span>Created recipes</span>
		</button>
		<button class="menu-btn card" onclick={() => open('saved')}>
			<span class="menu-icon"><Bookmark size={20} /></span>
			<span>Saved recipes</span>
		</button>
	</div>
	<div class="signout-row">{@render signOut(true)}</div>
</div>

{#if view !== 'menu'}
	<div class="profile-detail" transition:fly={{ duration: 300, x: 800, opacity: 1 }}>
		<div class="profile-detail-header">
			<button class="back-btn" onclick={() => open('menu')}><ArrowLeft size={20} /></button>
			<span class="detail-title">
				{view === 'profile' ? 'Profile' : view === 'created' ? 'Created recipes' : 'Saved recipes'}
			</span>
		</div>
		<div class="card">
			{#if view === 'profile'}
				{@render profileInfo()}
			{:else if view === 'created'}
				{@render createdRecipes()}
			{:else if view === 'saved'}
				{@render savedRecipes()}
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.profile-view {
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
		color: white;
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

	.profile-detail {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-background);
		z-index: var(--z-modal);
		padding: var(--spacing-lg);
	}

	.profile-detail-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.back-btn {
		background: var(--color-neutral-2);
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		font-size: 1.5rem;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--spacing-sm);
	}

	.detail-title {
		font-size: var(--font-size-2xl);
		color: white;
	}
</style>
