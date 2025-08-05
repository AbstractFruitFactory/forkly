<script lang="ts" module>
	export const generateId = () => Math.random().toString(36).slice(2)

	export type PrefilledData = {
		id?: string
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
			ingredients: {
				name: string
				quantity?: string
				measurement?: string
			}[]
		}[]
	}

	type Ingredient = { id?: string; name: string }
</script>

<script lang="ts">
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
	import DownloadIcon from 'lucide-svelte/icons/download'
	import ImportRecipePopup from '$lib/components/recipe-scraper/ImportRecipePopup.svelte'
	import AnonUploadPopup from '$lib/components/recipe-scraper/AnonUploadPopup.svelte'
	import LoginPopup from '$lib/components/login-popup/LoginPopup.svelte'
	import type { ImportedRecipeData } from '../../../../scripts/import-recipe-worker'
	import FormError from '$lib/components/form-error/FormError.svelte'

	let {
		prefilledData,
		editMode,
		draftMode,
		errors,
		unitSystem = 'imperial',
		onSearchTags,
		onSearchIngredients,
		onUnitChange,
		isLoggedIn
	}: {
		prefilledData?: PrefilledData
		editMode?: {
			onSave: () => void
		}
		draftMode?: {
			onSaveDraft: () => void
			onPublish: () => void
		}
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<Ingredient[]>
		unitSystem?: UnitSystem
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		onUnitChange?: (system: UnitSystem) => void
		isLoggedIn?: Promise<boolean>
	} = $props()

	let _id = $state(prefilledData?.id ?? '')
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
		ingredients: {
			id: string
			name?: string
			quantity?: string
			unit?: string
		}[]
		text?: string
		mediaUrl?: string
		mediaType?: 'image' | 'video'
	}[] = $derived(
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
					text: instruction.text,
					mediaUrl: instruction.mediaUrl,
					mediaType: instruction.mediaType
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
	let isImportPopupOpen = $state(false)
	let isAnonUploadPopupOpen = $state(false)
	let isLoginPopupOpen = $state(false)
	let willUploadAnonymously = $state(false)

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

	const populateFromRecipe = (recipe: ImportedRecipeData) => {
		console.log('recipe', recipe)
		_title = recipe.title ?? ''
		_description = recipe.description ?? ''
		servings = recipe.servings ?? 1
		selectedTags = recipe.tags ?? []
		image = recipe.image ?? null
		nutritionMode = recipe.nutritionMode ?? 'auto'
		if (recipe.nutrition) {
			calories = recipe.nutrition.calories ?? ''
			protein = recipe.nutrition.protein ?? ''
			carbs = recipe.nutrition.carbs ?? ''
			fat = recipe.nutrition.fat ?? ''
		}

		instructions = (recipe.instructions ?? []).map((instruction) => ({
			id: generateId(),
			text: instruction.text,
			mediaUrl: instruction.mediaUrl,
			mediaType: instruction.mediaType,
			ingredients: (instruction.ingredients ?? []).map((ingredient) => ({
				id: generateId(),
				name: ingredient.name,
				quantity: ingredient.quantity,
				unit: ingredient.measurement
			}))
		}))
	}

	const formErrors = $derived((path: string) =>
		errors?.filter((error) => error.path === path).map((error) => error.message)
	)
</script>

{#snippet title()}
	<FormError errors={formErrors('title')}>
		{#snippet formInput(closePopover)}
			<Input>
				<input
					bind:value={_title}
					name="title"
					type="text"
					minlength="5"
					maxlength="80"
					placeholder="Enter recipe title"
					oninput={() => closePopover()}
				/>
			</Input>
		{/snippet}
	</FormError>
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
		initialMedia={image ? { url: image, type: 'image' } : undefined}
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

{#snippet ingredientRow(
	id: string,
	instructionId: string,
	nameValue?: string,
	amountValue?: string,
	unitValue?: string,
	instructionIndex?: number,
	ingredientIndex?: number
)}
	<div class="ingredient-row">
		<div class="ingredient-input">
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
					<FormError errors={formErrors(`instructions.${instructionIndex}.ingredients.${ingredientIndex}.quantity`)}>
						{#snippet formInput(closePopover)}
							<Input>
								<input
									type="text"
									name="instructions-{instructionId}-ingredient-{id}-amount"
									placeholder="Enter amount"
									value={amountValue}
									oninput={() => closePopover()}
								/>
							</Input>
						{/snippet}
					</FormError>
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
		</div>

		<div>
			<button
				type="button"
				class="remove-btn"
				onclick={() => removeIngredient(instructionId, id)}
				aria-label="Remove ingredient"
			>
				<Trash size={16} />
			</button>
		</div>
	</div>
{/snippet}

{#snippet servingsAdjuster()}
	<ServingsAdjuster {servings} onServingsChange={handleServingsChange} />
{/snippet}

{#snippet unitToggle()}
	<UnitToggle state={unitSystem} onSelect={handleUnitChange} />
{/snippet}

{#snippet instructionInput(id: string, index: number, value?: string)}
	<FormError errors={formErrors(`instructions.${index}.text`)}>
		{#snippet formInput(closePopover)}
			<Input>
				<textarea
					name={`instructions-${id}-text`}
					placeholder="Enter instruction step"
					rows="5"
					{value}
					oninput={() => closePopover()}
				></textarea>
			</Input>
		{/snippet}
	</FormError>
{/snippet}

{#snippet instructionMedia(
	id: string,
	initialMedia?: { url: string; type: 'image' | 'video' },
	onFile?: (file: File) => void
)}
	<MediaUpload
		name={`instructions-${id}-media`}
		{onFile}
		previewAlt="Instruction media"
		{initialMedia}
	/>
{/snippet}

{#snippet saveDraftButton(fullWidth?: boolean)}
	{#if !editMode}
		<Button
			disabled={!isLoggedIn}
			{fullWidth}
			formaction="?/saveDraft"
			loading={submitting}
			type="submit"
			color="neutral"
		>
			Save Draft
		</Button>
	{/if}
{/snippet}

{#snippet submitButton(fullWidth?: boolean)}
	<Button
		disabled={!isLoggedIn}
		{fullWidth}
		formaction={editMode ? '?/updateRecipe' : '?/createRecipe'}
		loading={submitting}
		type="submit"
		color="primary"
	>
		{editMode ? 'Save' : 'Upload'} Recipe
	</Button>
{/snippet}

{#snippet addInstructionButton(fullWidth?: boolean)}
	<Button {fullWidth} color="neutral" onclick={() => addInstruction()} size="sm">
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
		enctype="multipart/form-data"
		use:enhance={async ({ formData, cancel, action }) => {
			const loggedIn = await isLoggedIn

			if (!loggedIn && !willUploadAnonymously && !editMode && !draftMode) {
				if (action?.search?.includes('saveDraft') && !loggedIn) {
					isLoginPopupOpen = true
					cancel()
					return
				}

				isAnonUploadPopupOpen = true
				cancel()
				return
			}

			submitting = true

			formData.append('servings', servings.toString())
			formData.append('id', _id)

			selectedTags.forEach((tag) => {
				formData.append('tags', tag)
			})

			formData.append('nutritionMode', nutritionMode)

			formData.append('draft', draftMode ? 'true' : 'false')

			return async ({ result, update }) => {
				submitting = false

				if (result.type === 'success' || result.type === 'redirect') {
					editMode?.onSave()

					if (draftMode) {
						if (action?.search?.includes('saveDraft')) {
							draftMode.onSaveDraft()
						} else {
							draftMode.onPublish()
						}
					}
				}
				update()
			}
		}}
	>
		{#if errors && (errors.find((error) => error.path === 'ingredients') || errors.find((error) => error.path === 'api'))}
			<div class="error-container">
				{#each errors as error}
					<p class="error">{error.message}</p>
				{/each}
			</div>
		{/if}

		<div class="page-header">
			<div></div>

			<Button
				disabled={!isLoggedIn}
				onclick={() => {
					if (!isLoggedIn) {
						isLoginPopupOpen = true
					} else {
						isImportPopupOpen = true
					}
				}}
				variant="border"
				color="neutral"
			>
				<DownloadIcon color="var(--color-text-on-surface)" size={16} />
				Import Recipe
			</Button>
		</div>

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
					{saveDraftButton}
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
					{saveDraftButton}
				/>
			</div>
		{/if}

		<AnonUploadPopup
			bind:isOpen={isAnonUploadPopupOpen}
			onClose={() => (isAnonUploadPopupOpen = false)}
			onUploadAnonymously={() => {
				willUploadAnonymously = true
			}}
		/>

		<LoginPopup bind:isOpen={isLoginPopupOpen} onClose={() => (isLoginPopupOpen = false)} />
	</form>
</div>

<ImportRecipePopup
	bind:isOpen={isImportPopupOpen}
	onClose={() => (isImportPopupOpen = false)}
	onRecipeScraped={populateFromRecipe}
/>

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

	.nutrition-inputs {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-md);
	}

	.ingredient-row {
		display: flex;
		align-items: center;

		@include mobile {
			display: flex;
			align-items: stretch;
			gap: var(--spacing-md);
		}
	}

	.ingredient-input {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);

		@include mobile {
			.ingredient-row & {
				margin-bottom: 0;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		@include tablet-desktop {
			flex-direction: row;
			gap: 1px;
			align-items: center;
		}
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

	.remove-btn {
		height: 36px;
		width: 36px;
		border-radius: var(--border-radius-lg);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--color-text-on-surface);
		transition: all var(--transition-fast) var(--ease-in-out);
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background-color: var(--color-secondary);
		}

		@include mobile {
			height: 100%;
			background: var(--color-secondary);
		}

		@include tablet-desktop {
			margin-left: var(--spacing-xs);
		}
	}
</style>
