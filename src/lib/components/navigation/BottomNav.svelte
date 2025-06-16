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
		<Home size={24} color="black" />
		<span>Home</span>
	</a>
	<a href={newRecipeHref} class="nav-item">
		<Plus size={24} color="black" />
		<span>New Recipe</span>
	</a>
	<a href={loggedIn ? profileHref : loginHref} class="nav-item">
		{#if loggedIn}
			<User size={24} color="black" />
		{:else}
			<LogIn size={24} color="black" />
		{/if}
		<span>{loggedIn ? 'Profile' : 'Login'}</span>
	</a>
</nav>

<style lang="scss">
	.bottom-nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;

		span {
			font-size: 0.75rem;
			font-weight: 500;
			color: black;
		}
	}
</style>
