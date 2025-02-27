<script lang="ts">
	let {
		text,
		onRemove,
		color
	}: {
		text: string
		onRemove?: () => void
		color: string
	} = $props()
</script>

<div class="pill" style:--pill-color={color} style:--pill-color-dark={color + '99'}>
	<span class="pill-content">
		<span class="pill-text">
			{text}
		</span>
		{#if onRemove}
			<button type="button" class="remove-button" onclick={onRemove} aria-label="Remove {text}">
				×
			</button>
		{/if}
	</span>
</div>

<style lang="scss">
	.pill {
		position: relative;
		user-select: none;
		display: inline-flex;
	}

	.pill-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background-color: var(--pill-color-dark, var(--color-primary-dark));
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		transition: all 0.2s ease;
		border: 1px solid var(--pill-color, var(--color-primary));
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		color: white;
	}

	.pill-text {
		font-size: var(--font-size-sm);
		font-weight: 500;
		line-height: 1;
		display: flex;
		align-items: center;
	}

	.remove-button {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.2em;
		line-height: 0.8;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		border-radius: 50%;
		width: 16px;
		height: 16px;
	}

	.remove-button:hover {
		background-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}
</style>
