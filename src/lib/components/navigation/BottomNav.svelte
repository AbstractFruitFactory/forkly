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
	</a>
	<a href={newRecipeHref} class="nav-item">
		<Plus size={20} color="black" />
	</a>
	<a href={loggedIn ? profileHref : loginHref} class="nav-item">
		{#if loggedIn}
			<User size={20} color="black" />
		{:else}
			<LogIn size={20} color="black" />
		{/if}
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
		z-index: 100;
		height: 50px;
		padding: 0;
		overflow: visible;
	}

	.nav-item {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1 1 0;
		height: 100%;
		transition: color 0.2s;
	}
</style>
