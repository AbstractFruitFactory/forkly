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
		<Button href={newRecipeHref} color="primary" size="sm">
			<PlusIcon color="var(--color-text-on-primary)" size={16} />
			New Recipe
		</Button>
	</div>

	<nav class="main-nav">
		{#if loggedIn}
			<a href={profileHref} class="profile-link">
				<ProfilePic {profilePicUrl} size="lg" />
			</a>
		{:else}
			<Button href={loginHref} variant="border" color="neutral" size="sm">
				<LogInIcon color="var(--color-text-on-surface)" size={16} />
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
		gap: var(--spacing-lg);
	}

	.main-nav {
		display: flex;

		align-items: center;
	}

	.profile-link {
		display: flex;
	}
</style>
