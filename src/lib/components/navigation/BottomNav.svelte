<script lang="ts">
	import Home from 'lucide-svelte/icons/home'
	import Plus from 'lucide-svelte/icons/plus'
	import User from 'lucide-svelte/icons/user'
	import LogIn from 'lucide-svelte/icons/log-in'

	let {
		loggedIn = false,
		homeHref = '/',
		newRecipeHref = '/new',
		profileHref = '/profile',
		loginHref = '/login'
	} = $props<{
		loggedIn?: boolean
		homeHref?: string
		newRecipeHref?: string
		profileHref?: string
		loginHref?: string
	}>()
</script>

<nav class="bottom-nav">
	<a href={homeHref} class="nav-item">
		<Home size={20} color="black" />
		<span>Explore recipes</span>
	</a>
	<a href={newRecipeHref} class="nav-item">
		<Plus size={20} color="black" />
		<span>Add recipe</span>
	</a>
	<a href={loggedIn ? profileHref : loginHref} class="nav-item">
		{#if loggedIn}
			<User size={20} color="black" />
		{:else}
			<LogIn size={20} color="black" />
		{/if}
		<span>{loggedIn ? 'Profile' : 'Login'}</span>
	</a>
</nav>

<style lang="scss">
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-background);
		border-top: 1px solid var(--color-neutral-light);
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		height: 70px;
		z-index: 100;
		padding: 0;
		overflow: visible;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		text-decoration: none;
		flex: 1 1 0;
		padding-bottom: 10px;
		font-size: 13px;
		transition: color 0.2s;
		user-select: none;
		-webkit-tap-highlight-color: transparent;

		span {
			font-size: var(--font-size-xs);
			font-weight: 500;
			color: var(--color-neutral-dark);
		}
	}
</style>
