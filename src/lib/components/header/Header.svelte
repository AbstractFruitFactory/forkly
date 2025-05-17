<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import Logo from '$lib/components/logo/Logo.svelte'
	import HeaderActions from './HeaderActions.svelte'

	let {
		loggedIn = false,
		newRecipeHref,
		profileHref,
		loginHref,
		profilePicUrl = '',
		actions,
		logo
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		profileHref?: string
		loginHref?: string
		profilePicUrl?: string
		actions?: Snippet
		logo?: Snippet
	} = $props()

	let isMac = $state(false)

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')
	})
</script>

<header class="header">
	<div class="left-section">
		{#if logo}
			{@render logo()}
		{:else}
			<Logo />
		{/if}
	</div>

	<div class="right-section">
		{#if actions}
			{@render actions()}
		{:else}
			<HeaderActions {loggedIn} {newRecipeHref} {profileHref} {loginHref} {profilePicUrl} />
		{/if}
	</div>
</header>

<style lang="scss">
	@import '$lib/global.scss';

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		padding: var(--spacing-md) 0;
		width: 100%;
		gap: var(--spacing-lg);

		@include mobile {
			padding: var(--spacing-sm);
		}
	}

	.left-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
		flex: 0 1 auto;

		@include mobile {
			gap: var(--spacing-sm);
		}
	}

	.right-section {
		display: flex;
		align-items: center;
		flex: 0 1 auto;
	}

	.new-recipe-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.main-nav {
		display: flex;
		align-items: center;
	}

	.profile {
		&-link {
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

		&-text {
			@include mobile {
				display: none;
			}
		}
	}
</style>
