<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import Search from '../search/Search.svelte'
	import type { Snippet } from 'svelte'
	import { crossfade } from 'svelte/transition'
	import { flip } from 'svelte/animate'

	type Item = $$Generic<{ label: string }>
	type SearchResult = $$Generic<{ label: string }>

	let {
		buttonLabel,
		searchPlaceholder,
		onSearch,
		selected = $bindable<Item[]>([]),
		item,
		icon,
		initialResults = [],
		isLoading: externalIsLoading = false
	}: {
		buttonLabel: string
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

	const [send, receive] = crossfade({})

	$effect(() => {
		isLoading = externalIsLoading
	})

	$effect(() => {
		if (initialResults.length > 0) {
			searchResults = initialResults
		}
	})

	const handleSearchInput = (value: string) => {
		searchQuery = value
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

	const displayedResults = $derived(
		searchResults.filter((result) => !selected.some((item) => item.label === result.label))
	)
</script>

<BaseFilterSelect bind:selected {icon}>
	{#snippet label()}
		<div class="label">
			{buttonLabel}
		</div>
	{/snippet}

	{#snippet content(handleSelect)}
		<div class="search-container">
			<Search
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				onInput={handleSearchInput}
				roundedCorners
				{isLoading}
			/>
		</div>

		{#if isLoading && searchResults.length === 0}
			<div class="helper-text">Loading...</div>
		{:else if !isLoading && searchResults.length === 0}
			<div class="helper-text">
				{searchQuery ? 'No items found' : 'Type to search'}
			</div>
		{/if}

		{#each displayedResults as result, i (result.label)}
			<div
				class="item"
				data-item-index={i}
				role="option"
				in:receive={{ key: result.label }}
				out:send={{ key: result.label }}
				animate:flip={{ duration: 200 }}
			>
				{@render item(result, (itemData) => {
					handleSelect(result.label, itemData)
				})}
			</div>
		{/each}

		<div class="selected-items">
			{#each selected as item (item.label)}
				<div
					class="selected-item"
					in:receive={{ key: item.label }}
					out:send={{ key: item.label }}
					animate:flip={{ duration: 200 }}
				>
					<span class="pill-label">{item.label}</span>
					<button
						class="remove-button"
						onclick={() => (selected = selected.filter((i) => i.label !== item.label))}
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/snippet}
</BaseFilterSelect>

<style lang="scss">
	@import '$lib/global.scss';

	.search-container {
		padding: var(--spacing-sm);
	}

	.label {
		@include tablet {
			display: none;
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

	.selected-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);
	}

	.selected-item {
		display: flex;
		align-items: center;
		background-color: var(--color-neutral);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
	}

	.pill-label {
		margin-right: var(--spacing-xs);
	}

	.remove-button {
		cursor: pointer;
		font-size: var(--font-size-lg);
	}
</style>
