<script>
	import { page } from '$app/state'
	import { setSlots } from './+layout.svelte'

	setSlots({
		content
	})
</script>

{#snippet content()}
	<div class="error-container">
		<h1>{page.status}: {page.error?.message}</h1>
		<p>Sorry, something went wrong.</p>
		<a href="/">Go back home</a>
	</div>
{/snippet}

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;
		text-align: center;
		padding: var(--spacing-md);
	}

	h1 {
		font-size: var(--spacing-xl);
		margin-bottom: var(--spacing-md);
		color: var(--color-error);
		font-family: unset;
	}

	p {
		margin-bottom: var(--spacing-lg);
		color: var(--color-neutral);
	}

	a {
		text-decoration: none;
		padding: var(--spacing-xs) var(--spacing-md);
		border: var(--border-width-thin) solid var(--color-primary);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast) var(--ease-in-out);
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
	}
</style>
