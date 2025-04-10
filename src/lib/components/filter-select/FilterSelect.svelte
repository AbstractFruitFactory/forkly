<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'
	import type { Snippet } from 'svelte'

	type Item = $$Generic<{ label: string }>
	type SearchResult = $$Generic<{ label: string }>

	let {
		label,
		searchPlaceholder,
		onSearch,
		selected = $bindable<Item[]>([]),
		item
	}: {
		label: string
		searchPlaceholder: string
		onSearch: (query: string) => Promise<SearchResult[]>
		selected: Item[]
		item: Snippet<[searchResult: SearchResult, select: (item: Omit<Item, 'label'>) => void]>
	} = $props()

	let isOpen = $state(false)
	let searchQuery = $state('')
	let searchResults = $state<SearchResult[]>([])
	let isLoading = $state(false)
	let debounceTimeout = $state<ReturnType<typeof setTimeout> | null>(null)
	let selectedIndex = $state(-1)
	const DEBOUNCE_DELAY = 300

	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		searchQuery = target.value
		isLoading = true
		selectedIndex = -1

		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}

		debounceTimeout = setTimeout(async () => {
			searchResults = await onSearch(searchQuery)
			isLoading = false
			debounceTimeout = null
		}, DEBOUNCE_DELAY)
	}

	const toggleDropdown = () => {
		isOpen = !isOpen
		if (isOpen) {
			if (!searchResults.length) {
				onSearch('').then((results) => {
					searchResults = results
				})
			}
			selectedIndex = -1
		}
	}

	const handleSelect = (itemLabel: string, itemData: Omit<Item, 'label'>) => {
		const existing = selected.find((item) => item.label === itemLabel)
		const newData = { ...itemData, label: itemLabel } as Item

		if (existing && JSON.stringify(existing) === JSON.stringify(newData)) {
			selected = selected.filter((item) => item.label !== itemLabel)
		} else {
			selected = existing
				? selected.map((item) => (item.label === itemLabel ? newData : item))
				: [...selected, newData]
		}
		searchQuery = ''
		selectedIndex = -1
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!isOpen) return

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				selectedIndex = Math.max(selectedIndex - 1, -1)
				break
			case 'Enter':
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
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
</script>

<div class="filter-select">
	<button
		type="button"
		class="trigger-button"
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-label={label}
	>
		<span class="trigger-text">{label}</span>
	</button>

	<Dropdown bind:isOpen>
		<div class="search-container">
			<input
				type="text"
				class="search-input"
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				oninput={handleSearchInput}
				onkeydown={handleKeyDown}
			/>
		</div>
		<div class="items-container" role="listbox">
			{#if isLoading && searchResults.length === 0}
				<div class="helper-text">Loading...</div>
			{:else if !isLoading && searchResults.length === 0}
				<div class="helper-text">
					{searchQuery ? 'No items found' : 'Type to search'}
				</div>
			{/if}

			{#each searchResults as result, i}
				<div
					class="item"
					class:selected={i === selectedIndex}
					data-item-index={i}
					role="option"
					aria-selected={i === selectedIndex}
				>
					{@render item(result, (itemData) => handleSelect(result.label, itemData))}
				</div>
			{/each}
		</div>
	</Dropdown>
</div>

<style lang="scss">
	.filter-select {
		position: relative;
		display: inline-block;
	}

	.trigger-button {
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
		border-bottom: 1px solid var(--color-neutral);
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm);
		background-color: var(--color-neutral-dark);
		border: none;
		color: var(--color-white);
		font-size: var(--font-size-sm);

		&:focus {
			outline: none;
		}
	}

	.items-container {
		max-height: 300px;
		overflow-y: auto;
	}

	.item {
		padding: var(--spacing-xs) var(--spacing-sm);

		&:hover {
			background-color: var(--color-neutral);
		}

		&.selected {
			background-color: var(--color-neutral-dark);
		}
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-neutral-light);
		text-align: center;
		font-size: var(--font-size-sm);
	}
</style>
