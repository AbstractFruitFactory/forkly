<script lang="ts">
	import Search from '../search/Search.svelte'
	import Dropdown from '../dropdown/Dropdown.svelte'
	import { Plus, Minus, Check } from 'lucide-svelte'

	let {
		value = $bindable(''),
		inputElement = $bindable<HTMLInputElement>(),
		isLoading = false,
		actionButton = undefined,
		searchRecipes,
		searchTags,
		searchIngredients,
		selectedTags = $bindable<{ label: string; selected?: boolean }[]>([]),
		selectedIngredients = $bindable<{ label: string; include: boolean }[]>([]),
		handleSearch,
		showResults,
		onFiltersChange = undefined
	}: {
		value: string
		inputElement: HTMLInputElement
		isLoading: boolean
		actionButton: any
		searchRecipes: (query: string) => Promise<any[]>
		searchTags: (query: string) => Promise<string[]>
		searchIngredients: (query: string) => Promise<string[]>
		selectedTags: { label: string; selected?: boolean }[]
		selectedIngredients: { label: string; include: boolean }[]
		handleSearch: () => void
		showResults: (value: string) => void
		onFiltersChange?: (tags: { label: string; selected?: boolean }[], ingredients: { label: string; include: boolean }[]) => void
	} = $props()

	let recipeResults = $state<any[]>([])
	let tagResults = $state<{ label: string }[]>([])
	let ingredientResults = $state<{ label: string }[]>([])
	let dropdownOpen = $state(false)

	const handleInput = async (v: string) => {
		value = v
		dropdownOpen = !!v
		await fetchDropdownResults(v)
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && dropdownOpen) {
			showResults(value)
			dropdownOpen = false
		}
	}

	const fetchDropdownResults = async (query: string) => {
		recipeResults = await searchRecipes(query)
		const tags = await searchTags(query)

		tagResults = tags.map((t: string) => ({ label: t }))

		const ingredients = await searchIngredients(query)

		ingredientResults = ingredients.map((i: string) => ({ label: i }))
	}

	const selectTag = (tag: { label: string }) => {
		selectedTags = [...selectedTags, { ...tag, selected: true }]
		onFiltersChange?.(selectedTags, selectedIngredients)
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t.label !== tag)
		onFiltersChange?.(selectedTags, selectedIngredients)
	}

	const selectIngredient = (ingredient: { label: string }, include: boolean) => {
		const exists = selectedIngredients.find((i) => i.label === ingredient.label)
		if (exists) {
			selectedIngredients = selectedIngredients.map((i) =>
				i.label === ingredient.label ? { ...i, include } : i
			)
		} else {
			selectedIngredients = [...selectedIngredients, { ...ingredient, include }]
		}
		onFiltersChange?.(selectedTags, selectedIngredients)
	}

	const removeIngredient = (ingredient: string) => {
		selectedIngredients = selectedIngredients.filter((i) => i.label !== ingredient)
		onFiltersChange?.(selectedTags, selectedIngredients)
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="home-search-wrapper">
	<Search
		bind:value
		bind:inputElement
		{isLoading}
		placeholder="Search recipes..."
		{actionButton}
		roundedCorners
		onInput={handleInput}
	/>
	<Dropdown isOpen={dropdownOpen}>
		<div class="dropdown-content">
			<div class="dropdown-section">
				<div class="dropdown-header">Recipes</div>
				<button
					class="dropdown-subtext clickable"
					onclick={() => {
						showResults(value)
						dropdownOpen = false
					}}
				>
					{'->'} show results for "{value}"
				</button>
				{#each recipeResults as recipe}
					<a class="dropdown-recipe-item recipe-link" href={`/recipe/${recipe.id}`}>
						{#if recipe.imageUrl}
							<img src={recipe.imageUrl} alt={recipe.title} class="recipe-thumb" />
						{:else}
							<div class="recipe-thumb placeholder"></div>
						{/if}
						<span>{recipe.title}</span>
					</a>
				{/each}
			</div>
			<div class="dropdown-section">
				<div class="dropdown-header">Tags</div>
				{#each tagResults as tag (tag.label)}
					{@const selected = selectedTags.some((t) => t.label === tag.label)}
					<div class="dropdown-tag-item">
						<span class:selected={selected}>{tag.label}</span>
						<button
							type="button"
							class="action-button include"
							data-active={selected}
							onclick={() => (selected ? removeTag(tag.label) : selectTag(tag))}
						>
							{#if selected}
								<Check size={14} />
							{:else}
								<Plus size={14} />
							{/if}
						</button>
					</div>
				{/each}
			</div>
			<div class="dropdown-section">
				<div class="dropdown-header">Ingredients</div>
				{#each ingredientResults as ingredient (ingredient.label)}
					{@const included = selectedIngredients.find((i) => i.label === ingredient.label && i.include)}
					{@const excluded = selectedIngredients.find((i) => i.label === ingredient.label && !i.include)}
          
					<div class="dropdown-ingredient-item">
						<span class:excluded={excluded}>{ingredient.label}</span>
						<button
							type="button"
							class="action-button include"
							data-active={!!included}
							onclick={() =>
								included ? removeIngredient(ingredient.label) : selectIngredient(ingredient, true)}
						>
							{#if included}
								<Check size={14} />
							{:else}
								<Plus size={14} />
							{/if}
						</button>
						<button
							type="button"
							class="action-button exclude"
							data-active={!!excluded}
							onclick={() =>
								excluded ? removeIngredient(ingredient.label) : selectIngredient(ingredient, false)}
						>
							<Minus size={14} />
						</button>
					</div>
				{/each}
			</div>
		</div>
	</Dropdown>
</div>

<style lang="scss">
	.home-search-wrapper {
		position: relative;
		width: 100%;
		max-width: 500px;
		min-width: 200px;
	}
	.dropdown-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		min-width: 350px;
	}
	.dropdown-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.dropdown-header {
		font-weight: bold;
		font-size: 1.1em;
		margin-bottom: 4px;
	}
	.dropdown-subtext {
		font-size: 0.95em;
		color: #aaa;
		margin-bottom: 8px;
		width: fit-content;
	}
	.dropdown-subtext.clickable {
		cursor: pointer;
		text-decoration: underline;
		color: var(--color-primary, #ffb347);
	}
	.dropdown-recipe-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 1em;
		color: #eee;
		padding: 2px 0;
	}
	.recipe-thumb {
		width: 32px;
		height: 32px;
		object-fit: cover;
		border-radius: 6px;
		background: #222;
		flex-shrink: 0;
	}
	.recipe-thumb.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #333;
		color: #888;
		font-size: 1.2em;
	}
	.dropdown-tag-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1em;
		color: #eee;
		padding: 2px 0;
	}
	.dropdown-tag-item.selected {
		color: var(--color-success);
	}
	.dropdown-tag-item .action-button.include[data-active='true'] {
		background-color: var(--color-success);
		border-color: var(--color-success);
		color: var(--color-white);
	}
	.dropdown-ingredient-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1em;
		color: #eee;
		padding: 2px 0;
	}
	.dropdown-ingredient-item .excluded {
		text-decoration: line-through;
		color: var(--color-error);
	}
	.action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid var(--color-neutral-light);
		background: none;
		cursor: pointer;
		color: var(--color-neutral-light);
		transition: all 0.2s ease;
		padding: 0;
	}
	.action-button.include[data-active='true'] {
		background-color: var(--color-success);
		border-color: var(--color-success);
		color: var(--color-white);
	}
	.action-button.exclude[data-active='true'] {
		background-color: var(--color-error);
		border-color: var(--color-error);
		color: var(--color-white);
	}
	.action-button.remove {
		color: var(--color-error);
		border: none;
		background: none;
		font-size: 1.2em;
		margin-left: 4px;
	}
	.recipe-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 2px 0;
		transition: background 0.15s;
		border-radius: 4px;
	}
	.recipe-link:hover,
	.recipe-link:focus {
		background: #232323;
		text-decoration: none;
		color: var(--color-primary, #ffb347);
	}
</style>
