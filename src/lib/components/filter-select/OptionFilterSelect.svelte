<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import type { Snippet } from 'svelte'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'

	type Item = $$Generic<{ label: string }>

	let {
		label,
		options,
		selected = $bindable<Item>(),
		item,
		icon
	}: {
		label: string
		options: Item[]
		selected: Item
		item: Snippet<[option: Item, select: (item: Omit<Item, 'label'>) => void]>
		icon?: Snippet
	} = $props()

	let isOpen = $state(false)
</script>

<BaseFilterSelect bind:selected {icon} bind:isOpen>
	{#snippet label()}
		{selected.label}
		<div class="arrow" class:open={isOpen}>
			<ChevronDown size={16} />
		</div>
	{/snippet}

	{#snippet content(handleSelect)}
		<div class="items-container">
			{#if options.length === 0}
				<div class="helper-text">No options available</div>
			{:else}
				{#each options as option, i}
					<div class="item" data-item-index={i}>
						{@render item(option, (itemData) => {
							handleSelect(option.label, itemData)
							isOpen = false
						})}
					</div>
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

	.item {
		padding: var(--spacing-xs) var(--spacing-sm);

		&:hover {
			background-color: var(--color-neutral);
		}

		@include tablet {
			border: 1px solid var(--color-neutral);
			border-radius: var(--border-radius-xl);
			margin: var(--spacing-md) var(--spacing-sm);
		}
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-neutral-light);
		text-align: center;
		font-size: var(--font-size-sm);
	}
</style>
