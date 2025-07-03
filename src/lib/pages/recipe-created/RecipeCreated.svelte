<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'

	let { recipeId }: { recipeId: string } = $props()
</script>

<div class="success-container">
	<div class="success-content card">
		<div class="success-icon">✓</div>
		<h1>Recipe Created!</h1>
		<p>Your recipe has been successfully created.</p>
		<div class="button-group">
			<Button href="/recipe/{recipeId}" fullWidth color="primary">View Recipe</Button>
			<Button href="/new" fullWidth color="neutral" variant="border">Create Another</Button>
			<Button href="/" fullWidth color="neutral" variant="border">Go Home</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.success-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - var(--spacing-2xl));
		padding: var(--spacing-lg);
	}

	.success-content {
		text-align: center;

		max-width: 500px;
		width: 100%;
	}

	.success-icon {
		font-size: var(--spacing-2xl);
		color: var(--color-success);
		margin-bottom: var(--spacing-md);
	}

	h1 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--spacing-xl);
	}

	p {
		margin: 0 0 var(--spacing-lg);
		color: var(--color-neutral);
		font-size: var(--spacing-md);
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		max-width: 300px;
		margin: 0 auto;
	}

	.button {
		display: block;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		text-decoration: none;
		font-weight: 500;
		transition: all var(--transition-fast) var(--ease-in-out);

                &.primary {
                        background: var(--color-primary);
                        color: var(--color-text-on-primary);

			&:hover {
				background: var(--color-primary-dark);
				transform: translateY(calc(var(--spacing-xs) * -1));
			}
		}

		&.secondary {
			background: transparent;
			border: var(--border-width-thin) solid var(--color-neutral);
			color: var(--color-neutral);

			&:hover {
				border-color: var(--color-primary);
				color: var(--color-primary);
			}
		}
	}

	@media (max-width: 640px) {
		.success-content {
			padding: var(--spacing-lg);
		}
	}
</style>
