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
		actionButton
	}: {
		placeholder?: string
		isLoading?: boolean
		onSearch?: (query: string) => Promise<T[]> | T[]
		onSelect?: (suggestion: T) => void
		inputElement?: HTMLInputElement
		clearInput?: boolean
		actionButton?: { text: string; onClick: () => void }
	} = $props()

	let searchValue = $state('')
	let suggestions = $state<T[]>([])
	let showSuggestions = $state(false)
	let searchWrapper: HTMLDivElement

	const handleSearch = async (value: string) => {
		if (onSearch) {
			const result = onSearch(value)
			suggestions = result instanceof Promise ? await result : result
			showSuggestions = suggestions.length > 0
		} else {
			suggestions = []
			showSuggestions = false
		}
	}

	const handleSelect = (suggestion: T) => {
		if (clearInput) {
			searchValue = ''
		} else {
			searchValue = suggestion.name
		}

		showSuggestions = false
		onSelect?.(suggestion)
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			showSuggestions = false
		}
	}

	const handleClickOutside = (e: MouseEvent) => {
		if (searchWrapper && !searchWrapper.contains(e.target as Node)) {
			showSuggestions = false
		}
	}
</script>

<svelte:document onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="suggestion-search-wrapper" bind:this={searchWrapper}>
	<Autocomplete
		{isLoading}
		suggestions={showSuggestions && suggestions.length > 0 ? suggestions : []}
		onSelect={handleSelect}
	>
		<Search
			bind:value={searchValue}
			{placeholder}
			{actionButton}
			{isLoading}
			bind:inputElement
			onInput={handleSearch}
		/>
	</Autocomplete>
</div>

<style lang="scss">
	.suggestion-search-wrapper {
		width: 100%;
		position: relative;
	}
</style> 