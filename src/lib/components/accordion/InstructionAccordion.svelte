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

<div class="instruction-item">
	<div class="step-number">{index + 1}</div>

	<div class="instruction-content">
		<button
			class="instruction-header"
			class:active={isOpen}
			class:expandable={needsExpansion}
			onclick={toggleExpand}
		>
			<div class="instruction-title">
				{#if needsExpansion && !isOpen}
					{instruction.text.substring(0, 60)}...
				{:else}
					{instruction.text}
				{/if}
			</div>

			{#if needsExpansion}
				<svg class="chevron-icon" class:rotated={isOpen} width="16" height="16" viewBox="0 0 24 24">
					<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
				</svg>
			{/if}
		</button>
	</div>
</div>

<style>
	.instruction-item {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-primary);
		color: white;
		border-radius: var(--border-radius-full);
		font-weight: var(--font-weight-semibold);
		flex-shrink: 0;
		margin-top: var(--spacing-xs);
	}

	.instruction-content {
		flex: 1;
		border-radius: var(--border-radius-md);
		overflow: hidden;
	}

	.instruction-header {
		display: flex;
		gap: var(--spacing-md);
		width: 100%;
		padding: var(--spacing-md);
		background: var(--color-neutral-darker);
	}

	.instruction-header.expandable {
		transition: background-color 0.2s ease;
	}

	.instruction-header.expandable:hover {
		background: var(--color-neutral-darkest);
	}

	.instruction-title {
		flex: 1;
		color: var(--color-neutral-light);
		font-weight: var(--font-weight-medium);
		text-align: left;
	}

	.chevron-icon {
		fill: var(--color-neutral-light);
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.chevron-icon.rotated {
		transform: rotate(180deg);
	}
</style>
