<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'
	import Pill from '$lib/components/pill/Pill.svelte'

	let {
		items = [],
		selectedItems = $bindable([]),
		name,
		colorMap = {}
	} = $props<{
		items: readonly string[] | string[]
		selectedItems: string[]
		name: string
		colorMap?: Record<string, string>
	}>()

	let isOpen = $state(false)

	const toggleDropdown = () => {
		isOpen = !isOpen
	}

	const closeDropdown = () => {
		isOpen = false
	}

	const toggleItem = (item: string) => {
		if (selectedItems.includes(item)) {
			selectedItems = selectedItems.filter((i: string) => i !== item)
		} else {
			selectedItems = [...selectedItems, item]
		}
	}

	const removeItem = (item: string) => {
		selectedItems = selectedItems.filter((i: string) => i !== item)
	}

	const isNotSelected = (item: string): boolean => !selectedItems.includes(item)

	$inspect(colorMap)
</script>

<div class="pill-selector">
	<div class="selected-pills">
		{#each selectedItems as item (item)}
			<Pill text={item} onRemove={() => removeItem(item)} color={colorMap[item] || undefined} />
		{/each}

		<button
			type="button"
			class="add-button"
			onclick={toggleDropdown}
			aria-expanded={isOpen}
			aria-label="Add item"
		>
			<span class="add-icon">+</span>
			<span class="add-text">Add</span>
		</button>
	</div>

	{#if isOpen}
		<div class="dropdown" use:clickOutside={{ callback: closeDropdown }}>
			<div class="dropdown-items">
				{#each items.filter(isNotSelected) as item (item)}
					<button type="button" class="dropdown-item" onclick={() => toggleItem(item)}>
						{item}
					</button>
				{/each}

				{#if items.filter(isNotSelected).length === 0}
					<div class="no-items">No more items available</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hidden inputs to submit the selected values -->
	{#each selectedItems as item (item)}
		<input type="hidden" {name} value={item} />
	{/each}
</div>

<style lang="scss">
	.pill-selector {
		position: relative;
		margin-bottom: var(--spacing-md);
	}

	.selector-label {
		display: block;
		margin-bottom: var(--spacing-md);
		font-weight: 500;
		font-size: var(--spacing-lg);
	}

	.selected-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.add-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--color-primary-light);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		border: 1px solid var(--color-primary);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

		.add-icon {
			font-size: 1.2em;
			line-height: 1;
			display: flex;
			align-items: center;
		}

		.add-text {
			line-height: 1;
			display: flex;
			align-items: center;
		}

		&:hover {
			background-color: var(--color-primary-dark);
			transform: translateY(-1px);
		}

		&:focus {
			outline: none;
			box-shadow: 0 0 0 2px var(--color-primary-light);
		}
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-md);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 10;
		margin-top: var(--spacing-sm);
		overflow: hidden;
		border: 1px solid var(--color-neutral-light);
	}

	.dropdown-items {
		max-height: 200px;
		overflow-y: auto;
		padding: var(--spacing-xs) 0;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
		color: var(--color-white);
		font-weight: 500;

		&:hover {
			background-color: var(--color-primary-dark);
		}

		&:focus {
			outline: none;
			background-color: var(--color-primary);
		}
	}

	.no-items {
		padding: var(--spacing-md);
		color: var(--color-neutral-lightest);
		text-align: center;
		font-style: italic;
	}
</style>
