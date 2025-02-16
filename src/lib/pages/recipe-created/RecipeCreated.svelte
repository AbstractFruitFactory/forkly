<script lang="ts">
	let { recipeId }: { recipeId: string } = $props()
</script>

<div class="success-container">
	<div class="success-content">
		<div class="success-icon">✓</div>
		<h1>Recipe Created!</h1>
		<p>Your recipe has been successfully created.</p>
		<div class="button-group">
			<a href="/recipe/{recipeId}" class="button primary">View Recipe</a>
			<a href="/new" class="button secondary">Create Another</a>
			<a href="/" class="button secondary">Go Home</a>
		</div>
	</div>
</div>

<style lang="scss">
	.success-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 80px);
		padding: 2rem;
	}

	.success-content {
		background: var(--color-neutral-dark);
		padding: 3rem;
		border-radius: 12px;
		text-align: center;
		box-shadow: var(--shadow-md);
		max-width: 500px;
		width: 100%;
	}

	.success-icon {
		font-size: 48px;
		color: var(--color-success);
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0 0 1rem;
		font-size: 2rem;
	}

	p {
		margin: 0 0 2rem;
		color: var(--color-neutral);
		font-size: 1.1rem;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 300px;
		margin: 0 auto;
	}

	.button {
		display: block;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;

		&.primary {
			background: var(--color-primary);
			color: white;

			&:hover {
				background: var(--color-primary-dark);
				transform: translateY(-1px);
			}
		}

		&.secondary {
			background: transparent;
			border: 1px solid var(--color-neutral);
			color: var(--color-neutral);

			&:hover {
				border-color: var(--color-primary);
				color: var(--color-primary);
			}
		}
	}

	@media (max-width: 640px) {
		.success-content {
			padding: 2rem;
		}
	}
</style>
