<script lang="ts">
	import Dropdown from '../dropdown/Dropdown.svelte'

	let {
		items = [],
		selectedItems = $bindable([]),
		name,
		loadItems,
		label,
		onSelect = undefined,
		allowCustomItems = false
	} = $props<{
		items: readonly string[] | string[]
		selectedItems: string[]
		name: string
		label?: string
		loadItems?: (query: string) => Promise<string[]> | string[]
		onSelect?: (item: string, selected: boolean) => void
		allowCustomItems?: boolean
	}>()

	let isOpen = $state(false)
	let searchQuery = $state('')
	let displayItems = $state<string[]>([...items])
	let debounceTimeout = $state<ReturnType<typeof setTimeout> | null>(null)
	let isLoading = $state(false)
	const DEBOUNCE_DELAY = 300 // milliseconds

	const toggleDropdown = () => {
		isOpen = !isOpen
		if (isOpen) {
			updateDisplayItems(searchQuery)
		}
	}

	const handleSelect = (item: string) => {
		if (!selectedItems.includes(item)) {
			selectedItems = [...selectedItems, item]
			if (onSelect) {
				onSelect(item, true)
			}
		}
		searchQuery = ''
	}

	const handleCustomItemSelect = () => {
		if (!searchQuery.trim() || !allowCustomItems) return
		handleSelect(searchQuery.trim())
	}

	const updateDisplayItems = async (query: string) => {
		if (loadItems) {
			const result = await loadItems(query)
			displayItems = result.filter((item: string) => !selectedItems.includes(item))
		} else {
			displayItems = items.filter((item: string) => !selectedItems.includes(item))
		}
		isLoading = false
	}

	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		searchQuery = target.value
		isLoading = true

		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}

		debounceTimeout = setTimeout(async () => {
			await updateDisplayItems(searchQuery)
			debounceTimeout = null
		}, DEBOUNCE_DELAY)
	}

	$effect(() => {
		displayItems = items.filter((item: string) => !selectedItems.includes(item))
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

	<div class="dropdown-container">
		<Dropdown bind:isOpen>
			<div class="search-container">
				<input
					type="text"
					class="search-input"
					placeholder="Search..."
					bind:value={searchQuery}
					oninput={handleSearchInput}
				/>
			</div>
			<div class="dropdown-items">
				{#if isLoading && displayItems.length === 0}
					<div class="search-helper-text">Loading...</div>
				{:else if !isLoading && displayItems.length === 0}
					<div class="search-helper-text">
						{searchQuery ? 'No items available' : 'Type to search'}
					</div>
				{/if}

				{#each displayItems as item}
					<button type="button" class="dropdown-item" onclick={() => handleSelect(item)}>
						{item}
					</button>
				{/each}

				{#if allowCustomItems && searchQuery.trim() && !displayItems.includes(searchQuery.trim())}
					<button type="button" class="dropdown-item custom-item" onclick={handleCustomItemSelect}>
						Create "{searchQuery.trim()}"
					</button>
				{/if}
			</div>
		</Dropdown>
	</div>

	{#each selectedItems as item (item)}
		<input type="hidden" {name} value={item} />
	{/each}
</div>

<style lang="scss">
	.filter-selector {
		position: relative;
	}

	.dropdown-container {
		position: relative;
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

	.search-helper-text {
		padding: var(--spacing-xs) var(--spacing-md);
		color: var(--color-neutral-lightest);
		font-size: var(--font-size-sm);
		text-align: center;
	}
</style>
