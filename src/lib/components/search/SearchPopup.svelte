<script lang="ts">
	import { onMount } from 'svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import SearchRecipeCard from '$lib/components/search/SearchRecipeCard.svelte'
	import type { DietType } from '$lib/types'

	let {
		isOpen = false,
		onClose,
		onSearch,
		onSelectRecipe,
		onShowAllResults,
		isSearchLoading = false,
		searchResults = [],
		isResultsLoading = false
	}: {
		isOpen: boolean
		onClose: () => void
		onSearch?: (query: string) => void
		onSelectRecipe?: (recipe: { name: string }) => void
		onShowAllResults?: (query: string) => void
		isSearchLoading?: boolean
		searchResults?: Array<{
			id: string
			title: string
			imageUrl?: string
			cookTime?: number
			diets?: DietType[]
		}>
		isResultsLoading?: boolean
	} = $props()

	let searchInput: HTMLInputElement
	let searchQuery = $state('')
	let searchTimeout: ReturnType<typeof setTimeout> | null = null
	let showLoadingTimeout: ReturnType<typeof setTimeout> | null = null
	let shouldShowLoading = $state(false)

	onMount(() => {
		if (isOpen) {
			setTimeout(() => {
				searchInput.focus()
			}, 100)
		}
	})

	$effect(() => {
		if (isOpen && searchInput) {
			setTimeout(() => {
				searchInput.focus()
			}, 100)
		}

		if (!isOpen) {
			searchQuery = ''
			shouldShowLoading = false
			if (showLoadingTimeout) {
				clearTimeout(showLoadingTimeout)
			}
		}
	})

	$effect(() => {
		if (isResultsLoading) {
			if (showLoadingTimeout) {
				clearTimeout(showLoadingTimeout)
			}

			showLoadingTimeout = setTimeout(() => {
				shouldShowLoading = true
			}, 300)
		} else {
			if (showLoadingTimeout) {
				clearTimeout(showLoadingTimeout)
			}
			shouldShowLoading = false
		}
	})

	const handleSearch = (query: string) => {
		searchQuery = query

		if (searchTimeout) {
			clearTimeout(searchTimeout)
		}

		if (query.trim().length > 0) {
			searchTimeout = setTimeout(() => {
				onSearch?.(query)
			}, 300)
		}
	}

	const handleSelectRecipe = (recipe: { name: string }) => {
		onSelectRecipe?.(recipe)
		onClose()
	}

	const handleShowAllResults = () => {
		if (searchQuery.trim().length > 0) {
			onShowAllResults?.(searchQuery)
			onClose()
		}
	}

	const handleClose = () => {
		searchQuery = ''
		shouldShowLoading = false
		if (showLoadingTimeout) {
			clearTimeout(showLoadingTimeout)
		}
		onClose()
	}
</script>

<Popup {isOpen} onClose={handleClose} title="Search Recipes" width="600px">
	<div class="search-popup-content">
		<div class="search-container">
			<Search
				placeholder="Search for recipes..."
				isLoading={isSearchLoading}
				suggestions={[]}
				onSearch={handleSearch}
				onSelect={handleSelectRecipe}
				bind:inputElement={searchInput}
			/>
		</div>

		<div class="results-container">
			{#if searchQuery.trim().length > 0}
				<div class="search-results">
					<div class="results-header">
						<h4>Top Results</h4>
						<Button
							variant="text"
							size="sm"
							onclick={handleShowAllResults}
							disabled={searchQuery.trim().length === 0}
						>
							Show all results
						</Button>
					</div>

					<div class="results-content">
						{#if isResultsLoading && shouldShowLoading}
							<div class="loading-state">
								<div class="spinner"></div>
								<p>Searching for recipes...</p>
							</div>
						{:else if !isResultsLoading && searchResults.length === 0}
							<div class="empty-state">
								<p>No recipes found matching "{searchQuery}"</p>
							</div>
						{:else}
							<ul class="results-list">
								{#each searchResults as recipe}
									<li class="result-item">
										<SearchRecipeCard
											{recipe}
											onClick={() => onSelectRecipe?.({ name: recipe.title })}
										/>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			{:else}
				<div class="search-info">
					<p>Search for recipes by name, ingredients, or tags.</p>
				</div>
			{/if}
		</div>
	</div>
</Popup>

<style lang="scss">
	.search-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.search-container {
		width: 100%;
	}

	.results-container {
		height: 300px; /* Fixed height instead of min-height */
		display: flex;
		flex-direction: column;
	}

	.search-info {
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		padding: var(--spacing-lg) 0;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.search-results {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);

		h4 {
			margin: 0;
			font-size: var(--font-size-md);
			font-weight: 600;
		}
	}

	.results-content {
		flex: 1;
		overflow: hidden;
		position: relative;
		height: calc(100% - 40px); /* Subtract header height */
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		.spinner {
			border: 3px solid rgba(255, 255, 255, 0.1);
			border-top: 3px solid var(--color-primary);
			border-radius: 50%;
			width: 30px;
			height: 30px;
			animation: spin 1s linear infinite;
			margin-bottom: var(--spacing-md);
		}

		p {
			margin: 0;
			font-size: var(--font-size-sm);
		}
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral);
		font-size: var(--font-size-sm);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		text-align: center;
	}

	.results-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		overflow-y: auto;
		height: 100%;

		&::-webkit-scrollbar {
			width: var(--spacing-xs);
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: var(--color-neutral);
			border-radius: var(--border-radius-sm);
		}
	}

	.result-item {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.result-image {
		width: 50px;
		height: 50px;
		border-radius: var(--border-radius-sm);
		overflow: hidden;
		background-color: var(--color-neutral-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		&.placeholder {
			color: var(--color-neutral);
		}
	}

	.result-info {
		flex: 1;
		min-width: 0; /* Prevent text from overflowing */
	}

	.result-title {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
