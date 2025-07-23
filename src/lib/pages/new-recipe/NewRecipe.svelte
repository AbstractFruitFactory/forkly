<script lang="ts" module>
	export const generateId = () => Math.random().toString(36).slice(2)

	export type RecipeData = {
		id: string
		title: string
		description: string
		image: string
		tags: string[]
		servings: number
		nutritionMode: 'auto' | 'manual' | 'none'
		nutrition?: {
			calories: number
			protein: number
			carbs: number
			fat: number
		}
		instructions: {
			text: string
			mediaUrl?: string
			mediaType?: 'image' | 'video'
			ingredients?: {
				name: string
				quantity: number
				measurement: string
			}[]
		}[]
	}
</script>

<script lang="ts">
	type Ingredient = { id?: string; name: string }
	import { enhance } from '$app/forms'
	import { onMount } from 'svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import DesktopLayout from './DesktopLayout.svelte'
	import MobileLayout from './MobileLayout.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import Input from '$lib/components/input/Input.svelte'
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
	import X from 'lucide-svelte/icons/x'
	import Plus from 'lucide-svelte/icons/plus'
	import Trash from 'lucide-svelte/icons/trash-2'
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import { UNIT_DISPLAY_TEXT, UNITS } from '$lib/utils/unitConversion'

	let {
		prefilledData,
		editMode,
		errors,
		unitSystem = 'imperial',
		onSearchTags,
		onSearchIngredients,
		onUnitChange
	}: {
		prefilledData?: RecipeData
		editMode?: {
			onSave: () => void
		}
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<Ingredient[]>
		unitSystem?: UnitSystem
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		onUnitChange?: (system: UnitSystem) => void
	} = $props()

	let _title = $state(prefilledData?.title ?? '')
	let _description = $state(prefilledData?.description ?? '')
	let servings = $state(prefilledData?.servings ?? 1)
	let selectedTags = $state<string[]>(prefilledData?.tags ?? [])
	let image = $state<string | null>(prefilledData?.image ?? null)

	let nutritionMode = $state<'auto' | 'manual' | 'none'>(prefilledData?.nutritionMode ?? 'auto')
	let calories = $state(prefilledData?.nutrition?.calories ?? '')
	let protein = $state(prefilledData?.nutrition?.protein ?? '')
	let carbs = $state(prefilledData?.nutrition?.carbs ?? '')
	let fat = $state(prefilledData?.nutrition?.fat ?? '')

	let instructions: {
		id: string
		ingredients: { id: string; name?: string; quantity?: number; unit?: string }[]
		text?: string
	}[] = $state(
		prefilledData?.instructions
			? prefilledData.instructions.map((instruction) => ({
					id: generateId(),
					ingredients:
						instruction.ingredients?.map((ingredient) => ({
							id: generateId(),
							name: ingredient.name,
							quantity: ingredient.quantity,
							unit: ingredient.measurement
						})) ?? [],
					text: instruction.text
				}))
			: [{ id: generateId(), ingredients: [] }]
	)

	$effect(() => {
		if (nutritionMode === 'manual') {
			const p = parseFloat(String(protein)) || 0
			const c = parseFloat(String(carbs)) || 0
			const f = parseFloat(String(fat)) || 0
			calories = String(p * 4 + c * 4 + f * 9)
		} else {
			calories = ''
		}
	})

	let isMobileView = $state(false)
	let mobileLayoutElement: HTMLElement
	let desktopLayoutElement: HTMLElement
	let searchValue = $state('')

	const checkViewport = () => {
		isMobileView = window.innerWidth <= 480
	}

	onMount(() => {
		checkViewport()
		window.addEventListener('resize', checkViewport)

		return () => {
			window.removeEventListener('resize', checkViewport)
		}
	})

	const addInstruction = (text?: string) => {
		instructions = [...instructions, { id: generateId(), ingredients: [], text }]
	}

	const removeInstruction = (id: string) => {
		instructions = instructions.filter((instruction) => instruction.id !== id)
	}

	const addIngredient = (instructionId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? { ...instruction, ingredients: [...instruction.ingredients, { id: generateId() }] }
				: instruction
		)
	}

	const removeIngredient = (instructionId: string, ingredientId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? {
						...instruction,
						ingredients: instruction.ingredients.filter(
							(ingredient) => ingredient.id !== ingredientId
						)
					}
				: instruction
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

	const handleUnitChange = (system: UnitSystem) => {
		onUnitChange?.(system)
	}

	let submitting = $state(false)

	const handleAddCustomTag = () => {
		const trimmedValue = searchValue.trim()
		if (trimmedValue && selectedTags.length < 3 && !selectedTags.includes(trimmedValue)) {
			handleTagSelect(trimmedValue, true)
			searchValue = ''
		}
	}

	const getUnits = (system: UnitSystem) => {
		const units: string[] = []

		// Add weight units
		units.push(...(system === 'metric' ? UNITS.weight.metric : UNITS.weight.imperial))

		// Add volume units
		units.push(...(system === 'metric' ? UNITS.volume.metric : UNITS.volume.imperial))

		// Add length units
		units.push(...(system === 'metric' ? UNITS.length.metric : UNITS.length.imperial))

		// Add other units
		units.push(...UNITS.other)

		return units
	}

	const searchUnits = async (query: string): Promise<{ id: string; name: string }[]> => {
		const units = getUnits(unitSystem)
		const filteredUnits = units.filter(
			(unit) =>
				unit.toLowerCase().includes(query.toLowerCase()) ||
				UNIT_DISPLAY_TEXT[unit as keyof typeof UNIT_DISPLAY_TEXT]
					?.toLowerCase()
					.includes(query.toLowerCase())
		)
		return filteredUnits.map((unit) => ({
			id: unit,
			name: UNIT_DISPLAY_TEXT[unit as keyof typeof UNIT_DISPLAY_TEXT] || unit
		}))
	}
</script>

{#snippet title()}
	<Input>
		<input
			bind:value={_title}
			name="title"
			type="text"
			required
			minlength="5"
			maxlength="80"
			placeholder="Enter recipe title"
		/>
	</Input>
{/snippet}

{#snippet description()}
	<Input>
		<textarea
			bind:value={_description}
			name="description"
			placeholder="Describe your recipe (optional)"
			rows="3"
		></textarea>
	</Input>
{/snippet}

{#snippet recipeImage()}
	<MediaUpload
		name="image"
		type="image"
		previewAlt="Recipe preview"
		initialImageUrl={image ?? undefined}
	/>
{/snippet}

{#snippet tags()}
	<div>
		<SuggestionSearch
			bind:searchValue
			disabled={selectedTags.length >= 3}
			placeholder="Search or add custom tag"
			onSearch={searchTags}
			onSelect={(tag) => handleTagSelect(tag.name, true)}
			clearInput={true}
			actionButton={{
				text: 'Add',
				onClick: handleAddCustomTag
			}}
		/>
	</div>

	{#if selectedTags.length > 0}
		{#each selectedTags as tag (tag)}
			<div transition:scale|global={{ duration: 200 }} animate:flip={{ duration: 200 }}>
				<Button variant="pill" color="neutral" size="sm" onclick={() => removeTag(tag)}>
					{tag}
					<X size={14} color="var(--color-text-on-surface)" />
				</Button>
			</div>
		{/each}
	{/if}
{/snippet}

{#snippet nutrition()}
	<div>
		<TabSelect
			options={['auto', 'manual', 'none']}
			onSelect={(opt) => (nutritionMode = opt as 'auto' | 'manual' | 'none')}
		/>
	</div>

	{#if nutritionMode === 'manual'}
		<div class="nutrition-inputs">
			<Input>
				<input
					type="number"
					step="any"
					name="protein"
					placeholder="Protein (g)"
					bind:value={protein}
				/>
			</Input>
			<Input>
				<input type="number" step="any" name="carbs" placeholder="Carbs (g)" bind:value={carbs} />
			</Input>
			<Input>
				<input type="number" step="any" name="fat" placeholder="Fat (g)" bind:value={fat} />
			</Input>
			<Input>
				<input
					type="text"
					name="calories"
					placeholder="Calories"
					value={`${calories} kcal`}
					readonly
				/>
			</Input>
		</div>
	{/if}
{/snippet}

{#snippet ingredientRow(id: string, instructionId: string, nameValue?: string, amountValue?: string, unitValue?: string)}
	<div class="ingredient-input-container">
		<div class="ingredient-row">
			<div class="search">
				<SuggestionSearch
					placeholder="Enter ingredient"
					onSearch={searchIngredients}
					formName="instructions-{instructionId}-ingredient-{id}-name"
					clearInput={false}
					searchValue={nameValue}
				/>
			</div>
		</div>

		<div class="quantity-unit-row">
			<div class="quantity-input">
				<Input>
					<input
						type="number"
						step="any"
						name="instructions-{instructionId}-ingredient-{id}-amount"
						placeholder="Enter amount"
						value={amountValue}
					/>
				</Input>
			</div>

			<div class="unit-input">
				<SuggestionSearch
					placeholder="Unit"
					formName="instructions-{instructionId}-ingredient-{id}-unit"
					onSearch={searchUnits}
					clearInput={false}
					showSearchIcon={false}
					minSearchLength={2}
					useId={true}
					searchValue={unitValue}
				/>
			</div>
		</div>

		<button
			type="button"
			class="remove-btn"
			onclick={() => removeIngredient(instructionId, id)}
			aria-label="Remove ingredient"
		>
			<Trash size={16} />
		</button>
	</div>
{/snippet}

{#snippet servingsAdjuster()}
	<ServingsAdjuster {servings} onServingsChange={handleServingsChange} />
{/snippet}

{#snippet unitToggle()}
	<UnitToggle state={unitSystem} onSelect={handleUnitChange} />
{/snippet}

{#snippet instructionInput(id: string, value?: string)}
	<Input>
		<textarea name={`instructions-${id}-text`} placeholder="Enter instruction step" rows="5"
			{value}
		></textarea>
	</Input>
{/snippet}

{#snippet instructionMedia(id: string, onFile?: (file: File) => void)}
	<MediaUpload name={`instructions-${id}-media`} {onFile} previewAlt="Instruction media" />
{/snippet}

{#snippet submitButton()}
	<Button loading={submitting} type="submit" color="primary"
		>{editMode ? 'Save' : 'Create'} Recipe</Button
	>
{/snippet}

{#snippet addInstructionButton(fullWidth?: boolean)}
	<Button color="neutral" onclick={() => addInstruction()} size="sm" {fullWidth}>
		<Plus size={16} color="var(--color-text-on-surface)" />
		Add step
	</Button>
{/snippet}

{#snippet addIngredientButton(instructionId: string, fullWidth?: boolean)}
	<Button color="neutral" onclick={() => addIngredient(instructionId)} size="sm" {fullWidth}>
		<Plus size={16} color="var(--color-text-on-surface)" />
		Add Ingredient
	</Button>
{/snippet}

{#snippet removeInstructionButton(instructionId: string)}
	{#if instructions.length > 1}
		<button
			type="button"
			class="remove-btn"
			onclick={() => removeInstruction(instructionId)}
			aria-label="Remove instruction"
		>
			<Trash size={16} />
		</button>
	{/if}
{/snippet}

<div class="new-recipe">
	<form
		method="POST"
		action={editMode ? '/new?/update' : '/new?/create'}
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			submitting = true
			formData.append('id', prefilledData?.id ?? '')
			formData.append('servings', servings.toString())

			selectedTags.forEach((tag) => {
				formData.append('tags', tag)
			})

			formData.append('nutritionMode', nutritionMode)

			return async ({ update }) => {
				submitting = false
				editMode?.onSave()
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

		{#if isMobileView}
			<div class="mobile-layout" bind:this={mobileLayoutElement}>
				<MobileLayout
					{instructions}
					{title}
					{description}
					{recipeImage}
					{tags}
					{nutrition}
					{servingsAdjuster}
					{unitToggle}
					{instructionInput}
					{instructionMedia}
					{ingredientRow}
					{addInstructionButton}
					{addIngredientButton}
					{removeInstructionButton}
					{submitButton}
				/>
			</div>
		{:else}
			<div class="desktop-layout" bind:this={desktopLayoutElement}>
				<DesktopLayout
					{instructions}
					{title}
					{description}
					{recipeImage}
					{tags}
					{nutrition}
					{servingsAdjuster}
					{unitToggle}
					{instructionInput}
					{instructionMedia}
					{ingredientRow}
					{addInstructionButton}
					{addIngredientButton}
					{removeInstructionButton}
					{submitButton}
				/>
			</div>
		{/if}
	</form>
</div>

<style lang="scss">
	@import '../../global.scss';

	.new-recipe {
		max-width: 1200px;
		margin: 0 auto;
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

	.nutrition-inputs {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-md);
	}

	.ingredient-input-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);

		@include tablet-desktop {
			flex-direction: row;
			gap: 1px;
			align-items: center;
		}
	}

	.ingredient-row {
		width: 100%;
	}

	.quantity-unit-row {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
		width: 100%;

		@include tablet-desktop {
			gap: 1px;
		}
	}

	.search {
		width: 100%;

		@include tablet-desktop {
			flex: 1;
			min-width: 0;

			:global(.input-container) {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
			}
		}

		:global(.search-wrapper) {
			max-width: none;
		}
	}

	.quantity-input {
		flex: 1;

		@include tablet-desktop {
			flex: 0 0 auto;

			:global(.input-container) {
				border-radius: 0;
				border-left: none;
				border-right: none;
			}
		}
	}

	.unit-input {
		flex: 1;
		position: relative;

		@include tablet-desktop {
			flex: auto;

			:global(.input-container) {
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
				border-left: none;
			}
		}

		:global(.suggestion-search-wrapper) {
			max-width: none;
		}
	}

	.ingredient-input {
		margin-bottom: var(--spacing-md);

		&:last-child {
			margin-bottom: var(--spacing-lg);
		}
	}

	.remove-btn {
		height: 36px;
		width: 36px;
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-fast) var(--ease-in-out);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--color-text-on-surface);

		&:hover {
			background-color: var(--color-background-dark);
		}

		@include tablet-desktop {
			margin-left: var(--spacing-xs);
		}
	}
</style>
