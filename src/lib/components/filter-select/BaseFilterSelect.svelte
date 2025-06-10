<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import type { Snippet } from 'svelte'
	import Button from '../button/Button.svelte'
	import Drawer from '../drawer/Drawer.svelte'

	type Item = $$Generic<{ label: string }>

	let {
		label,
		selected = $bindable(),
		icon,
		content,
		isOpen = $bindable(false)
	}: {
		label: string | Snippet
		selected: Item | Item[]
		icon?: Snippet
		content: Snippet<[handleSelect: (itemLabel: string, itemData: Omit<Item, 'label'>) => void]>
		isOpen?: boolean
	} = $props()

	let selectedIndex = $state(-1)
	let drawerIsOpen = $state(false)
	let dropdownIsOpen = $state(false)

	const toggleDropdown = () => {
		drawerIsOpen = !drawerIsOpen
		dropdownIsOpen = !dropdownIsOpen
		if (drawerIsOpen || dropdownIsOpen) {
			selectedIndex = -1
		}
	}

	const handleSelect = (itemLabel: string, itemData: Omit<Item, 'label'>) => {
		const existing = Array.isArray(selected)
			? selected.find((item) => item.label === itemLabel)
			: selected.label === itemLabel
		const newData = { ...itemData, label: itemLabel } as Item

		if (existing) {
			selected = Array.isArray(selected)
				? selected.filter((item) => item.label !== itemLabel)
				: selected.label !== itemLabel
					? selected
					: (undefined as unknown as Item | Item[])
		} else {
			selected = Array.isArray(selected) ? [...selected, newData] : newData
		}
		selectedIndex = -1
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!drawerIsOpen && !dropdownIsOpen) return

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
				drawerIsOpen = false
				dropdownIsOpen = false
				break
		}
	}
</script>

<div class="filter-select">
	<Button variant="pill" onclick={toggleDropdown} size="sm">
		{@render icon?.()}
		{#if typeof label === 'string'}
			{label}
		{:else}
			{@render label()}
		{/if}
	</Button>

	<div class="mobile-only">
		<Drawer bind:isOpen={drawerIsOpen}>
			{@render content(handleSelect)}
		</Drawer>
	</div>

	<div class="desktop-only">
		<Dropdown bind:isOpen={dropdownIsOpen}>
			<div class="items-container" role="listbox" onkeydown={handleKeyDown}>
				{@render content(handleSelect)}
			</div>
		</Dropdown>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';
	.filter-select {
		position: relative;
		display: inline-block;
	}

	.items-container {
		max-height: 300px;
		overflow-y: auto;
	}

	.mobile-only {
		@include desktop {
			display: none;
		}
	}

	.desktop-only {
		@include tablet {
			display: none;
		}
	}
</style>
