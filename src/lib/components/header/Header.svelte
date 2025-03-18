<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import ProfilePic from '$lib/components/profile-pic/ProfilePic.svelte'
	import { onMount } from 'svelte'

	let {
		loggedIn = false,
		newRecipeHref,
		profileHref,
		loginHref,
		profilePicUrl = '',
		onOpenSearch
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		profileHref?: string
		loginHref?: string
		profilePicUrl?: string
		onOpenSearch?: () => void
	} = $props()

	let isMac = $state(false)

	const handleSearchClick = () => {
		onOpenSearch?.()
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			onOpenSearch?.()
		}
	}

	onMount(() => {
		isMac = navigator.userAgent.toLowerCase().includes('mac')

		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	})
</script>

<header class="header">
	<div class="left-section">
		<div class="logo">
			<a href="/" class="logo-desktop">Forkly</a>
			<a href="/" class="logo-mobile">F</a>
		</div>
		<div class="search-container">
			<button
				class="search-trigger"
				onclick={handleSearchClick}
				onkeydown={(e) => e.key === 'Enter' && handleSearchClick()}
				type="button"
			>
				<div class="search-desktop">
					<Search placeholder="Search recipes..." isLoading={false} onSearch={() => []} />
				</div>
				<div class="search-mobile">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
				</div>

				<div class="search-shortcut">
					<kbd>{isMac ? '⌘' : 'Ctrl'}+K</kbd>
				</div>
			</button>
		</div>
	</div>

	<div class="right-section">
		<div class="new-recipe-wrapper">
			<Button href={newRecipeHref} variant="secondary" size="sm">New Recipe</Button>
		</div>

		<nav class="main-nav">
			{#if loggedIn}
				<a href={profileHref} class="profile-link">
					<ProfilePic {profilePicUrl} size="32px" />
					<span class="profile-text">Profile</span>
				</a>
			{:else}
				<Button href={loginHref} variant="secondary" size="sm">Login</Button>
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

	.main-nav {
		display: flex;
		align-items: center;
	}

	.search {
		&-container {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
		}

		&-desktop {
			display: block;

			@include mobile {
				display: none;
			}
		}

		&-mobile {
			display: none;
			width: 36px;
			height: 36px;
			border-radius: 50%;
			background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
			color: var(--color-neutral);
			align-items: center;
			justify-content: center;

			@include mobile {
				display: flex;
			}
		}

		&-trigger {
			cursor: pointer;
			width: 100%;
			transition: all var(--transition-fast) var(--ease-in-out);
			position: relative;
			background: none;
			border: none;
			padding: 0;
			display: block;

			&:hover {
				opacity: 0.8;
			}
		}

		&-shortcut {
			position: absolute;
			right: var(--spacing-sm);
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			pointer-events: none;

			@include mobile {
				display: none;
			}

			kbd {
				background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
				border-radius: var(--border-radius-sm);
				padding: var(--spacing-xs) var(--spacing-sm);
				font-size: var(--font-size-xs);
				color: var(--color-neutral);
				font-family: monospace;
			}
		}
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
