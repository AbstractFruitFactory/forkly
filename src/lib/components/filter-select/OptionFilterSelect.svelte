<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import type { Snippet } from 'svelte'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'

	type Item = $$Generic<{ label: string; onClick: () => void }>

	let {
		options,
		selected = $bindable<Item>(),
		icon
	}: {
		options: Item[]
		selected: Item
		icon?: Snippet
	} = $props()

	let isOpen = $state(false)
</script>

<BaseFilterSelect bind:selected {icon} bind:isOpen>
	{#snippet label()}
		{selected.label}
		<div class="arrow" class:open={isOpen}>
			<ChevronDown size={16} color="var(--color-text-on-surface)" />
		</div>
	{/snippet}

	{#snippet content(handleSelect, item)}
		<div class="items">
			{#if options.length === 0}
				<div class="helper-text">No options available</div>
			{:else}
				{#each options as option}
					{#snippet _item()}
						{option.label}
					{/snippet}
					
					{@render item?.(_item, () => {
						handleSelect(option.label, option)
						option.onClick()
						isOpen = false
					})}
				{/each}
			{/if}
		</div>
	{/snippet}
</BaseFilterSelect>

<style lang="scss">
	@import '$lib/global.scss';
	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease;

		&.open {
			transform: rotate(180deg);
		}
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) 0;
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-text-on-surface);
		text-align: center;
		font-size: var(--font-size-sm);
	}
</style>
