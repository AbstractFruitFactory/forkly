<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import LogInIcon from 'lucide-svelte/icons/log-in'
	import PlusIcon from 'lucide-svelte/icons/plus'

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

<div class="header-actions">
	<div>
		<Button href={newRecipeHref} color="neutral" size="sm">
			<PlusIcon size={16} />
			New Recipe
		</Button>
	</div>

	<nav class="main-nav">
		{#if loggedIn}
			<a href={profileHref} class="profile-link">
				<ProfilePic {profilePicUrl} size="sm" />
			</a>
		{:else}
			<Button href={loginHref} variant="border" color="primary" size="sm">
				<LogInIcon color="black" size={16} />
				Sign in
			</Button>
		{/if}
	</nav>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.main-nav {
		display: flex;
		align-items: center;
	}

	.profile-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		transition: all var(--transition-fast) var(--ease-in-out);
		&:hover,
		&:focus-visible {
			color: var(--color-primary);
			background: var(--color-neutral-dark-hover, rgba(255, 255, 255, 0.1));
			outline: none;
		}
	}
</style>
