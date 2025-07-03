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
		<Home size={28} color="black" />
		<span>Explore recipes</span>
	</a>
	<div class="add-recipe-float-wrapper">
		<a href={newRecipeHref} class="add-recipe-btn">
			<Plus size={32} color="white" />
		</a>
	</div>
	<a class="nav-item add-recipe-label-item">
		<span>Add recipe</span>
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
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--color-primary);
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
                        font-size: 13px;
                        font-weight: 500;
                        color: var(--color-neutral-dark);
                }
	}

	.add-recipe-float-wrapper {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: -24px;
		width: 64px;
		display: flex;
		justify-content: center;
	}

        .add-recipe-btn {
                background: #222;
                color: var(--color-text-on-surface);
		border-radius: 50%;
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: var(--border-width-normal) solid #ffe55c;
		transition: background 0.2s;
		-webkit-tap-highlight-color: transparent;
	}

	.add-recipe-btn:hover {
		background: #444;
	}

        .add-recipe-label-item {
                flex: 1 1 0;
                justify-content: flex-end;
                align-items: center;
                pointer-events: none;
                span {
                        color: var(--color-neutral-dark);
                }
        }
</style>
