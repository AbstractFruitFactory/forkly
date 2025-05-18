<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import type { Snippet } from 'svelte'

	type Item = $$Generic<{ label: string }>
	type SearchResult = $$Generic<{ label: string }>

	let {
		label,
		searchPlaceholder,
		onSearch,
		selected = $bindable<Item[]>([]),
		item,
		icon,
		initialResults = [],
		isLoading: externalIsLoading = false
	}: {
		label: string
		searchPlaceholder: string
		onSearch: (query: string) => Promise<SearchResult[]>
		selected: Item[]
		item: Snippet<[searchResult: SearchResult, select: (item: Omit<Item, 'label'>) => void]>
		icon?: Snippet
		initialResults?: SearchResult[]
		isLoading?: boolean
	} = $props()

	let searchQuery = $state('')
	let searchResults = $state<SearchResult[]>(initialResults)
	let isLoading = $state(externalIsLoading)
	let debounceTimeout = $state<ReturnType<typeof setTimeout> | null>(null)
	const DEBOUNCE_DELAY = 300

	$effect(() => {
		isLoading = externalIsLoading
	})

	$effect(() => {
		if (initialResults.length > 0) {
			searchResults = initialResults
		}
	})

	const handleSearchInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		searchQuery = target.value
		isLoading = true

		if (debounceTimeout) {
			clearTimeout(debounceTimeout)
		}

		debounceTimeout = setTimeout(async () => {
			searchResults = await onSearch(searchQuery)
			isLoading = false
			debounceTimeout = null
		}, DEBOUNCE_DELAY)
	}
</script>

<BaseFilterSelect {label} bind:selected {icon}>
	{#snippet content(handleSelect)}
		<div class="search-container">
			<input
				type="text"
				class="search-input"
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				oninput={handleSearchInput}
			/>
		</div>
		<div class="items-container">
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
					data-item-index={i}
					role="option"
				>
					{@render item(result, (itemData) => handleSelect(result.label, itemData))}
				</div>
			{/each}
		</div>
	{/snippet}
</BaseFilterSelect>

<style lang="scss">
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

	.item {
		padding: var(--spacing-xs) var(--spacing-sm);

		&:hover {
			background-color: var(--color-neutral);
		}
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-neutral-light);
		text-align: center;
		font-size: var(--font-size-sm);
	}
</style> 