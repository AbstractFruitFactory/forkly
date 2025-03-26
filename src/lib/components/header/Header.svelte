<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import { onMount } from 'svelte'
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

	let isMac = $state(false)

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')
	})
</script>

<header class="header">
	<div class="left-section">
		<div class="logo">
			<a href="/" class="logo-desktop">Forkly</a>
			<a href="/" class="logo-mobile">F</a>
		</div>
	</div>

	<div class="right-section">
		<div class="new-recipe-wrapper">
			<Button href={newRecipeHref} variant="secondary" size="sm">
				<PlusIcon size={16} />
				New Recipe
			</Button>
		</div>

		<nav class="main-nav">
			{#if loggedIn}
				<a href={profileHref} class="profile-link">
					<ProfilePic {profilePicUrl} size="sm" />
					<span class="profile-text">Profile</span>
				</a>
			{:else}
				<Button href={loginHref} variant="dotted" size="sm">Login</Button>
			{/if}
		</nav>
	</div>
</header>

<style lang="scss">
	@import '$lib/global.scss';

	.logo {
		&-desktop {
			display: block;

			@include mobile {
				display: none;
			}
		}

		&-mobile {
			display: none;

			@include mobile {
				display: block;
				width: 24px;
			}
		}

		a {
			font-family: 'Pacifico', cursive;
			font-size: var(--font-size-3xl);
			text-decoration: none;
			transition: opacity var(--transition-fast) var(--ease-in-out);
			white-space: nowrap;

			@include mobile {
				font-size: var(--font-size-2xl);
			}
		}
	}

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
		flex: 1;

		@include mobile {
			gap: var(--spacing-sm);
		}
	}

	.right-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);

		@include mobile {
			gap: var(--spacing-sm);
		}
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
