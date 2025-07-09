<script lang="ts">
	import BaseFilterSelect from './BaseFilterSelect.svelte'
	import Search from '../search/Search.svelte'
	import FilterActionButton from '../tag-filter/FilterActionButton.svelte'
	import type { Snippet } from 'svelte'
	import { crossfade } from 'svelte/transition'
	import { flip } from 'svelte/animate'

	type Item = $$Generic<{ label: string; include?: boolean }>
	type SearchResult = $$Generic<{ label: string }>

	let {
		buttonLabel,
		searchPlaceholder,
		onSearch,
		selected = $bindable<Item[]>([]),
		filterItem,
		icon,
		initialResults = [],
		isLoading: externalIsLoading = false,
		title
	}: {
		buttonLabel: string
		searchPlaceholder: string
		onSearch: (query: string) => Promise<SearchResult[]>
		selected: Item[]
		filterItem: Snippet<[searchResult: SearchResult, select: (item: Omit<Item, 'label'>) => void]>
		icon?: Snippet
		initialResults?: SearchResult[]
		isLoading?: boolean
		title?: string
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

	const filteredResults = $derived(
		searchResults.filter((result) => !selected.some((item) => item.label === result.label))
	)
</script>

<BaseFilterSelect bind:selected {icon} {title} count={selected.length}>
	{#snippet label()}
		<div class="label">
			{buttonLabel}
		</div>
	{/snippet}

	{#snippet content(handleSelect, item)}
		<div class="search-container">
			<Search
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				onInput={handleSearchInput}
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

		{#each filteredResults as result, i (result.label)}
			<div
				class="item mobile-only"
				data-item-index={i}
				role="option"
				in:receive={{ key: result.label }}
				out:send={{ key: result.label }}
				animate:flip={{ duration: 200 }}
			>
				{#snippet _item()}
					{@render filterItem(result, (itemData) => {
						handleSelect(result.label, itemData)
					})}
				{/snippet}
				
				{@render item?.(_item)}
			</div>
		{/each}

		{#each searchResults as result, i}
			<div class="item desktop-only" data-item-index={i} role="option">
				{#snippet _item()}
					{@render filterItem(result, (itemData) => handleSelect(result.label, itemData))}
				{/snippet}
				{@render item?.(_item)}
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
					<FilterActionButton
						isSelected
						onClick={() => {}}
						variant={item.include === false ? 'exclude' : 'include'}
					/>
					<span class="pill-label">{item.label}</span>
					<button class="remove-button" onclick={() => handleSelect(item.label, item)}> × </button>
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
		color: var(--color-text-on-surface);
		@include tablet {
			display: none;
		}
	}

	.helper-text {
		padding: var(--spacing-sm);
		color: var(--color-text-on-surface);
		text-align: center;
		font-size: var(--font-size-sm);
	}

	.selected-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);

		@include desktop {
			display: none;
		}
	}

	.selected-item {
		display: flex;
		align-items: center;
		background-color: var(--color-neutral);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
		gap: var(--spacing-xs);
	}

	.pill-label {
		margin-right: var(--spacing-xs);
	}

	.remove-button {
		cursor: pointer;
		font-size: var(--font-size-lg);
	}

	.desktop-only {
		display: none;

		@include desktop {
			display: block;
		}
	}

	.mobile-only {
		display: block;

		@include desktop {
			display: none;
		}
	}
</style>
