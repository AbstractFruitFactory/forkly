<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import { onMount, type ComponentProps } from 'svelte'
	import { setSlots } from '../../../routes/+layout.svelte'
	import { writable } from 'svelte/store'
	import IngredientFilter from '$lib/components/ingredient-filter/IngredientFilter.svelte'
	import TagFilter from '$lib/components/tag-filter/TagFilter.svelte'
	import OptionFilterSelect from '$lib/components/filter-select/OptionFilterSelect.svelte'
	import Search from '$lib/components/search/Search.svelte'
	import { tick } from 'svelte'
	import { scrollStore } from '$lib/state/scroll.svelte'
	import RecipePopup from '$lib/components/recipe-popup/RecipePopup.svelte'
	import { preloadData, pushState, goto, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	
	let {
		recipes,
		isLoading = false,
		onFiltersChange = (filters: {
			tags: string[]
			ingredients: string[]
			excludedIngredients: string[]
		}) => {},
		onSortChange = (sortBy: 'popular' | 'newest' | 'easiest') => {},
		searchTags = (query: string) => Promise.resolve<{ name: string; count: number }[]>([]),
		searchIngredients = (query: string) => Promise.resolve<{ id: string; name: string }[]>([]),
		loadMore = () => Promise.resolve(),
		initialTags = [],
		initialIngredients = [],
		initialSort = 'popular',
		onSearchbarSticky = (isSticky: boolean) => {}
	}: {
		recipes: ComponentProps<typeof RecipeGrid>['recipes']
		isLoading?: boolean
		onSearchChange?: (query: string) => void
		onFiltersChange?: (filters: {
			tags: string[]
			ingredients: string[]
			excludedIngredients: string[]
		}) => void
		onSortChange?: (sortBy: 'popular' | 'newest' | 'easiest') => void
		searchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		searchIngredients?: (query: string) => Promise<{ id: string; name: string }[]>
		loadMore?: () => Promise<void>
		initialTags?: string[]
		initialIngredients?: { label: string; include: boolean }[]
		initialSort?: 'popular' | 'newest' | 'easiest'
		onSearchbarSticky?: (isSticky: boolean) => void
	} = $props()

	let selectedTags = $state<{ label: string; selected: boolean }[]>([])
	let selectedIngredients = $state<{ label: string; include: boolean }[]>([])
	let availableTags = $state<{ name: string; count: number }[]>([])
	let availableIngredients = $state<{ id: string; name: string }[]>([])
	let isMobile = $state(false)
	let searchbarIsSticky = $state(false)
	let hasInitializedObserver = false
	let sentinelNode = writable<HTMLElement | null>(null)
	let filtersSentinelNode = writable<HTMLElement | null>(null)
	let flipState = $state<any>(null)
	let searchBarPosition = $state<'header' | 'filters'>('header')
	let searchValue = $state('')
	let filtersSentinelOutOfView = $state(false)

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)

		// Initialize selected values
		selectedTags = initialTags.map((tag) => ({ label: tag, selected: true }))
		selectedIngredients = initialIngredients

		let observer: IntersectionObserver | null = null
		let filtersObserver: IntersectionObserver | null = null
		let unsubscribe = sentinelNode.subscribe((node) => {
			if (observer) {
				observer.disconnect()
				observer = null
			}
			if (node) {
				observer = new window.IntersectionObserver(
					(entries) => {
						if (!hasInitializedObserver) {
							hasInitializedObserver = true
							return
						}
						searchbarIsSticky = entries[0].intersectionRatio < 1
						onSearchbarSticky(searchbarIsSticky)
					},
					{ root: null, threshold: 1 }
				)
				observer.observe(node)
			}
		})

		let filtersUnsubscribe = filtersSentinelNode.subscribe((node) => {
			if (filtersObserver) {
				filtersObserver.disconnect()
				filtersObserver = null
			}
			if (node) {
				filtersObserver = new window.IntersectionObserver(
					(entries) => {
						filtersSentinelOutOfView = entries[0].intersectionRatio < 1
					},
					{ root: null, threshold: 1 }
				)
				filtersObserver.observe(node)
			}
		})

		return () => {
			if (observer) observer.disconnect()
			if (filtersObserver) filtersObserver.disconnect()
			window.removeEventListener('resize', checkMobile)
			unsubscribe()
			filtersUnsubscribe()
		}
	})

	$effect(() => {
		if (searchbarIsSticky) {
			handleFlip('filters')
		} else {
			handleFlip('header')
		}
	})

	async function handleFlip(target: 'header' | 'filters') {
		const flip = (await import('gsap/Flip')).Flip
		if (!flip) return

		flipState = flip.getState('.header-searchbar, .filters-searchbar')

		searchBarPosition = target

		await tick()

		flip.from(flipState, {
			targets: '.header-searchbar, .filters-searchbar',
			duration: 0.2,
			ease: 'power1.inOut'
		})
	}

	$effect(() => {
		onFiltersChange({
			tags: selectedTags.map((t) => t.label),
			ingredients: selectedIngredients.filter((i) => i.include).map((i) => i.label),
			excludedIngredients: selectedIngredients.filter((i) => !i.include).map((i) => i.label)
		})
	})

	const sortOptions = [
		{ label: 'Popular', value: 'popular', onClick: () => onSortChange('popular') },
		{ label: 'Newest', value: 'newest', onClick: () => onSortChange('newest') },
		{ label: 'Easiest', value: 'easiest', onClick: () => onSortChange('easiest') }
	]

	let sortBy = $derived(sortOptions.find((option) => option.value === initialSort)!)

	const checkMobile = () => {
		isMobile = window.innerWidth <= 768
	}

	const scrollToFiltersSentinel = () => {
		if (filtersSentinelOutOfView && $filtersSentinelNode) {
			if (scrollStore.scrollContainer) {
				scrollStore.scrollToElement($filtersSentinelNode)
			}
		}
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t.label !== tag)
		notifyFiltersChanged()
	}

	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i.label !== ingredient)
		notifyFiltersChanged()
	}

	const notifyFiltersChanged = () => {
		onFiltersChange({
			tags: selectedTags.map((t) => t.label),
			ingredients: selectedIngredients.filter((i) => i.include).map((i) => i.label),
			excludedIngredients: selectedIngredients.filter((i) => !i.include).map((i) => i.label)
		})
	}

	const loadTags = async (query: string): Promise<string[]> => {
		const tags = await searchTags(query)
		availableTags = tags
		return tags.map((tag) => tag.name)
	}

	const loadIngredients = async (query: string): Promise<string[]> => {
		const ingredients = await searchIngredients(query)
		availableIngredients = ingredients
		return ingredients.map((ingredient) => ingredient.name)
	}

	let resolveRecipePopup: (value: void) => void

	const openRecipePopup = async (recipe: DetailedRecipe, e: MouseEvent) => {
		if (e.shiftKey || e.metaKey || e.ctrlKey || e.button === 1) return

		e.preventDefault()

		const href = `/recipe/${recipe.id}`
		const result = await preloadData(href)

		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { recipeModal: result.data })
		} else {
			goto(href)
		}

		const { promise, resolve } = Promise.withResolvers<void>()

		resolveRecipePopup = resolve

		return promise
	}

	const closePopup = () => {
		page.state.recipeModal = undefined
		resolveRecipePopup()
		replaceState('/', { recipeModal: undefined })
	}

	const emptyStateMessage = $derived(
		selectedTags.length > 0 || selectedIngredients.length > 0
			? 'No recipes found matching your criteria. Try different search terms or filters, or browse all recipes.'
			: 'No recipes yet! Be the first to create one.'
	)

	onMount(() => {
		const callback = () => {
			closePopup()
		}
		window.addEventListener('popstate', callback)

		return () => {
			window.removeEventListener('popstate', callback)
		}
	})

	setSlots({ homepageHeader, content })
</script>

{#snippet search(placement: 'header' | 'filters')}
	<div
		class:header-searchbar={placement === 'header'}
		class:filters-searchbar={placement === 'filters'}
		data-flip-id="searchbar"
	>
		<Search
			placeholder="Search recipes..."
			bind:value={searchValue}
			onInput={(query) => {
				if (!isMobile) {
					window.dispatchEvent(new CustomEvent('search', { detail: { query } }))
					scrollToFiltersSentinel()
				}
			}}
			onConfirm={() => {
				window.dispatchEvent(new CustomEvent('search', { detail: { query: searchValue } }))
				if (!isMobile) {
					scrollToFiltersSentinel()
				}
			}}
			{isLoading}
			roundedCorners
		/>
	</div>
{/snippet}

{#snippet homepageHeader()}
	<div class="large-header">Effortless food recipes, made by the community.</div>

	<div bind:this={$sentinelNode} style="height: 60px;"></div>

	<div class="search-content">
		{#if searchBarPosition === 'header'}
			{@render search('header')}
		{/if}
	</div>
{/snippet}

{#snippet content()}
	<div class="main-layout" class:expanded={searchbarIsSticky}>
		<div bind:this={$filtersSentinelNode} style:height="1px" style:margin-top=""></div>
		<div class="filters" class:sticky={searchbarIsSticky}>
			<div class="buttons">
				<div>
					<IngredientFilter onSearch={loadIngredients} bind:selected={selectedIngredients} />

					<TagFilter onSearch={loadTags} bind:selected={selectedTags} />

					<div class="filters-search">
						{#if searchBarPosition === 'filters'}
							{@render search('filters')}
						{/if}
					</div>
				</div>

				<OptionFilterSelect options={sortOptions} bind:selected={sortBy} />
			</div>

			{#if selectedTags.length > 0 || selectedIngredients.length > 0}
				<div
					class="selected-pills"
					class:sticky={searchbarIsSticky}
					class:has-content={selectedTags.length > 0 || selectedIngredients.length > 0}
				>
					<div>
						{#each selectedTags as tag (tag.label)}
							<Pill text={tag.label} onRemove={() => removeTag(tag.label)} />
						{/each}

						{#each selectedIngredients.filter((i) => i.include) as ingredient (ingredient.label)}
							<Pill text={ingredient.label} onRemove={() => removeIngredient(ingredient.label)} />
						{/each}

						{#each selectedIngredients.filter((i) => !i.include) as ingredient (ingredient.label)}
							<Pill
								text={`-${ingredient.label}`}
								onRemove={() => removeIngredient(ingredient.label)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="home-container">
			{#snippet recipeGrid(size: 'large' | 'small')}
				<div class="recipe-grid">
					<RecipeGrid
						{recipes}
						emptyMessage={emptyStateMessage}
						{isLoading}
						{loadMore}
						{size}
						onRecipeClick={openRecipePopup}
					/>
				</div>
			{/snippet}

			<div class="desktop-only">
				{@render recipeGrid('large')}
			</div>

			<div class="mobile-only">
				{@render recipeGrid('small')}
			</div>
		</div>
	</div>
{/snippet}

<RecipePopup
	data={page.state.recipeModal}
	isOpen={page.state.recipeModal !== undefined}
	onClose={closePopup}
	animateFrom={page.state.animateFrom}
/>

<style lang="scss">
	@import '$lib/global.scss';

	$max-width: 1200px;

	.header {
		position: absolute;
		top: 0;
		z-index: var(--z-sticky);
		width: 100%;

		.header-content {
			max-width: $max-width;
			margin: 0 auto;
			padding: 0 var(--spacing-2xl);
		}

		&.hidden {
			opacity: 0;
			transition: opacity 0.2s ease-in-out;
		}

		@include mobile {
			display: none;
		}
	}

	.desktop-only {
		display: block;

		@include tablet {
			display: none;
		}
	}

	.mobile-only {
		display: none;

		@include tablet {
			display: block;
		}
	}

	.large-header {
		color: black;
		font-size: 2rem;
		font-weight: 600;
		text-align: center;
		padding: var(--spacing-2xl) 0;

		@include mobile {
			padding: 0;
			padding-top: var(--spacing-xl);
		}
	}

	.header-actions-main {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-2xl);
		z-index: var(--z-sticky);
	}

	.home-title {
		text-align: center;
		margin: var(--spacing-lg) 0;

		@include mobile {
			display: none;
		}
	}

	.home-container {
		position: relative;
		overflow: visible;
	}

	.search-results-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content {
		display: flex;
		justify-content: flex-start;
		margin-bottom: var(--spacing-sm);

		@include mobile {
			display: none;
		}
	}

	.search-results-header h1 {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-neutral-light);
	}

	.results-count {
		color: var(--color-neutral);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.sort-controls {
		margin: var(--spacing-sm) 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: var(--spacing-md);
	}

	.search-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		height: 6rem;

		padding: 0 var(--spacing-xl);
	}

	.header-searchbar {
		width: 100%;
		max-width: 30rem;
	}

	.pill-selectors {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.filters {
		display: flex;
		flex-direction: column;
		position: sticky;
		top: var(--spacing-xs);
		z-index: var(--z-sticky);
		background: var(--color-background);
		transform-origin: center top;
		transition:
			border 0.2s ease-in-out,
			opacity 0.2s ease-in-out;
		padding: var(--spacing-md) 0;
		border: var(--border-width-thin) solid transparent;
		border-radius: var(--border-radius-xl);

		&.sticky {
			border-color: var(--color-neutral);
			margin: var(--spacing-sm);

			.buttons {
				transform: scale(0.98);

				@include mobile {
					transform: scale(0.94);
				}
			}
		}

		.buttons {
			display: flex;
			gap: var(--spacing-md);
			align-items: center;
			justify-content: space-between;
			transition: transform 0.2s ease-in-out;
			z-index: var(--z-elevated);

			> * {
				display: flex;
				gap: var(--spacing-md);
				min-width: 0;
			}

			> *:first-child {
				flex: 1;
				min-width: 0;
			}
		}
	}

	.filters-search {
		width: 100%;
		max-width: 30rem;
	}

	.selected-pills {
		margin-top: var(--spacing-sm);
		width: 100%;
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.2s ease-in-out;
		overflow: hidden;
		padding: 0 var(--spacing-sm);

		&.has-content {
			grid-template-rows: 1fr;
		}

		> div {
			min-height: 0;
			display: flex;
			gap: var(--spacing-sm);
			overflow-x: auto;
			scrollbar-width: none;
		}

		@include mobile {
			display: none;
		}
	}

	.selected-filters {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-neutral);

		.selected-filters-title {
			margin: 0 0 var(--spacing-sm) 0;
			font-size: var(--font-size-md);
			font-weight: 500;
			color: var(--color-neutral-light);
		}
	}

	.recipe-grid {
		position: relative;
		margin-top: var(--spacing-lg);

		@include mobile {
			margin-top: var(--spacing-md);
		}
	}

	.scroll-to-top {
		display: none;

		@include desktop {
			display: block;
			position: fixed;
			top: 100px;
			transform: translateX(-100px);
		}
	}

	:global(.search-content .input-wrapper .action-button) {
		background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05)) !important;
		border-radius: var(--border-radius-full) !important;
		color: var(--color-neutral) !important;
		font-family: monospace !important;
		font-size: var(--font-size-xs) !important;
		cursor: default !important;

		&:hover {
			color: var(--color-neutral) !important;
		}

		@include mobile;
		@include tablet {
			display: none;
		}
	}

	.desktop-filters {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;

		@include mobile {
			display: none;
		}
	}

	.mobile-filters-button {
		display: none;

		@include mobile {
			display: block;
			width: 100%;
		}
	}

	.mobile-filters {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) 0;
	}

	.carousel-container {
		width: 100%;
		height: 400px;
		margin: 0;
		width: 100vw;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
	}

	.recipe-card {
		background-color: var(--color-neutral-darker);
		border-radius: var(--border-radius);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.recipe-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.recipe-image-placeholder {
		width: 100%;
		height: 200px;
		background-color: var(--color-neutral);
	}

	.recipe-content {
		padding: var(--spacing-md);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.recipe-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-neutral-light);
	}

	.recipe-description {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-neutral);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.recipe-stats {
		display: flex;
		gap: var(--spacing-md);
		margin-top: auto;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-neutral);
		font-size: var(--font-size-sm);

		svg {
			color: var(--color-primary);
		}
	}

	.empty-state {
		text-align: center;
		color: var(--color-neutral);
		padding: var(--spacing-xl);
	}

	.pill-sort-group {
		display: flex;
		gap: 1.5rem;
	}

	.pill-sort-btn {
		background: var(--color-neutral-dark);
		border: none;
		border-radius: var(--border-radius-full);
		height: 40px;
		width: 90px;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		transition:
			background 0.2s,
			color 0.2s;
		cursor: pointer;
		outline: none;

		&.active {
			background: var(--color-secondary);
			color: #22232e;
		}
	}

	.sticky-header {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky) + 2;
		width: 100vw;
		background: var(--color-primary);
		left: 50%;
		transform: translateX(-50%);
		max-width: 100vw;
	}

	.header-searchbar {
		will-change: transform;
	}

	.filters-searchbar {
		width: 100%;
		min-width: 0;
	}

	:global(.filters-searchbar .search-input-container input) {
		border-color: var(--color-primary) !important;
	}
</style>
