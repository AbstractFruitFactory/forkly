<script lang="ts" module>
	export type IngredientRow = { id: string; name: string; amount: string; unit: string }
	export type InstructionRow = { id: string; text: string; media?: File }
</script>

<script lang="ts">
	type Ingredient = { id?: string; name: string }
	import { enhance } from '$app/forms'
	import { onMount } from 'svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import DesktopLayout from './DesktopLayout.svelte'
	import MobileLayout from './MobileLayout.svelte'
	import ImportRecipePopup from '$lib/components/recipe-scraper/ImportRecipePopup.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import DownloadIcon from 'lucide-svelte/icons/download'
	import type { RecipeData } from '$lib/utils/recipeScraper'

	let {
		errors,
		unitSystem = 'imperial',
		onSearchTags,
		onSearchIngredients
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<Ingredient[]>
		unitSystem?: UnitSystem
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
	} = $props()

	const generateId = () => Math.random().toString(36).slice(2)

	let ingredients = $state<IngredientRow[]>([{ id: generateId(), name: '', amount: '', unit: '' }])
	let instructions = $state<InstructionRow[]>([{ id: generateId(), text: '', media: undefined }])
	let servings = $state(1)
	let selectedTags = $state<string[]>([])
	let title = $state('')
	let image = $state<string | null>(null)

	let nutritionMode = $state<'auto' | 'manual' | 'none'>('auto')
	let calories = $state('')
	let protein = $state('')
	let carbs = $state('')
	let fat = $state('')

	$effect(() => {
		if (nutritionMode === 'manual') {
		const p = parseFloat(protein) || 0
		const c = parseFloat(carbs) || 0
		const f = parseFloat(fat) || 0
		calories = String(p * 4 + c * 4 + f * 9)
		} else {
			calories = ''
		}
	})

	let isMobileView = $state(false)
	let mobileLayoutElement: HTMLElement
	let desktopLayoutElement: HTMLElement

	let isImportPopupOpen = $state(false)

	const checkViewport = () => {
		isMobileView = window.innerWidth <= 480
		disableInactiveInputs()
	}

	const disableInactiveInputs = () => {
		if (mobileLayoutElement && desktopLayoutElement) {
			const mobileInputs = mobileLayoutElement.querySelectorAll('input, textarea, button, select')
			const desktopInputs = desktopLayoutElement.querySelectorAll('input, textarea, button, select')

			// Disable mobile inputs when not in mobile view
			mobileInputs.forEach((input) => {
				if (isMobileView) {
					input.removeAttribute('disabled')
				} else {
					input.setAttribute('disabled', 'disabled')
				}
			})

			// Disable desktop inputs when in mobile view
			desktopInputs.forEach((input) => {
				if (isMobileView) {
					input.setAttribute('disabled', 'disabled')
				} else {
					input.removeAttribute('disabled')
				}
			})
		}
	}

	onMount(() => {
		checkViewport()
		window.addEventListener('resize', checkViewport)

		return () => {
			window.removeEventListener('resize', checkViewport)
		}
	})

	$effect(() => {
		disableInactiveInputs()
	})

	const addIngredient = (ingredientData?: { name?: string; amount?: string; unit?: string }) => {
		if (ingredientData) {
			const safeIngredient = {
				id: generateId(),
				name: ingredientData.name ?? '',
				amount: ingredientData.amount ?? '',
				unit: ingredientData.unit ?? ''
			}
			ingredients = [...ingredients, safeIngredient]
		} else {
			ingredients = [...ingredients, { id: generateId(), name: '', amount: '', unit: '' }]
		}
	}

	const removeIngredient = (id: string) => {
		if (ingredients.length > 1) {
			ingredients = ingredients.filter((ingredient) => ingredient.id !== id)
		}
	}

	const updateIngredient = (
		id: string,
		updatedIngredient: { name?: string; amount?: string; unit?: string }
	) => {
		ingredients = ingredients.map((ingredient) =>
			ingredient.id === id
				? {
						...ingredient,
						name: updatedIngredient.name ?? ingredient.name ?? '',
						amount: updatedIngredient.amount ?? ingredient.amount ?? '',
						unit: updatedIngredient.unit ?? ingredient.unit ?? ''
					}
				: ingredient
		)
	}

	const addInstruction = (instructionData?: { text: string; media?: File }) => {
		if (instructionData) {
			instructions = [...instructions, { id: generateId(), ...instructionData }]
		} else {
			instructions = [...instructions, { id: generateId(), text: '', media: undefined }]
		}
	}

	const removeInstruction = (id: string) => {
		if (instructions.length > 1) {
			instructions = instructions.filter((instruction) => instruction.id !== id)
		}
	}

	const updateInstruction = (id: string, updatedInstruction: { text: string; media?: File }) => {
		instructions = instructions.map((instruction) =>
			instruction.id === id ? { ...instruction, ...updatedInstruction } : instruction
		)
	}

	const searchTags = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!onSearchTags) return []

		const results = await onSearchTags(query)
		return results.map((tag) => ({ id: tag.name, name: tag.name }))
	}

	const searchIngredients = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!onSearchIngredients) return []
		const results = await onSearchIngredients(query)
		return results.map((ingredient) => ({
			id: ingredient.id ?? ingredient.name,
			name: ingredient.name
		}))
	}

	const handleTagSelect = (tag: string, selected: boolean) => {
		if (selected && !selectedTags.includes(tag)) {
			if (selectedTags.length < 3) {
				selectedTags = [...selectedTags, tag]
			}
		} else if (!selected && selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag)
		}
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t !== tag)
	}

	const handleServingsChange = (newServings: number) => {
		servings = newServings
	}

	function openImportPopup() {
		isImportPopupOpen = true
	}

	function closeImportPopup() {
		isImportPopupOpen = false
	}

	function parseIngredient(ingredient: string) {
		// Example: "1 cup sugar" => amount: "1", unit: "cup", name: "sugar"
		const match = ingredient.match(/^([\d/.\-\s]+)?\s*([a-zA-Z]+)?\s*(.*)$/)
		if (match) {
			const [, amount, unit, name] = match
			return {
				amount: amount?.trim() || '',
				unit: unit?.trim() || '',
				name: name?.trim() || ingredient
			}
		}
		return { amount: '', unit: '', name: ingredient }
	}

	let submitting = $state(false)

	function handleRecipeScraped(recipe: RecipeData) {
		// Populate title
		if (recipe.title) {
			title = recipe.title
		}
		// Populate image
		if (recipe.image) {
			image = recipe.image
		}
		// Populate ingredients
		if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
			ingredients = recipe.ingredients.map((raw) => {
				const { amount, unit, name } = parseIngredient(raw)
				return { id: generateId(), name, amount, unit }
			})
		}
		// Populate instructions
		if (recipe.instructions && Array.isArray(recipe.instructions)) {
			instructions = recipe.instructions.map((text) => ({
				id: generateId(),
				text,
				media: undefined
			}))
		}
		// Populate servings
		if (recipe.yields) {
			const match = recipe.yields.match(/\d+/)
			if (match) {
				servings = parseInt(match[0], 10)
			}
		}
		// Populate tags
		if (recipe.tags && Array.isArray(recipe.tags)) {
			selectedTags = recipe.tags.slice(0, 3)
		}
		isImportPopupOpen = false
	}
</script>

<div class="container">
	<div class="page-header">
		<div></div>
		<Button onclick={openImportPopup} variant="border" color="neutral">
			<DownloadIcon color="var(--color-text-on-surface)" size={16} />
			Import Recipe
		</Button>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			submitting = true
			formData.append('servings', servings.toString())

			return async ({ update }) => {
				submitting = false
				update()
			}
		}}
	>
		{#if errors}
			<div class="error-container">
				{#each errors as error}
					<p class="error">{error.path}: {error.message}</p>
				{/each}
			</div>
		{/if}

		<div class="mobile-layout" bind:this={mobileLayoutElement}>
			<MobileLayout
				imageUrl={image ?? undefined}
				{title}
				{servings}
				{ingredients}
				{addIngredient}
				{addInstruction}
				{removeIngredient}
				{updateIngredient}
				{removeInstruction}
				{updateInstruction}
				{instructions}
				{selectedTags}
				{unitSystem}
				{handleServingsChange}
				bind:nutritionMode
				{calories}
				bind:protein
				bind:carbs
				bind:fat
				{searchTags}
				{searchIngredients}
				{handleTagSelect}
				{removeTag}
				{submitting}
			/>
		</div>
		<div class="desktop-layout" bind:this={desktopLayoutElement}>
			<DesktopLayout
				imageUrl={image ?? undefined}
				{title}
				{servings}
				{ingredients}
				{addIngredient}
				{removeIngredient}
				{instructions}
				{addInstruction}
				{removeInstruction}
				{selectedTags}
				{unitSystem}
				{handleServingsChange}
				bind:nutritionMode
				{calories}
				bind:protein
				bind:carbs
				bind:fat
				{searchTags}
				{handleTagSelect}
				{removeTag}
				{submitting}
			/>
		</div>

		{#each selectedTags as tag (tag)}
			<input type="hidden" name="tags" value={tag} />
		{/each}
	</form>
</div>

<ImportRecipePopup
	bind:isOpen={isImportPopupOpen}
	onClose={closeImportPopup}
	onRecipeScraped={handleRecipeScraped}
/>

<style lang="scss">
	@import '../../global.scss';

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);

		h1 {
			margin: 0;
			font-size: var(--font-size-2xl);
			font-weight: 600;
		}

		@include mobile {
			flex-direction: column;
			gap: var(--spacing-md);
			align-items: stretch;
		}
	}

	.error-container {
		background-color: var(--color-error-dark);
		border-radius: var(--border-radius);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.error {
		color: var(--color-error);
		font-size: var(--font-size-sm);
		margin: var(--spacing-xs) 0;
	}

	.mobile-layout {
		display: none;

		@include mobile {
			display: block;
		}
	}

	.desktop-layout {
		display: block;

		@include mobile {
			display: none;
		}
	}
</style>
