<script lang="ts">
	let {
		options = [],
		selected = options[0] ?? '',
		onSelect = () => {}
	} = $props<{
		options: string[]
		selected?: string
		onSelect?: (option: string) => void
	}>()

	let currentSelected = $state(options[0])

	const handleSelect = (option: string) => {
		currentSelected = option
		onSelect(option)
	}
</script>

<div class="tab-select">
	{#each options as option}
		<button
			type="button"
			class="tab-button"
			class:active={currentSelected === option}
			onclick={() => handleSelect(option)}
		>
			{option}
		</button>
	{/each}
</div>

<style lang="scss">
	.tab-select {
		display: flex;
		gap: var(--spacing-xs);

		@media (max-width: 640px) {
			width: 100%;
			justify-content: space-between;
		}
	}

	.tab-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: none;
		background: none;
		color: var(--color-neutral-light);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: var(--border-radius-sm);

		&:hover {
			background-color: var(--color-neutral-dark);
		}

		&.active {
			background-color: var(--color-primary-dark);
			color: var(--color-white);
		}
	}
</style> 