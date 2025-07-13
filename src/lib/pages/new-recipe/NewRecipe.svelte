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

	let isMobileView = $state(false)
	let mobileLayoutElement: HTMLElement
	let desktopLayoutElement: HTMLElement

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

	let submitting = $state(false)
</script>

<div class="container">
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
				{searchTags}
				{searchIngredients}
				{handleTagSelect}
				{removeTag}
				{submitting}
			/>
		</div>
		<div class="desktop-layout" bind:this={desktopLayoutElement}>
			<DesktopLayout
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

<style lang="scss">
	@import '../../global.scss';

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
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
