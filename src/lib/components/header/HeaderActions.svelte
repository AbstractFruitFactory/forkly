<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import LogInIcon from 'lucide-svelte/icons/log-in'
	import PlusIcon from 'lucide-svelte/icons/plus'
	import DownloadIcon from 'lucide-svelte/icons/download'

	let {
		loggedIn = false,
		newRecipeHref,
		profileHref,
		loginHref,
		profilePicUrl = '',
		onImportRecipe
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		profileHref?: string
		loginHref?: string
		profilePicUrl?: string
		onImportRecipe?: () => void
	} = $props()

	function handleImportRecipe() {
		onImportRecipe?.()
	}
</script>

<div class="header-actions">
	<div class="recipe-actions">
		<Button onclick={handleImportRecipe} variant="border" color="neutral">
			<DownloadIcon color="var(--color-text-on-surface)" size={16} />
			Import Recipe
		</Button>
		<Button href={newRecipeHref} color="primary">
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
			<Button href={loginHref} variant="border" color="neutral">
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

	.recipe-actions {
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
	}
</style>
