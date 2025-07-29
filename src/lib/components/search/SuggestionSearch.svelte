<script lang="ts">
	import Search from './Search.svelte'
	import Autocomplete from '../autocomplete/Autocomplete.svelte'

	type T = $$Generic<{ name: string }>

	let {
		placeholder = 'Search...',
		isLoading = false,
		onSearch,
		onSelect,
		inputElement = $bindable(),
		clearInput = false,
		actionButton,
		formName,
		disabled = false,
		searchValue = $bindable(''),
		showSearchIcon = true,
		minSearchLength = 3,
		useId = false,
		onInput
	}: {
		placeholder?: string
		isLoading?: boolean
		onSearch: (query: string) => Promise<T[]> | T[]
		onSelect?: (suggestion: T) => void
		inputElement?: HTMLInputElement
		clearInput?: boolean
		actionButton?: { text: string; onClick: () => void }
		formName?: string
		disabled?: boolean
		searchValue?: string
		showSearchIcon?: boolean
		minSearchLength?: number
		useId?: boolean
		onInput?: (value: string) => void
	} = $props()

	let searchWrapper: HTMLDivElement

	const loadSuggestions = async (query: string) =>
		query.length < minSearchLength ? [] : await onSearch(query)

	const handleSelect = (suggestion: T) => {
		if (clearInput) {
			searchValue = ''
		} else {
			searchValue = useId ? (suggestion as any).id : suggestion.name
		}

		onSelect?.(suggestion)
	}

	const handleSearchInput = (value: string) => {
		onInput?.(value)
	}

	let hasHighlight = $state(false)
</script>

<div class="suggestion-search-wrapper" bind:this={searchWrapper}>
	<Autocomplete {loadSuggestions} {isLoading} onSelect={handleSelect} bind:hasHighlight>
		{#snippet input(onAutocompleteInput)}
			<Search
				bind:value={searchValue}
				{placeholder}
				{actionButton}
				{isLoading}
				bind:inputElement
				onInput={(value) => {
					handleSearchInput(value)
					onAutocompleteInput({ target: { value } })
				}}
				onConfirm={() => {
					if (hasHighlight) return
					actionButton?.onClick()
				}}
				{formName}
				{disabled}
				{showSearchIcon}
			/>
		{/snippet}
	</Autocomplete>
</div>

<style lang="scss">
	.suggestion-search-wrapper {
		width: 100%;
		position: relative;
	}
</style>
