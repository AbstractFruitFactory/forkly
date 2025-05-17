<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
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
		<Button href={newRecipeHref} variant="border" size="sm">
			<PlusIcon size={16} color="black" />
			<span class="new-recipe-text">New Recipe</span>
		</Button>
	</div>

	<nav class="main-nav">
		{#if loggedIn}
			<a href={profileHref} class="profile-link">
				<ProfilePic {profilePicUrl} size="sm" />
			</a>
		{:else}
			<Button href={loginHref} variant="dotted" size="sm">Login</Button>
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

	.new-recipe-text {
		color: black;
		font-size: var(--font-size-sm);

		@include tablet {
			display: none;
		}
	}
</style>
