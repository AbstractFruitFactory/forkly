<script lang="ts">
	let {
		instruction,
		index,
		isOpen = false,
		onToggle
	} = $props<{
		instruction: { text: string; [key: string]: any }
		index: number
		isOpen?: boolean
		onToggle: (index: number) => void
	}>()

	// Check if the instruction is long enough to need expansion
	const needsExpansion = instruction.text.length > 60

	function toggleExpand() {
		if (needsExpansion) {
			onToggle(index)
		}
	}
</script>

<div class="instruction-item" class:expanded={isOpen}>
	<button
		class="instruction-header"
		class:active={isOpen}
		class:expandable={needsExpansion}
		onclick={toggleExpand}
	>
		<div class="step-number">{index + 1}</div>
		<div class="instruction-content">
			<div class="instruction-title">
				{#if needsExpansion && !isOpen}
					{instruction.text.substring(0, 60)}...
				{:else}
					{instruction.text}
				{/if}
			</div>
		</div>
	</button>
</div>

<style lang="scss">
	.instruction-item {
		background: var(--color-neutral-darker);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: rgba(255, 255, 255, 0.03);
		}

		&.expanded {
			background: var(--color-neutral-dark);
		}
	}

	.instruction-header {
		width: 100%;
		display: flex;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			.step-number {
				opacity: 1;
				color: var(--color-primary);
			}
		}

		&.active {
			background: rgba(255, 255, 255, 0.02);

			.step-number {
				opacity: 1;
				color: var(--color-primary);
			}
		}
	}

	.step-number {
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-light);
		opacity: 0.7;
		min-width: 24px;
		line-height: 1.7;
		transition: all var(--transition-fast) var(--ease-in-out);
		transform: translateY(-4px);
	}

	.instruction-content {
		flex: 1;
	}
</style>
