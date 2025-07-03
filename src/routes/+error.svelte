<script>
	import { page } from '$app/state'
</script>

<div class="error-container">
	<h1>{page.status}: {page.error?.message}</h1>
	<p>Sorry, something went wrong.</p>
	<a href="/">Go back home</a>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
		padding: var(--spacing-md);
	}

	h1 {
		font-size: var(--spacing-xl);
		margin-bottom: var(--spacing-md);
		color: var(--color-error);
	}

	p {
		margin-bottom: var(--spacing-lg);
		color: var(--color-neutral);
	}

	a {
		color: var(--color-primary);
		text-decoration: none;
		padding: var(--spacing-xs) var(--spacing-md);
		border: var(--border-width-thin) solid var(--color-primary);
		border-radius: var(--border-radius-md);
		transition: all var(--transition-fast) var(--ease-in-out);
	}

        a:hover {
                background-color: var(--color-primary);
                color: var(--color-text-on-primary);
        }
</style>
