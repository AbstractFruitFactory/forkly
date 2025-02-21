<script>
	import { page } from '$app/stores'
	import Button from '$lib/components/button/Button.svelte'

	let isMenuOpen = $state(false)

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen
	}
</script>

<header class="header">
	<div class="container">
		<div class="left-section">
			<div class="logo">
				<a href="/">Forkly</a>
			</div>
			<Button href="/new" variant="primary" size="sm">New Recipe</Button>
		</div>

		<button class="menu-toggle" onclick={toggleMenu}>
			<span class="sr-only">Toggle menu</span>
			<span class="icon">{isMenuOpen ? '✕' : '☰'}</span>
		</button>

		<nav class:active={isMenuOpen}>
			<ul>
				<li><a href="/about">About</a></li>
				{#if $page.data.user}
					<li>
						<form action="/logout" method="POST">
							<Button variant="text" type="submit">Logout</Button>
						</form>
					</li>
				{:else}
					<li><a href="/login">Login</a></li>
				{/if}
			</ul>
		</nav>
	</div>
</header>

<style>
	.header {
		background: var(--color-neutral-dark);
		box-shadow: var(--shadow-sm);
		padding: var(--spacing-md) 0;
		border-bottom: 1px solid var(--color-neutral);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-md);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.left-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-xl);
	}

	.logo a {
		font-family: 'Pacifico', cursive;
		font-size: var(--font-size-3xl);
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
		transition: color var(--transition-fast) var(--ease-in-out);
		font-weight: 500;
	}

	nav a:hover {
		color: var(--color-primary);
	}

	.menu-toggle {
		display: none;
		transition: opacity var(--transition-fast) var(--ease-in-out);
		color: var(--color-neutral);
	}

	.menu-toggle:hover {
		opacity: 0.7;
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
			display: block;
			background: none;
			border: none;
			font-size: var(--spacing-lg);
			cursor: pointer;
		}

		nav {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			padding: var(--spacing-md);
		}

		nav.active {
			display: block;
		}

		nav ul {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.left-section {
			gap: var(--spacing-sm);
		}
	}
</style>
