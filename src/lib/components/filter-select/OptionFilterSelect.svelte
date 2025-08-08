<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import type {  Snippet } from 'svelte'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'
	import Check from 'lucide-svelte/icons/circle-check'

	type Item = $$Generic<{ label: string; onClick: () => void }>

	let {
		options,
		selected = $bindable<Item>(),
		icon,
		buttonLabel,
		title
	}: {
		options: Item[]
		selected: Item
		icon?: Snippet
		buttonLabel?: Snippet
		title?: string
	} = $props()

	let isOpen = $state(false)
</script>

<BaseFilterSelect bind:selected {icon} bind:isOpen {title}>
	{#snippet label()}
		{#if buttonLabel}
			{@render buttonLabel()}
		{:else}
			{selected.label}
			<div class="arrow" class:open={isOpen}>
				<ChevronDown size={16} color="var(--color-text-on-surface)" />
			</div>
		{/if}
	{/snippet}

	{#snippet content(handleSelect, selected, item)}
		<div class="items">
			{#if options.length === 0}
				<div class="helper-text">No options available</div>
			{:else}
				{#each options as option, i}
					{#snippet _item()}
						<div class="option-row">
							<span class="label">{option.label}</span>
							{#if Array.isArray(selected) ? selected.some((it) => it.label === option.label) : selected.label === option.label}
								<span class="selected-mark" aria-hidden="true"><Check color="var(--color-success)" size={18} /></span>
							{/if}
						</div>
					{/snippet}

					{@render item?.(
						_item,
						() => {
							if (!Array.isArray(selected) && selected.label === option.label) {
								isOpen = false
								return
							}
							handleSelect(option.label, option)
							option.onClick()
							isOpen = false
						},
						i
					)}
				{/each}
			{/if}
		</div>
	{/snippet}
</BaseFilterSelect>

<style lang="scss">
	@use '$lib/styles/tokens' as *;
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
	}

	.option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: var(--spacing-sm);
	}

	.label {
		flex: 1;
	}

	.selected-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: var(--spacing-sm);
		color: var(--color-success);
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-text-on-surface);
		text-align: center;
		font-size: var(--font-size-sm);
	}
</style>
