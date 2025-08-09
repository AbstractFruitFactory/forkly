<script lang="ts">
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	let { children } = $props()
</script>

<div class="wrapper" in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
	<h1 style:text-align="center">Join to like, save, and organize recipes</h1>
	<div class="auth-form">
		{@render children()}
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.wrapper {
		@include mobile {
			height: calc(100dvh - 6.5rem);
			align-items: center;
			padding: var(--spacing-md);
			margin-top: 0;
		}
	}
	.auth-form {
		display: flex;
		justify-content: center;
		margin-top: 200px;

		@include mobile {
			margin-top: var(--spacing-4xl);
		}
	}
</style>
