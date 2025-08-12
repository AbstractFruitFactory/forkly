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
	import X from 'lucide-svelte/icons/x'
	import Plus from 'lucide-svelte/icons/plus'
	import Trash from 'lucide-svelte/icons/trash-2'
	import ChevronUp from 'lucide-svelte/icons/chevron-up'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'
	import ArrowUp from 'lucide-svelte/icons/corner-left-up'
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import {
		UNIT_DISPLAY_SINGULAR as UNIT_DISPLAY_TEXT,
		UNITS,
		parseQuantityToNumber
	} from '$lib/utils/ingredient-formatting'
	import DownloadIcon from 'lucide-svelte/icons/download'
	import ImportRecipePopup from '$lib/components/recipe-scraper/ImportRecipePopup.svelte'
	import AnonUploadPopup from '$lib/components/recipe-scraper/AnonUploadPopup.svelte'
	import LoginPopup from '$lib/components/login-popup/LoginPopup.svelte'
	import type { ImportedRecipeData } from '../../../../scripts/import-recipe-worker'
	import FormError from '$lib/components/form-error/FormError.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import Info from 'lucide-svelte/icons/info'
	import RecipePopup from '$lib/components/recipe-popup/RecipePopup.svelte'
	import { formValidationSchema } from '$lib/validation/recipe-form.schema'
	import * as v from 'valibot'
	import { parseFormData as parseRecipeForm } from '$lib/validation/parse-recipe-form'

	let {
		prefilledData,
		editMode,
		draftMode,
		errors,
		unitSystem = 'imperial',
		onSearchTags,
		onUnitChange,
		isLoggedIn
	}: {
		prefilledData?: PrefilledData
		editMode?: { onSave: () => void }
		draftMode?: { onSaveDraft: () => void; onPublish: () => void }
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<Ingredient[]>
		unitSystem?: UnitSystem
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		onUnitChange?: (system: UnitSystem) => void
		isLoggedIn?: Promise<boolean>
	} = $props()

	let _id = $derived(prefilledData?.id ?? '')
	let _title = $derived(prefilledData?.title ?? '')
	let _description = $derived(prefilledData?.description ?? '')
	let servings = $derived(prefilledData?.servings ?? 1)
	let selectedTags = $derived<string[]>(prefilledData?.tags ?? [])
	let image = $derived<string | null>(prefilledData?.image ?? null)
	let calories = $derived(prefilledData?.nutrition?.calories ?? '')
	let protein = $derived(prefilledData?.nutrition?.protein ?? '')
	let carbs = $derived(prefilledData?.nutrition?.carbs ?? '')
	let fat = $derived(prefilledData?.nutrition?.fat ?? '')

	let instructions: {
		id: string
		ingredients: {
			id: string
			name?: string
			quantity?: string
			unit?: string
			isPrepared?: boolean
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
							unit: ingredient.measurement,
							isPrepared: false
						})) ?? [],
					text: instruction.text,
					mediaUrl: instruction.mediaUrl,
					mediaType: instruction.mediaType
				}))
			: [{ id: generateId(), ingredients: [] }]
	)

	let isMobileView = $state(false)
	let searchValue = $state('')
	let isImportPopupOpen = $state(false)
	let isAnonUploadPopupOpen = $state(false)
	let isLoginPopupOpen = $state(false)
	let willUploadAnonymously = $state(false)
	let estimatingNutrition = $state(false)
	let displayNutrition = $state(false)

	let previewPopup = $state<RecipePopup>()
	let previewRecipeData = $state<any>(null)
	let confirmUpload = $state(false)
	let formEl = $state<HTMLFormElement>()

	const buildPreviewData = () => {
		const formData = new FormData(formEl!)
		const parsed = parseRecipeForm(formData)

		const instructionsForRecipe = parsed.instructions.map((ins, index) => {
			const clientId = instructions[index]?.id
			const mediaUrl = clientId
				? formData.get(`instructions-${clientId}-media-url`)?.toString()
				: undefined
			const mediaType = clientId
				? (formData.get(`instructions-${clientId}-media-type`)?.toString() as
						| 'image'
						| 'video'
						| undefined)
				: undefined
			return {
				text: ins.text || '',
				mediaUrl: mediaUrl,
				mediaType: mediaType,
				ingredients: (ins.ingredients || []).map((ing) => ({
					name: ing.name || '',
					quantity: ing.quantity
						? { text: String(ing.quantity), numeric: parseQuantityToNumber(ing.quantity) }
						: undefined,
					measurement: ing.measurement || '',
					displayName: ing.displayName || ing.name || '',
					isPrepared: ing.isPrepared === true
				}))
			}
		})

		const flatIngredients = parsed.instructions
			.flatMap((ins) => ins.ingredients || [])
			.filter((ing) => !ing.isPrepared && ing.name)
		const ingredients = flatIngredients.map((ing) => ({
			id: generateId(),
			name: ing.name,
			quantity: ing.quantity
				? { text: String(ing.quantity), numeric: parseQuantityToNumber(ing.quantity) }
				: undefined,
			measurement: ing.measurement || '',
			displayName: ing.displayName || ing.name
		}))

		const nutrition = displayNutrition
			? {
					calories: parseFloat(String(calories)) || 0,
					protein: parseFloat(String(protein)) || 0,
					carbs: parseFloat(String(carbs)) || 0,
					fat: parseFloat(String(fat)) || 0
				}
			: undefined

		const previewRecipe = {
			id: _id || generateId(),
			title: parsed.title,
			description: parsed.description,
			instructions: instructionsForRecipe,
			tags: selectedTags,
			imageUrl: image || undefined,
			createdAt: new Date(),
			servings: servings,
			ingredients,
			nutrition
		}

		return {
			recipe: previewRecipe,
			comments: { comments: [], total: 0 },
			collections: [],
			isLoggedIn: false
		}
	}

	function validateBeforePreview(): boolean {
		const data = parseRecipeForm(new FormData(formEl!))
		const result = v.safeParse(formValidationSchema, data as any)
		if (!result.success) {
			const errs: { path: string; message: string }[] = []
			for (const issue of result.issues) {
				const path =
					Array.isArray(issue.path) && issue.path.length > 0
						? issue.path.map((p) => (typeof p.key === 'string' ? p.key : String(p.key))).join('.')
						: 'api'
				errs.push({ path, message: issue.message })
			}
			errors = errs
			console.log('Form validation failed; not opening preview', errs)
			return false
		}

		errors = []

		return true
	}

	async function estimateNutrition() {
		estimatingNutrition = true
		try {
			const ingredients = instructions
				.flatMap((ins) => ins.ingredients)
				.filter((ing) => !ing.isPrepared && ing.name)
				.map((ing) => ({
					amount: ing.quantity ? parseFloat(ing.quantity) : undefined,
					unit: ing.unit,
					name: ing.name!
				}))
			const body = {
				ingredients,
				instructions: instructions.map((i) => i.text ?? '').join('\n'),
				servings
			}
			const res = await fetch('/estimate-nutrition', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			if (!res.ok) throw new Error('Failed to estimate nutrition')
			const data = await res.json()
			protein = String(data.protein)
			carbs = String(data.carbs)
			fat = String(data.fat)
			calories = String(data.calories)
		} catch (e) {
			console.error(e)
		} finally {
			estimatingNutrition = false
		}
	}

	const checkViewport = () => {
		isMobileView = window.innerWidth <= 480
	}

	onMount(() => {
		checkViewport()
		window.addEventListener('resize', checkViewport)

		try {
			const raw = sessionStorage.getItem('forkly_prefilled_recipe')
			if (raw) {
				const recipe = JSON.parse(raw) as ImportedRecipeData
				console.log('Prefilling new recipe from sessionStorage')
				populateFromRecipe(recipe)
				sessionStorage.removeItem('forkly_prefilled_recipe')
			}
		} catch {}

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

	const moveInstructionUp = (id: string) => {
		const index = instructions.findIndex((instruction) => instruction.id === id)
		if (index > 0) {
			const newInstructions = [...instructions]
			const temp = newInstructions[index]
			newInstructions[index] = newInstructions[index - 1]
			newInstructions[index - 1] = temp
			instructions = newInstructions
		}
	}

	const moveInstructionDown = (id: string) => {
		const index = instructions.findIndex((instruction) => instruction.id === id)
		if (index < instructions.length - 1) {
			const newInstructions = [...instructions]
			const temp = newInstructions[index]
			newInstructions[index] = newInstructions[index + 1]
			newInstructions[index + 1] = temp
			instructions = newInstructions
		}
	}

	const addIngredient = (instructionId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? { ...instruction, ingredients: [...instruction.ingredients, { id: generateId() }] }
				: instruction
		)
	}

	const addPreparedIngredient = (instructionId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? {
						...instruction,
						ingredients: [...instruction.ingredients, { id: generateId(), isPrepared: true }]
					}
				: instruction
		)
	}

	const handleIngredientNameInput = (
		instructionId: string,
		ingredientId: string,
		value: string
	) => {
		instructions = instructions.map((ins) =>
			ins.id !== instructionId
				? ins
				: {
						...ins,
						ingredients: ins.ingredients.map((ing) =>
							ing.id === ingredientId ? { ...ing, name: value } : ing
						)
					}
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

	const updateInstructionMedia = (instructionId: string, file: File) => {
		const mediaType = file.type.startsWith('image/') ? 'image' : 'video'

		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? { ...instruction, mediaType, mediaUrl: 'uploaded' }
				: instruction
		)
	}

	const searchTags = async (query: string): Promise<{ id: string; name: string }[]> => {
		if (!onSearchTags) return []

		const results = await onSearchTags(query)
		return results.map((tag) => ({ id: tag.name, name: tag.name }))
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
		_title = recipe.title ?? ''
		_description = recipe.description ?? ''
		servings = recipe.servings ?? 1
		selectedTags = recipe.tags ?? []
		image = recipe.image ?? null

		if (recipe.nutrition) {
			calories = recipe.nutrition.calories ?? ''
			protein = recipe.nutrition.protein ?? ''
			carbs = recipe.nutrition.carbs ?? ''
			fat = recipe.nutrition.fat ?? ''
		}
		displayNutrition = Boolean(recipe.nutrition)

		instructions = (recipe.instructions ?? []).map((instruction) => ({
			id: generateId(),
			text: instruction.text,
			mediaUrl: instruction.mediaUrl ?? undefined,
			mediaType: instruction.mediaType ?? undefined,
			ingredients: (instruction.ingredients ?? []).map((ingredient) => ({
				id: generateId(),
				name: ingredient.name,
				quantity: ingredient.isPrepared ? undefined : ingredient.quantity,
				unit: ingredient.isPrepared ? undefined : ingredient.measurement,
				isPrepared: ingredient.isPrepared === true
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
		<div class="checkbox-label">
			<input
				id="display-nutrition"
				type="checkbox"
				name="displayNutrition"
				bind:checked={displayNutrition}
				aria-labelledby="display-nutrition-label"
			/>
			<span id="display-nutrition-label">Display nutrition</span>
		</div>
	</div>
	{#if displayNutrition}
		<div class="nutrition-inputs">
			<Input>
				<input type="number" name="protein" placeholder="Protein (g)" bind:value={protein} />
			</Input>
			<Input>
				<input type="number" name="carbs" placeholder="Carbs (g)" bind:value={carbs} />
			</Input>
			<Input>
				<input type="number" name="fat" placeholder="Fat (g)" bind:value={fat} />
			</Input>
			<Input>
				<input name="calories" placeholder="Calories" value={`${calories} kcal`} readonly />
			</Input>
			<Button color="neutral" onclick={estimateNutrition} loading={estimatingNutrition}>
				Auto-estimate
			</Button>
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
	{@const currentInstruction = instructions.find((ins) => ins.id === instructionId)}
	{@const currentIngredient = currentInstruction?.ingredients.find((ing) => ing.id === id)}
	<div class="ingredient-row">
		<div class="ingredient-input">
			<div class="ingredient-row">
				<div class={currentIngredient?.isPrepared ? 'prepared-search' : 'search'}>
					{#if currentIngredient?.isPrepared}
						<div class="prepared-display">
							<div class="prepared-arrow"><ArrowUp size={18} color="var(--color-neutral)" /></div>
							<Input>
								<input
									type="text"
									placeholder="Prepared ingredient name"
									name="instructions-{instructionId}-ingredient-{id}-name"
									value={nameValue}
									oninput={(e) =>
										handleIngredientNameInput(
											instructionId,
											id,
											(e.target as HTMLInputElement).value
										)}
								/>
							</Input>
							<input
								type="hidden"
								name="instructions-{instructionId}-ingredient-{id}-isPrepared"
								value="true"
							/>
						</div>
					{:else}
						<Input>
							<input
								type="text"
								placeholder="Enter ingredient"
								name="instructions-{instructionId}-ingredient-{id}-name"
								value={nameValue}
								oninput={(e) =>
									handleIngredientNameInput(
										instructionId,
										id,
										(e.target as HTMLInputElement).value
									)}
							/>
						</Input>
					{/if}
				</div>
			</div>

			{#if !currentIngredient?.isPrepared}
				<div class="quantity-unit-row">
					<div class="quantity-input">
						<FormError
							errors={formErrors(
								`instructions.${instructionIndex}.ingredients.${ingredientIndex}.quantity`
							)}
						>
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
			{/if}
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

{#snippet instructionMedia(id: string, initialMedia?: { url: string; type: 'image' | 'video' })}
	<MediaUpload
		name={`instructions-${id}-media`}
		onFile={(file) => updateInstructionMedia(id, file)}
		previewAlt="Instruction media"
		initialMedia={initialMedia?.url === 'uploaded' ? undefined : initialMedia}
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
		color="secondary"
	>
		Preview Recipe
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

{#snippet addPreparedIngredientButton(instructionId: string, fullWidth?: boolean)}
	<div class="prepared-add-wrapper" class:full-width={fullWidth}>
		<Button
			color="neutral"
			onclick={() => addPreparedIngredient(instructionId)}
			size="sm"
			{fullWidth}
		>
			<Plus size={16} color="var(--color-text-on-surface)" />
			Add prepared ingredient
		</Button>
		<Popover triggerOn={isMobileView ? 'click' : 'hover'} placement="top">
			{#snippet trigger()}
				<button type="button" class="info-btn" aria-label="What is a prepared ingredient?">
					<Info size={16} color="var(--color-text-on-surface)" />
				</button>
			{/snippet}
			{#snippet content()}
				<div class="prepared-info-content">
					References something that was made in a previous step - won't be included in the
					ingredients list.
				</div>
			{/snippet}
		</Popover>
	</div>
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

{#snippet moveInstructionUpButton(instructionId: string, index: number)}
	{#if index > 0}
		<button
			type="button"
			class="reorder-btn"
			onclick={() => moveInstructionUp(instructionId)}
			aria-label="Move instruction up"
		>
			<ChevronUp size={16} />
		</button>
	{/if}
{/snippet}

{#snippet moveInstructionDownButton(instructionId: string, index: number)}
	{#if index < instructions.length - 1}
		<button
			type="button"
			class="reorder-btn"
			onclick={() => moveInstructionDown(instructionId)}
			aria-label="Move instruction down"
		>
			<ChevronDown size={16} />
		</button>
	{/if}
{/snippet}

{#snippet importButton()}
	<Button
		onclick={() => {
			isImportPopupOpen = true
		}}
		variant="border"
		color="neutral"
	>
		<DownloadIcon color="var(--color-text-on-surface)" size={16} />
		Import Recipe
	</Button>
{/snippet}

{#snippet headerText()}
	<div class="header-text">
		<h1>Paste your recipe, get a beautiful shareable page instantly.</h1>
	</div>
{/snippet}

<div class="new-recipe">
	<form
		bind:this={formEl}
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

			// Intercept create/update submit for preview
			if (!action?.search?.includes('saveDraft')) {
				if (!confirmUpload) {
					if (!validateBeforePreview()) {
						cancel()
						return
					}
					previewRecipeData = buildPreviewData()
					await previewPopup?.open()
					cancel()
					return
				} else {
					confirmUpload = false
				}
			}

			submitting = true

			formData.append('servings', servings.toString())
			formData.append('id', _id)

			selectedTags.forEach((tag) => {
				formData.append('tags', tag)
			})

			formData.append('displayNutrition', displayNutrition ? 'true' : 'false')

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

		{#if isMobileView}
			<div class="mobile-layout">
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
					{addPreparedIngredientButton}
					{removeInstructionButton}
					{moveInstructionUpButton}
					{moveInstructionDownButton}
					{submitButton}
					{saveDraftButton}
					{importButton}
					headerText={!editMode && !draftMode ? headerText : undefined}
				/>
			</div>
		{:else}
			<div class="desktop-layout">
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
					{addPreparedIngredientButton}
					{removeInstructionButton}
					{moveInstructionUpButton}
					{moveInstructionDownButton}
					{submitButton}
					{saveDraftButton}
					{importButton}
					headerText={!editMode && !draftMode ? headerText : undefined}
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

<RecipePopup
	bind:this={previewPopup}
	onClose={() => previewPopup!.close()}
	recipeData={previewRecipeData}
	onBack={() => previewPopup!.close()}
	preview={previewRecipeData?.recipe}
	actionText={editMode ? 'Save' : 'Upload'}
	onUpload={async () => {
		confirmUpload = true
		const selector = editMode
			? 'button[formaction*="updateRecipe"]'
			: 'button[formaction*="createRecipe"]'
		const btn = formEl?.querySelector(selector) as HTMLButtonElement | null
		previewPopup?.close()
		await new Promise((resolve) => setTimeout(resolve, 300))

		if (btn) {
			btn.click()
		} else {
			formEl?.requestSubmit()
		}
	}}
/>

<ImportRecipePopup
	bind:isOpen={isImportPopupOpen}
	onClose={() => (isImportPopupOpen = false)}
	onRecipeScraped={populateFromRecipe}
/>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

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

	.prepared-search {
		width: 100%;
		@include tablet-desktop {
			flex: 1;
			min-width: 0;
			:global(.input-container) {
				border-radius: var(--border-radius-2xl);
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

	.reorder-btn {
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
	}

	.prepared-display {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-text-on-surface);
	}

	.prepared-arrow {
		margin-bottom: 6px;
	}

	.info-btn {
		height: 28px;
		width: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;

		@include mobile {
			display: none;
		}
	}

	.prepared-info-content {
		max-width: 260px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--color-text-on-surface);
		margin-bottom: var(--spacing-sm);
	}
</style>
