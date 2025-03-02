<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import SearchRecipeCard from '$lib/components/search/SearchRecipeCard.svelte'
	import FilterSelect from '$lib/components/filter/FilterSelect.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { dietTypes, type DietType } from '$lib/types'

	let {
		isOpen = false,
		onClose,
		onSearch,
		onSelectRecipe,
		onShowAllResults,
		onIngredientSearch,
		isSearchLoading = false,
		searchResults = [],
		isResultsLoading = false
	}: {
		isOpen: boolean
		onClose: () => void
		onSearch?: (query: string, filters?: { diets: DietType[]; ingredients: string[] }) => void
		onSelectRecipe?: (recipe: { name: string }) => void
		onShowAllResults?: (
			query: string,
			filters?: { diets: DietType[]; ingredients: string[] }
		) => void
		onIngredientSearch?: ComponentProps<typeof Search>['onSearch']
		isSearchLoading?: boolean
		searchResults?: Array<{
			id: string
			title: string
			imageUrl?: string
			cookTime?: number
			diets?: DietType[]
			likes?: number
		}>
		isResultsLoading?: boolean
	} = $props()

	let searchInput: HTMLInputElement
	let ingredientSearchInput: HTMLInputElement
	let searchQuery = $state('')
	let ingredientQuery = $state('')
	let searchTimeout: ReturnType<typeof setTimeout> | null = null
	let showLoadingTimeout: ReturnType<typeof setTimeout> | null = null
	let shouldShowLoading = $state(false)

	let selectedDiets = $state(
		dietTypes.reduce(
			(acc, diet) => {
				acc[diet] = false
				return acc
			},
			{} as Record<DietType, boolean>
		)
	)

	let selectedIngredients = $state<string[]>([])
	let showFilters = $state(false)

	const selectedDietsArray = $derived(
		Object.entries(selectedDiets)
			.filter(([_, value]) => value)
			.map(([key]) => key)
	) as DietType[]

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
		searchResults = []
		isResultsLoading = true
		searchQuery = query

		if (searchTimeout) {
			clearTimeout(searchTimeout)
		}

		if (
			query.trim().length > 0 ||
			selectedDietsArray.length > 0 ||
			selectedIngredients.length > 0
		) {
			searchTimeout = setTimeout(() => {
				onSearch?.(query, { diets: selectedDietsArray, ingredients: selectedIngredients })
			}, 300)
		}

		return []
	}

	const handleSelectRecipe = (recipe: { name: string }) => {
		onSelectRecipe?.(recipe)
		onClose()
	}

	const handleShowAllResults = () => {
		if (
			searchQuery.trim().length > 0 ||
			selectedDietsArray.length > 0 ||
			selectedIngredients.length > 0
		) {
			onShowAllResults?.(searchQuery, {
				diets: selectedDietsArray,
				ingredients: selectedIngredients
			})
			onClose()
		}
	}

	const handleClose = () => {
		onClose()
	}

	const toggleIngredient = (ingredient: string) => {
		if (selectedIngredients.includes(ingredient)) {
			selectedIngredients = selectedIngredients.filter((i) => i !== ingredient)
		} else {
			selectedIngredients = [...selectedIngredients, ingredient]
		}
		handleSearch(searchQuery)
	}

	const handleAddIngredient = (ingredient: { name: string }) => {
		if (!selectedIngredients.includes(ingredient.name)) {
			selectedIngredients = [...selectedIngredients, ingredient.name]
			ingredientQuery = ''
			handleSearch(searchQuery)
		}
	}

	const toggleFilters = () => {
		showFilters = !showFilters
	}

	const clearFilters = () => {
		selectedDiets = dietTypes.reduce(
			(acc, diet) => {
				acc[diet] = false
				return acc
			},
			{} as Record<DietType, boolean>
		)
		selectedIngredients = []
		handleSearch(searchQuery)
	}
</script>

<Popup {isOpen} onClose={handleClose} width="800px">
	<div class="search-popup-content">
		<div class="search-container">
			<Search
				placeholder="Search for recipes..."
				isLoading={isSearchLoading}
				onSearch={handleSearch}
				onSelect={handleSelectRecipe}
				bind:inputElement={searchInput}
			/>
			<div class="filter-toggle">
				<Button variant="text" size="sm" onclick={toggleFilters}>
					{showFilters ? 'Hide filters' : 'Show filters'}
				</Button>
				{#if selectedDietsArray.length > 0 || selectedIngredients.length > 0}
					<Button variant="text" size="sm" onclick={clearFilters}>Clear filters</Button>
				{/if}
			</div>
		</div>

		{#if showFilters}
			<div class="filters-container">
				<div class="filter-section">
					<h4>Diet</h4>
					<div class="filter-options">
						{#each dietTypes as diet}
							<FilterSelect
								value={diet}
								selected={selectedDiets[diet]}
								onChange={(value, checked) => {
									selectedDiets[value as DietType] = checked
									handleSearch(searchQuery)
								}}
							/>
						{/each}
					</div>
				</div>
				<div class="filter-section">
					<h4>Ingredients</h4>
					<div class="ingredient-search-container">
						<Search
							placeholder="Search for ingredients..."
							onSearch={onIngredientSearch}
							onSelect={handleAddIngredient}
							clearInput
							bind:inputElement={ingredientSearchInput}
						/>
					</div>
					{#if selectedIngredients.length > 0}
						<div class="selected-ingredients">
							{#each selectedIngredients as ingredient}
								<Pill
									text={ingredient}
									onRemove={() => toggleIngredient(ingredient)}
									color="var(--color-primary)"
								/>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="results-container">
			{#if searchQuery.trim().length > 0 || selectedDietsArray.length > 0 || selectedIngredients.length > 0}
				<div class="search-results">
					<div class="results-content">
						{#if isResultsLoading && shouldShowLoading}
							<div class="loading-state">
								<div class="spinner"></div>
								<p>Searching for recipes...</p>
							</div>
						{:else if !isResultsLoading && searchResults.length === 0}
							<div class="empty-state">
								<p>No recipes found matching your criteria</p>
							</div>
						{:else}
							<div class="results-wrapper">
								<div class="results-list">
									{#each searchResults as recipe}
										<div class="result-item">
											<SearchRecipeCard
												{recipe}
												onClick={() => onSelectRecipe?.({ name: recipe.title })}
											/>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="content-container">
					<div class="search-info">
						<div class="search-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="11" cy="11" r="8"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
							</svg>
						</div>
						<p>Search for recipes by name, ingredients, or tags</p>
					</div>
				</div>
			{/if}
		</div>
		<div style:margin="auto">
			<Button
				onclick={handleShowAllResults}
				disabled={searchQuery.trim().length === 0 &&
					selectedDietsArray.length === 0 &&
					selectedIngredients.length === 0}
			>
				Show all results
			</Button>
		</div>
	</div>
</Popup>

<style lang="scss">
	.search-popup-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.search-container {
		width: 100%;
		display: flex;
	}

	.filter-toggle {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-xs);
	}

	.filters-container {
		background: rgba(255, 255, 255, 0.03);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.filter-section {
		h4 {
			margin: 0 0 var(--spacing-sm) 0;
			font-size: var(--font-size-sm);
			font-weight: 500;
			color: var(--color-neutral);
		}
	}

	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.results-container {
		height: 400px;
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
		border-radius: var(--border-radius-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.content-container,
	.results-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.content-container {
		height: 100%;
	}

	.search-info {
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		padding: var(--spacing-xl) 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;

		.search-icon {
			margin-bottom: var(--spacing-md);
			opacity: 0.5;
		}

		p {
			margin: 0;
			max-width: 80%;
			line-height: 1.5;
		}
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
		padding: 0 var(--spacing-xs);

		h4 {
			margin: 0;
			font-size: var(--font-size-md);
			font-weight: 600;
			letter-spacing: 0.01em;
		}
	}

	.results-wrapper {
		position: relative;
		height: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
		scrollbar-width: thin;
		scrollbar-gutter: stable;
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
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
		border-radius: var(--border-radius-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);

		.spinner {
			border: 2px solid rgba(255, 255, 255, 0.1);
			border-top: 2px solid var(--color-primary);
			border-radius: 50%;
			width: 24px;
			height: 24px;
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
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
		border-radius: var(--border-radius-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);

		.highlight {
			color: var(--color-primary);
			font-weight: 500;
		}
	}

	.results-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-xl);
		padding: var(--spacing-lg);
		width: 100%;
		box-sizing: border-box;
		min-width: 0;
	}

	.result-item {
		width: 100%;
		min-width: 0;
	}

	.scroll-indicator {
		display: none;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.ingredient-search-container {
		margin-bottom: var(--spacing-sm);
		width: 100%;
	}

	.selected-ingredients {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
	}
</style>
