<script lang="ts">
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import HomeIcon from 'lucide-svelte/icons/home'
	import PlusIcon from 'lucide-svelte/icons/plus'
	import UserIcon from 'lucide-svelte/icons/user'

	let {
		loggedIn = false,
		newRecipeHref,
		profileHref,
		loginHref,
		profilePicUrl = ''
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		profileHref?: string
		loginHref?: string
		profilePicUrl?: string
	} = $props()
</script>

<nav class="bottom-nav">
	<a href="/" class="nav-item">
		<HomeIcon size={24} />
		<span>Home</span>
	</a>
	<a href={newRecipeHref} class="nav-item">
		<PlusIcon size={24} />
		<span>New</span>
	</a>
	{#if loggedIn}
		<a href={profileHref} class="nav-item">
			<ProfilePic {profilePicUrl} size="sm" />
			<span>Profile</span>
		</a>
	{:else}
		<a href={loginHref} class="nav-item">
			<UserIcon size={24} />
			<span>Login</span>
		</a>
	{/if}
</nav>

<style lang="scss">
	@import '$lib/global.scss';

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-neutral-dark);
		border-top: 1px solid var(--color-neutral);
		display: flex;
		justify-content: space-around;
		padding: var(--spacing-sm) 0;
		padding-bottom: calc(var(--spacing-sm) + env(safe-area-inset-bottom));
		z-index: var(--z-sticky);

		@include desktop {
			display: none;
		}
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-neutral-light);
		text-decoration: none;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			color: var(--color-primary);
			background: var(--color-neutral-dark-hover);
		}

		span {
			font-size: var(--font-size-xs);
		}
	}
</style> 