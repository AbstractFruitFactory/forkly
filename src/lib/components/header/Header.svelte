<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import HamburgerMenu from '$lib/components/hamburger-menu'
	import { onMount } from 'svelte'

	let {
		loggedIn = false,
		newRecipeHref,
		aboutHref,
		profileHref,
		loginHref,
		onLogout,
		onOpenSearch
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		aboutHref?: string
		profileHref?: string
		loginHref?: string
		onLogout?: () => void
		onOpenSearch?: () => void
	} = $props()

	let isMenuOpen = $state(false)
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
				<Search placeholder="Search recipes..." isLoading={false} onSearch={() => []} />

				<div class="search-shortcut">
					<kbd>{isMac ? '⌘' : 'Ctrl'}+K</kbd>
				</div>
			</button>
			<Button href={newRecipeHref} variant="primary" size="sm">New Recipe</Button>
		</div>
	</div>

	<div class="hamburger-menu">
		<HamburgerMenu bind:isOpen={isMenuOpen} size="sm" ariaLabel="Toggle navigation menu" />
	</div>

	<nav class:active={isMenuOpen}>
		<ul>
			<li><a href={aboutHref}>About</a></li>
			{#if loggedIn}
				<li><a href={profileHref}>Profile</a></li>
				<li>
					<Button variant="text" onclick={onLogout}>Logout</Button>
				</li>
			{:else}
				<li><a href={loginHref}>Login</a></li>
			{/if}
		</ul>
	</nav>
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

	nav {
		transition:
			transform var(--transition-fast) var(--ease-in-out),
			opacity var(--transition-fast) var(--ease-in-out);
		flex-shrink: 0;

		ul {
			display: flex;
			gap: var(--spacing-lg);
			list-style: none;
			margin: 0;
			padding: 0;
			align-items: center;

			@include mobile {
				flex-direction: column;
				gap: var(--spacing-md);
			}
		}

		a {
			text-decoration: none;
			color: var(--color-neutral);
			transition: all var(--transition-fast) var(--ease-in-out);
			font-weight: 500;
			padding: var(--spacing-xs) var(--spacing-sm);
			border-radius: var(--border-radius-sm);
			white-space: nowrap;

			&:hover,
			&:focus-visible {
				color: var(--color-primary);
				background: var(--color-neutral-dark-hover, rgba(255, 255, 255, 0.1));
				outline: none;
			}

			@include mobile {
				display: block;
				padding: var(--spacing-sm) var(--spacing-md);
			}
		}

		@include mobile {
			position: absolute;
			top: calc(100% + 1px);
			left: 0;
			right: 0;
			background: var(--color-neutral-dark);
			padding: var(--spacing-md);
			opacity: 0;
			transform: translateY(-1rem);
			pointer-events: none;
			border-bottom: 1px solid var(--color-neutral);

			&.active {
				opacity: 1;
				transform: translateY(0);
				pointer-events: auto;
				z-index: var(--z-drawer);
			}
		}
	}

	.search {
		&-container {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);

			@include mobile {
				display: none;
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

	.hamburger-menu {
		display: none;

		@include mobile {
			display: block;
		}
	}
</style>
