<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'

	let {
		loggedIn = false,
		newRecipeHref,
		logoutHref,
		aboutHref,
		profileHref,
		loginHref
	}: {
		loggedIn: boolean
		newRecipeHref?: string
		logoutHref?: string
		aboutHref?: string
		profileHref?: string
		loginHref?: string
	} = $props()

	let isMenuOpen = $state(false)

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen
	}
</script>

<header class="header">
	<div class="left-section">
		<div class="logo">
			<a href="/">Forkly</a>
		</div>
		<Button href={newRecipeHref} variant="primary" size="sm">New Recipe</Button>
	</div>

	<button class="menu-toggle" onclick={toggleMenu}>
		<span class="sr-only">Toggle menu</span>
		<span class="icon">{isMenuOpen ? '✕' : '☰'}</span>
	</button>

	<nav class:active={isMenuOpen}>
		<ul>
			<li><a href={aboutHref}>About</a></li>
			{#if loggedIn}
				<li><a href={profileHref}>Profile</a></li>
				<li>
					<Button variant="text" href={logoutHref}>Logout</Button>
				</li>
			{:else}
				<li><a href={loginHref}>Login</a></li>
			{/if}
		</ul>
	</nav>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		padding: var(--spacing-md) 0;
	}

	.left-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
	}

	.logo a {
		font-family: 'Pacifico', cursive;
		font-size: var(--font-size-3xl);
		text-decoration: none;
		transition: opacity var(--transition-fast) var(--ease-in-out);
	}

	nav {
		transition:
			transform var(--transition-fast) var(--ease-in-out),
			opacity var(--transition-fast) var(--ease-in-out);
	}

	nav ul {
		display: flex;
		gap: var(--spacing-lg);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	nav a {
		text-decoration: none;
		color: var(--color-neutral);
		transition: all var(--transition-fast) var(--ease-in-out);
		font-weight: 500;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
	}

	nav a:hover,
	nav a:focus-visible {
		color: var(--color-primary);
		background: var(--color-neutral-dark-hover, rgba(255, 255, 255, 0.1));
		outline: none;
	}

	.menu-toggle {
		display: none;
		padding: var(--spacing-sm);
		background: transparent;
		border: 1px solid var(--color-neutral);
		border-radius: var(--border-radius-sm);
		color: var(--color-neutral);
		transition: all var(--transition-fast) var(--ease-in-out);
		cursor: pointer;
	}

	.menu-toggle:hover,
	.menu-toggle:focus-visible {
		color: var(--color-primary);
		border-color: var(--color-primary);
		outline: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: var(--font-size-lg);
		}

		nav {
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
		}

		nav.active {
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
			z-index: var(--z-drawer);
		}

		nav ul {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		nav a {
			display: block;
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.left-section {
			gap: var(--spacing-sm);
		}
	}
</style>
