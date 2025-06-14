<script lang="ts">
	let { name }: { name: string } = $props()
</script>

<a href={`/collection/${name}`} class="collection-card card">
	<div class="collection-content">
		<h3 class="collection-name">{name}</h3>
	</div>
</a>

<style lang="scss">
	.collection-card {
		display: block;
		background: var(--color-neutral);
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
		gap: 1rem;
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
</style>
