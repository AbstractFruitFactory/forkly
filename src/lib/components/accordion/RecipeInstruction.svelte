<script lang="ts">
	let { instruction, index } = $props<{
		instruction: { text: string; [key: string]: any }
		index: number
	}>()
</script>

<div class="instruction-item">
	<div class="instruction-header">
		<div class="step-number">{index + 1}</div>
		<div class="instruction-content">
			<div class="instruction-title">
				{instruction.text}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.instruction-item {
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: rgba(255, 255, 255, 0.03);
		}
	}

	.instruction-header {
		width: 100%;
		display: flex;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		background: rgba(255, 255, 255, 0.02);
		text-align: left;
	}

	.step-number {
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		min-width: var(--spacing-lg);
	}

	.instruction-content {
		flex: 1;
	}
</style>
