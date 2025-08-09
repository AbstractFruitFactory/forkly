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
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import { fade } from 'svelte/transition'
	import TaglineTypewriter from '$lib/components/tagline-typewriter/TaglineTypewriter.svelte'
	import Logo from '$lib/components/logo/Logo.svelte'
	import SortIcon from 'lucide-svelte/icons/arrow-up-down'
	import Button from '$lib/components/button/Button.svelte'
	import DownloadIcon from 'lucide-svelte/icons/download'
	import ImportRecipePopup from '$lib/components/recipe-scraper/ImportRecipePopup.svelte'

	let {
		recipes,
		onSearch,
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
		onSearchbarSticky = (isSticky: boolean) => {},
		initialSearchValue = '',
		isLoadingMore = false,
		isLoading = false
	}: {
		recipes: ComponentProps<typeof RecipeGrid>['recipes']
		onSearch?: (query: string) => void
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
		initialSearchValue?: string
		isLoadingMore?: boolean
		isLoading?: boolean
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
	let searchValue = $state(initialSearchValue)
	let filtersSentinelOutOfView = $state(false)
	let mobileSearchExpanded = $state(false)
	let taglineTags = $state<string[]>([])
	let searchTimeout: ReturnType<typeof setTimeout> | null = null
	let appliedSearchValue = $state('')

	let isImportPopupOpen = $state(false)

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)

		selectedTags = initialTags.map((tag) => ({ label: tag, selected: true }))
		selectedIngredients = initialIngredients
		appliedSearchValue = initialSearchValue

		searchTags('').then((results) => {
			taglineTags = [...results.map((t) => t.name)]
		})

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
			if (searchTimeout) {
				clearTimeout(searchTimeout)
			}
			unsubscribe()
			filtersUnsubscribe()
		}
	})

	$effect(() => {
		if (searchbarIsSticky) {
			handleFlip('filters')
		} else {
			mobileSearchExpanded = false
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

	let recipeModalId = $state<string>()
	let animateFromElement = $state<HTMLElement | null>(null)
	let recipePopup: RecipePopup

	const openRecipePopup = async (recipe: DetailedRecipe, e: MouseEvent) => {
		if (e.shiftKey || e.metaKey || e.ctrlKey || e.button === 1) return

		e.preventDefault()

		const clickedElement = e.currentTarget as HTMLElement
		animateFromElement = clickedElement

		const href = `/recipe/${recipe.id}`

		recipeModalId = recipe.id
		pushState(href, { recipeModal: true })

		const { promise, resolve } = Promise.withResolvers<void>()

		resolveRecipePopup = resolve

		recipePopup.open()

		return promise
	}

	const closePopup = async (_replaceState = true) => {
		if (!resolveRecipePopup) return

		animateFromElement = null
		resolveRecipePopup()

		if (_replaceState) {
			replaceState('/', { recipeModal: undefined })
		}
	}

	const emptyStateMessage = $derived(
		selectedTags.length > 0 || selectedIngredients.length > 0 || searchValue.length > 0
			? 'No recipes found matching your criteria. Try different search terms or filters, or browse all recipes.'
			: 'No recipes yet! Be the first to create one.'
	)

	onMount(() => {
		const callback = async () => {
			await recipePopup.close()
			closePopup(false)
		}
		window.addEventListener('popstate', callback)

		return () => {
			window.removeEventListener('popstate', callback)
		}
	})

	const handleTaglineTagSelect = (tag: string) => {
		const tagExists = selectedTags.find((t) => t.label === tag)
		if (!tagExists) {
			selectedTags = [...selectedTags, { label: tag, selected: true }]
			notifyFiltersChanged()
		}
	}

	function openImportCTA() {
		isImportPopupOpen = true
	}

	function handleRecipeScraped(recipe: any) {
		try {
			sessionStorage.setItem('forkly_prefilled_recipe', JSON.stringify(recipe))
		} catch {}
		goto('/new')
	}

	setSlots({ homepageHeader, content })
</script>

{#snippet homepageHeader()}
	<div class="large-header">
		<div class="mobile-logo">
			<Logo responsive={false} />
		</div>

		<div class="tagline desktop-only">
			<h1>
				Tired of messy recipe posts? Turn yours into a clean, shareable page in seconds - no login
				needed.
			</h1>
		</div>

		<div class="tagline mobile-only">
			<h2 style:font-weight="var(--font-weight-bold)">
				Turn your recipe into a clean, shareable page in seconds - no login needed.
			</h2>
		</div>

		<div class="cta-row">
			<Button onclick={openImportCTA} size="lg" color="primary">
				<DownloadIcon color="var(--color-text-on-primary)" size={18} />
				Import a recipe
			</Button>
		</div>
		<div bind:this={$sentinelNode} style:height="1px"></div>
	</div>
{/snippet}

{#snippet content()}
	<div class="main-layout" class:expanded={searchbarIsSticky}>
		<div bind:this={$filtersSentinelNode} style:height="1px" style:margin-top=""></div>

		<div class="filters" class:sticky={searchbarIsSticky}>
			<div class="buttons">
				<div class="left-section">
					<div class="filters-search">
						<Search
							bind:value={searchValue}
							placeholder="Search recipes..."
							roundedCorners
							onInput={(query: string) => {
								if (searchTimeout) {
									clearTimeout(searchTimeout)
								}
								searchTimeout = setTimeout(() => {
									appliedSearchValue = query
									onSearch?.(query)
									scrollToFiltersSentinel()
								}, 300)
							}}
							onConfirm={() => {
								if (searchTimeout) {
									clearTimeout(searchTimeout)
								}
								appliedSearchValue = searchValue
								onSearch?.(searchValue)
								scrollToFiltersSentinel()
							}}
						/>
					</div>

					{#if !mobileSearchExpanded}
						<div in:fade={{ duration: 300, delay: 300 }}>
							<IngredientFilter onSearch={loadIngredients} bind:selected={selectedIngredients} />
						</div>

						<div in:fade={{ duration: 300, delay: 300 }}>
							<TagFilter onSearch={loadTags} bind:selected={selectedTags} />
						</div>
					{/if}
				</div>

				<div class="right-section">
					<div class="tablet-only">
						<OptionFilterSelect options={sortOptions} bind:selected={sortBy} title="Sort by">
							{#snippet buttonLabel()}
								<SortIcon size={16} />
							{/snippet}
						</OptionFilterSelect>
					</div>

					<div class="desktop-only">
						<OptionFilterSelect options={sortOptions} bind:selected={sortBy} />
					</div>
				</div>
			</div>

			{#if selectedTags.length > 0 || selectedIngredients.length > 0}
				{#if !(mobileSearchExpanded && isMobile)}
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
			{/if}
		</div>

		{#if appliedSearchValue.length > 0}
			<div class="search-results-header">
				<h3>Showing results for "{appliedSearchValue}"</h3>
			</div>
		{/if}

		<div class="home-container">
			<div class="recipe-grid">
				<RecipeGrid
					{recipes}
					emptyMessage={emptyStateMessage}
					{loadMore}
					onRecipeClick={openRecipePopup}
					{isLoadingMore}
					{isLoading}
				/>
			</div>
		</div>
	</div>
{/snippet}

<RecipePopup
	bind:this={recipePopup}
	id={recipeModalId!}
	onClose={closePopup}
	animateFrom={animateFromElement}
/>

<ImportRecipePopup bind:isOpen={isImportPopupOpen} onRecipeScraped={handleRecipeScraped} />

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	$max-width: 1200px;

	.large-header {
		display: flex;
		justify-content: center;
		padding: var(--spacing-4xl) 0;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);

		@include mobile {
			padding: var(--spacing-md) 0;
		}
	}

	.mobile-logo {
		display: none;

		@include mobile {
			display: flex;
		}
	}

	.tagline {
		max-width: 70rem;
		text-align: center;
	}

	.cta-row {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-2xl);

		@include mobile {
			margin-top: 0;
		}
	}

	.home-container {
		position: relative;
		overflow: visible;
	}

	.search-results-header {
		margin: var(--spacing-lg) 0;
		text-align: center;
	}

	.filters {
		display: flex;
		flex-direction: column;
		position: sticky;
		top: var(--spacing-xs);
		z-index: var(--z-sticky);
		transform-origin: center top;
		transition:
			border 0.2s ease-in-out,
			background 0.1s ease-in-out,
			opacity 0.2s ease-in-out;
		padding: var(--spacing-lg) 0;
		border-radius: var(--border-radius-xl);
		background: var(--color-background);

		@include mobile {
			padding-top: var(--spacing-lg);
			border-radius: unset;
			top: 0;
		}

		&.sticky {
			border-color: var(--color-neutral);
			margin: var(--spacing-sm);

			@include mobile {
				margin: unset;
			}

			.buttons {
				transform: scale(0.98);

				@include mobile {
					transform: unset;
				}
			}
		}

		.buttons {
			display: flex;
			gap: var(--spacing-lg);
			align-items: stretch;
			justify-content: space-between;
			transition: transform 0.2s ease-in-out;
			z-index: var(--z-elevated);

			@include mobile {
				gap: var(--spacing-md);
			}

			.left-section {
				display: flex;
				gap: var(--spacing-lg);
				min-width: 0;
				flex: 1;

				@include mobile {
					gap: var(--spacing-md);
				}
			}

			.right-section {
				display: flex;
				gap: var(--spacing-lg);
				align-items: center;
				min-width: 0;
				flex-shrink: 0;

				@include mobile {
					gap: var(--spacing-md);
				}
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

	.recipe-grid {
		padding-top: var(--spacing-md);
		position: relative;
	}
</style>
