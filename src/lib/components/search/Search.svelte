<script lang="ts">
	import Input from '../input/Input.svelte'
	import Autocomplete from '../autocomplete/Autocomplete.svelte'

	type T = $$Generic<{ name: string }>

	let {
		placeholder = 'Search...',
		isLoading = false,
		onSearch,
		onSelect,
		inputElement = $bindable()
	}: {
		placeholder?: string
		isLoading?: boolean
		onSearch?: (query: string) => Promise<T[]> | T[]
		onSelect?: (suggestion: T) => void
		inputElement?: HTMLInputElement
	} = $props()

	let searchValue = $state('')
	let suggestions = $state<T[]>([])
	let showSuggestions = $state(false)
	let searchWrapper: HTMLDivElement

	const handleInput = async (e: Event) => {
		const value = (e.target as HTMLInputElement).value
		searchValue = value

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
		searchValue = suggestion.name
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

<div class="search-wrapper" bind:this={searchWrapper}>
	<Autocomplete
		{isLoading}
		suggestions={showSuggestions && suggestions.length > 0 ? suggestions : []}
		onSelect={handleSelect}
	>
		<div class="search-input-container">
			<svg
				class="search-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<Input>
				<input
					type="search"
					{placeholder}
					value={searchValue}
					oninput={handleInput}
					aria-label="Search"
					bind:this={inputElement}
				/>
			</Input>
		</div>
	</Autocomplete>
</div>

<style lang="scss">
	.search-wrapper {
		width: 100%;
		position: relative;
	}

	.search-input-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-md);
		color: var(--color-neutral);
		pointer-events: none;
		z-index: 1;
	}

	:global(.search-input-container input) {
		padding-left: calc(var(--spacing-xl) + var(--spacing-xs)) !important;
	}
</style>
