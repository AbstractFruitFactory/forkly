<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'

	let {
		items = [],
		selectedItems = $bindable([]),
		name,
		colorMap = {},
		loadItems,
		label,
		onSelect = undefined,
		allowCustomItems = false
	} = $props<{
		items: readonly string[] | string[]
		selectedItems: string[]
		name: string
		label?: string
		colorMap?: Record<string, string>
		loadItems?: (query: string) => Promise<string[]> | string[]
		onSelect?: (item: string, selected: boolean) => void
		allowCustomItems?: boolean
	}>()

	let isOpen = $state(false)
	let searchQuery = $state('')
	let displayItems = $state<string[]>([...items])
	let debounceTimeout = $state<ReturnType<typeof setTimeout> | null>(null)
	const DEBOUNCE_DELAY = 300 // milliseconds

	const toggleDropdown = () => {
		isOpen = !isOpen
		if (isOpen) {
			updateDisplayItems(searchQuery)
		}
	}

	const closeDropdown = () => {
		isOpen = false
		searchQuery = ''
	}

	const toggleItem = (item: string) => {
		const isSelected = selectedItems.includes(item)
		if (isSelected) {
			selectedItems = selectedItems.filter((i: string) => i !== item)
		} else {
			selectedItems = [...selectedItems, item]
		}

		if (onSelect) {
			onSelect(item, !isSelected)
		}
	}

	const addCustomItem = () => {
		if (!searchQuery.trim()) return

		if (!selectedItems.includes(searchQuery.trim())) {
			selectedItems = [...selectedItems, searchQuery.trim()]

			if (onSelect) {
				onSelect(searchQuery.trim(), true)
			}
		}

		searchQuery = ''
		closeDropdown()
	}

	const isNotSelected = (item: string): boolean => !selectedItems.includes(item)

	const updateDisplayItems = async (query: string) => {
		if (loadItems) {
			const result = await loadItems(query)
			displayItems = result
		} else {
			displayItems = [...items]
		}
	}

	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		searchQuery = target.value

		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}

		debounceTimeout = setTimeout(async () => {
			await updateDisplayItems(searchQuery)
			debounceTimeout = null
		}, DEBOUNCE_DELAY)
	}

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && allowCustomItems && searchQuery.trim()) {
			event.preventDefault()
			addCustomItem()
		}
	}

	$effect(() => {
		displayItems = [...items]
	})
</script>

<div class="filter-selector">
	<button
		type="button"
		class="add-button"
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-label="Add item"
	>
		<span class="add-text">{label || '+ Add'}</span>
	</button>

	{#if isOpen}
		<div class="dropdown" use:clickOutside={{ callback: closeDropdown }}>
			<div class="search-container">
				<input
					type="text"
					class="search-input"
					placeholder="Search..."
					bind:value={searchQuery}
					oninput={handleSearchInput}
					onkeypress={handleKeyPress}
				/>
			</div>
			<div class="dropdown-items">
				{#each displayItems.filter(isNotSelected) as item (item)}
					<button type="button" class="dropdown-item" onclick={() => toggleItem(item)}>
						{item}
					</button>
				{/each}

				{#if allowCustomItems && searchQuery.trim() && !displayItems.includes(searchQuery.trim()) && !selectedItems.includes(searchQuery.trim())}
					<button type="button" class="dropdown-item custom-item" onclick={addCustomItem}>
						Create "{searchQuery.trim()}"
					</button>
				{/if}

				{#if searchQuery && displayItems.filter(isNotSelected).length === 0 && !(allowCustomItems && searchQuery.trim())}
					<div class="no-items">No items available</div>
				{/if}
			</div>
		</div>
	{/if}

	{#each selectedItems as item (item)}
		<input type="hidden" {name} value={item} />
	{/each}
</div>

<style lang="scss">
	.filter-selector {
		position: relative;
	}

	.selector-label {
		display: block;
		margin-bottom: var(--spacing-md);
		font-weight: 500;
		font-size: var(--spacing-lg);
	}

	.add-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		background-color: var(--color-neutral-dark);
		color: var(--color-white);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-neutral-light);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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
			color: var(--color-neutral-light);
		}

		&:hover {
			border-color: var(--color-primary);
			background: var(--color-neutral-darker);
		}

		&:focus {
			outline: none;
			box-shadow: 0 0 0 2px var(--color-primary-light);
		}
	}

	.search-container {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--color-neutral-light);
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm);
		background-color: var(--color-neutral-dark);
		border: 1px solid var(--color-neutral-light);
		border-radius: var(--border-radius-sm);
		color: var(--color-white);
		font-size: var(--font-size-sm);

		&:focus {
			outline: none;
			border-color: var(--color-primary);
		}
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-md);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 10;
		margin-top: var(--spacing-sm);
		overflow: hidden;
		border: 1px solid var(--color-neutral-light);
		min-width: 200px;
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

	.custom-item {
		font-style: italic;
		color: var(--color-primary-light);
		border-top: 1px dashed var(--color-neutral-light);
	}

	.no-items {
		padding: var(--spacing-md);
		color: var(--color-neutral-lightest);
		text-align: center;
		font-style: italic;
	}
</style>
