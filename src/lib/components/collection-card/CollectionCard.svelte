<script lang="ts">
	let { name, count = 0 }: { name: string; count?: number } = $props()
</script>

<a href={`/collection/${name}`} class="collection-card card">
	<div class="collection-content">
		<h3 class="collection-name">{name}</h3>
		<div class="collection-count">{count} {count === 1 ? 'recipe' : 'recipes'}</div>
	</div>
</a>

<style lang="scss">
	.collection-card {
		display: block;
		
		height: 100%;
		width: 100%;

		transition:
			transform var(--transition-fast) var(--ease-out),
			box-shadow var(--transition-fast) var(--ease-out);

		&:hover {
			transform: translateY(calc(var(--spacing-xs) * -1));
			box-shadow: var(--shadow-lg);
		}
	}

	.collection-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 0.5rem;
		padding: 1.5rem;
	}

	.collection-icon {
		background: var(--color-neutral-dark);
		border-radius: 50%;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.collection-name {
		margin: 0;
		font-size: var(--font-size-lg);
		text-align: center;
	}

	.collection-count {
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
	}
</style>
