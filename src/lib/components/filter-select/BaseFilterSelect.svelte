<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import { onMount, type Snippet } from 'svelte'
	import Button from '../button/Button.svelte'
	import Drawer from '../drawer/Drawer.svelte'

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
				item?: (itemContent: Snippet) => ReturnType<Snippet>
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
	<Button variant="pill" color="neutral" onclick={toggleDropdown} size="sm">
		{@render icon?.()}
		{#if typeof label === 'string'}
			{label}
		{:else}
			{@render label()}
		{/if}
		{#if count}
			<span class="count">({count})</span>
		{/if}
	</Button>

	{#if !isMobile}
		<Dropdown bind:isOpen>
			{#snippet dropdownContent(item)}
				<div class="items-container" role="listbox" onkeydown={handleKeyDown}>
					{@render content(handleSelect, item)}
				</div>
			{/snippet}
		</Dropdown>
	{/if}
</div>

{#if isMobile}
	<Drawer bind:isOpen {title}>
		<div class="drawer-flex-col">
			<div class="drawer-scroll-content">
				{@render content(handleSelect)}
			</div>
			<Button color="primary" fullWidth onclick={() => (isOpen = false)}>Show Results</Button>
		</div>
	</Drawer>
{/if}

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

	.drawer-flex-col {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.drawer-scroll-content {
		flex: 1 1 auto;
		overflow-y: auto;
	}
</style>
