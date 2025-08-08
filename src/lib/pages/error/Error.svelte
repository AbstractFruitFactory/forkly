<script lang="ts">
	let { status, error }: { status: number; error?: { message: string } } = $props()
</script>

<div class="error-container">
	<h1>{status}</h1>
	<p>{error?.message}</p>
</div>

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
</style>
