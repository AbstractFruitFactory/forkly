<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import { onMount, type Snippet } from 'svelte'
	import Button from '../button/Button.svelte'
	import Drawer from '../drawer/Drawer.svelte'
	import Check from 'lucide-svelte/icons/check'

	type Item = $$Generic<{ label: string }>

	let {
		label,
		selected = $bindable(),
		icon,
		count,
		content,
		isOpen = $bindable(false),
		title
	}: {
		label: string | Snippet
		selected: Item | Item[]
		icon?: Snippet
		count?: number
		content: Snippet<
			[
				handleSelect: (itemLabel: string, itemData: Omit<Item, 'label'>) => void,
				selected: Item | Item[],
				item?: (
					itemContent: Snippet,
					onclick: () => void,
					index: number
				) => ReturnType<Snippet>
			]
		>
		isOpen?: boolean
		title?: string
	} = $props()

	let selectedIndex = $state(-1)

	const toggleDropdown = () => {
		isOpen = !isOpen
		if (isOpen) {
			selectedIndex = -1
		}
	}

	const handleSelect = (itemLabel: string, itemData: Omit<Item, 'label'>) => {
		const newData = { ...itemData, label: itemLabel } as Item
		if (Array.isArray(selected)) {
			const exists = selected.some((item) => item.label === itemLabel)
			selected = exists
				? selected.filter((item) => item.label !== itemLabel)
				: [...selected, newData]
		} else {
			if (selected && selected.label === itemLabel) {
				return
			}
			selected = newData
		}
		selectedIndex = -1
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!isOpen) return

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				selectedIndex = Math.min(
					selectedIndex + 1,
					(Array.isArray(selected) ? selected.length : 1) - 1
				)
				break
			case 'ArrowUp':
				event.preventDefault()
				selectedIndex = Math.max(selectedIndex - 1, -1)
				break
			case 'Enter':
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < (Array.isArray(selected) ? selected.length : 1)) {
					const itemElement = document.querySelector(`[data-item-index="${selectedIndex}"]`)
					if (itemElement) {
						const selectButton = itemElement.querySelector('button') as HTMLButtonElement
						selectButton?.click()
					}
				}
				break
			case 'Escape':
				event.preventDefault()
				isOpen = false
				break
		}
	}

	onMount(() => {
		const checkIsMobile = () => {
			isMobile = window.innerWidth <= 768
		}

		checkIsMobile()

		const handleResize = () => {
			checkIsMobile()
		}
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	})

	let isMobile = $state(false)
</script>

<div class="filter-select">
	<Button variant="pill" color="neutral" onclick={toggleDropdown} size="md" fullHeight>
		{@render icon?.()}
		{#if typeof label === 'string'}
			{label}
		{:else}
			{@render label()}
		{/if}
		{#if count && count > 0}
			<span class="badge">{count}</span>
		{/if}
	</Button>

	{#if !isMobile}
		<Dropdown bind:isOpen nbrOfItems={Array.isArray(selected) ? selected.length : 1}>
			{#snippet dropdownContent(item)}
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<div class="items-container" role="listbox" onkeydown={handleKeyDown}>
					{@render content(handleSelect, selected, item)}
				</div>
			{/snippet}
		</Dropdown>
	{/if}
</div>

{#if isMobile}
	<Drawer bind:isOpen {title}>
		<div class="drawer-flex-col">
			<div class="drawer-scroll-content">
				{#snippet item(itemContent: Snippet, onclick: () => void, index: number)}
					<button type="button" class="item filter-select-item" {onclick}>
						{@render itemContent()}
					</button>
				{/snippet}
				{@render content(handleSelect, selected, item)}
			</div>
			<Button color="primary" fullWidth onclick={() => (isOpen = false)}>Show Results</Button>
		</div>
	</Drawer>
{/if}

<style lang="scss">
	@use '$lib/styles/tokens' as *;
	.filter-select {
		position: relative;
		display: inline-block;
		height: 100%;
	}

	.items-container {
		max-height: 300px;
		overflow-y: auto;
	}

	.drawer-flex-col {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.drawer-scroll-content {
		flex: 1 1 auto;
		overflow-y: auto;
	}

	.item {
		padding: var(--spacing-sm) var(--spacing-md);
		margin: var(--spacing-xs) 0;
		border-radius: var(--border-radius-xl);
		border: 1px solid var(--color-neutral-2);
		color: var(--color-text-on-surface);
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	:global(.filter-select-item) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		width: 100%;
	}

	:global(.filter-select-item .selected-mark) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
		color: var(--color-success);
	}

	:global(.filter-select-item .tag-item) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		width: 100%;
	}

	:global(.filter-select-item .ingredient-item) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.badge {
		position: absolute;
		top: -8px;
		right: 0px;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-primary);
		color: #fff;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
		z-index: 1;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		pointer-events: none;
	}
</style>
