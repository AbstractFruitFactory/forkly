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
			text?: string
			hint?: string
			mediaUrl?: string
			mediaType?: 'image' | 'video'
			ingredients?: {
				name: string
				quantity?: string
				measurement?: string
			}[]
		}[]
	}
</script>

<script lang="ts">
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
	import LoginPopup from '$lib/components/login-popup/LoginPopup.svelte'
	import type { ImportedRecipeData } from '../../../../scripts/import-recipe-worker'
	import FormError from '$lib/components/form-error/FormError.svelte'
	import Popover from '$lib/components/popover/Popover.svelte'
	import Info from 'lucide-svelte/icons/info'
	import { formValidationSchema } from '$lib/validation/recipe-form.schema'
	import * as v from 'valibot'
	import { goto } from '$app/navigation'
	import { createRecipe, updateRecipe } from '$lib/remote-functions/recipe.remote'
	import { deleteDraft, saveDraft, updateDraft } from '$lib/remote-functions/draft.remote'
	import { nullToUndefined } from '$lib/utils/nullToUndefined'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'

	type UIIngredient = {
		id: string
		name: string
		quantity?: string
		measurement?: string
		isPrepared?: boolean
	}

	type UIInstruction = {
		id: string
		ingredients: UIIngredient[]
		text: string
		hint?: string
		mediaUrl?: string
		mediaType?: 'image' | 'video'
	}

	let {
		prefilledData,
		editMode,
		draftMode,
		errors,
		unitSystem = 'imperial',
		onSearchTags,
		onUnitChange,
		isLoggedIn,
		onCreated,
		onOpenPreview
	}: {
		prefilledData?: PrefilledData
		editMode?: { onSave: () => void }
		draftMode?: { onSaveDraft: () => void; onPublish: () => void }
		errors?: { path: string; message: string }[]
		unitSystem?: UnitSystem
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
		onUnitChange?: (system: UnitSystem) => void
		isLoggedIn?: Promise<boolean>
		onCreated?: (recipeId: string) => void
		onOpenPreview?: () => void
	} = $props()

	const toFlatPreviewIngredients = () => {
		const flat = instructions
			.flatMap((ins) => ins.ingredients || [])
			.filter((ing) => !ing.isPrepared && ing.name)
		return flat.map((ing) => ({
			id: generateId(),
			name: ing.name!,
			displayName: ing.name!,
			quantity: ing.quantity
				? { text: String(ing.quantity), numeric: parseQuantityToNumber(ing.quantity) }
				: undefined,
			measurement: ing.measurement || ''
		}))
	}

	let _id = $derived(prefilledData?.id ?? '')
	let _title = $derived(prefilledData?.title ?? '')
	let _description = $derived(prefilledData?.description ?? '')
	let servings = $derived(prefilledData?.servings ?? 1)
	let selectedTags = $derived<string[]>(prefilledData?.tags ?? [])
	let calories = $derived(prefilledData?.nutrition?.calories ?? '')
	let protein = $derived(prefilledData?.nutrition?.protein ?? '')
	let carbs = $derived(prefilledData?.nutrition?.carbs ?? '')
	let fat = $derived(prefilledData?.nutrition?.fat ?? '')

	let instructions: UIInstruction[] = $derived(
		prefilledData?.instructions
			? prefilledData.instructions.map((instruction) => ({
					...instruction,
					text: instruction.text ?? '',
					id: generateId(),
					ingredients:
						instruction.ingredients?.map((ingredient) => ({
							id: generateId(),
							name: ingredient.name,
							quantity: ingredient.quantity,
							measurement: ingredient.measurement,
							isPrepared: false
						})) ?? []
				}))
			: [{ id: generateId(), ingredients: [], text: '' }]
	)

	let isMobileView = $state(false)
	let searchValue = $state('')
	let isImportPopupOpen = $state(false)
	let isLoginPopupOpen = $state(false)
	let estimatingNutrition = $state(false)
	let displayNutrition = $state(false)
	let previewRecipeData = $state<any>()
	let confirmUpload = $state(false)
	let imageUrlState = $state<string | undefined>(prefilledData?.image ?? undefined)
	let showPreview = $state(false)
	let loginPopupMessage = $state<string | undefined>()

	const buildPreviewData = () => {
		const previewRecipe = {
			id: _id || generateId(),
			title: _title,
			description: _description,
			instructions: instructions,
			tags: selectedTags,
			imageUrl: imageUrlState,
			createdAt: new Date(),
			servings: servings,
			ingredients: toFlatPreviewIngredients(),
			nutrition: displayNutrition
				? {
						calories: parseFloat(String(calories)) || 0,
						protein: parseFloat(String(protein)) || 0,
						carbs: parseFloat(String(carbs)) || 0,
						fat: parseFloat(String(fat)) || 0
					}
				: undefined
		}

		return {
			recipe: previewRecipe,
			comments: { comments: [], total: 0 },
			collections: [],
			isLoggedIn: false
		}
	}

	function validateForm(): boolean {
		const result = v.safeParse(
			formValidationSchema,
			nullToUndefined({
				title: _title,
				description: _description,
				servings: servings,
				instructions: instructions,
				tags: selectedTags
			})
		)
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
					amount: ing.quantity ? parseQuantityToNumber(ing.quantity) : undefined,
					unit: ing.measurement,
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
		instructions = [...instructions, { id: generateId(), ingredients: [], text: text ?? '' }]
	}

	const removeInstruction = (id: string) => {
		instructions = instructions.filter((instruction) => instruction.id !== id)
	}

	function moveInstruction(instructionId: string, delta: -1 | 1) {
		const index = instructions.findIndex((i) => i.id === instructionId)
		if (index < 0) return
		const target = index + delta
		if (target < 0 || target >= instructions.length) return
		const arr = [...instructions]
		const temp = arr[index]
		arr[index] = arr[target]
		arr[target] = temp
		instructions = arr
	}

	const moveInstructionUp = (id: string) => {
		moveInstruction(id, -1)
	}

	const moveInstructionDown = (id: string) => {
		moveInstruction(id, 1)
	}

	const addIngredient = (instructionId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? {
						...instruction,
						ingredients: [...instruction.ingredients, { id: generateId(), name: '' }]
					}
				: instruction
		)
	}

	const addPreparedIngredient = (instructionId: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === instructionId
				? {
						...instruction,
						ingredients: [
							...instruction.ingredients,
							{ id: generateId(), isPrepared: true, name: '' }
						]
					}
				: instruction
		)
	}

	function updateInstruction(instructionId: string, apply: (ins: UIInstruction) => UIInstruction) {
		instructions = instructions.map((ins) => (ins.id === instructionId ? apply(ins) : ins))
	}

	function updateIngredient(
		instructionId: string,
		ingredientId: string,
		apply: (ing: UIIngredient) => UIIngredient
	) {
		updateInstruction(instructionId, (ins) => ({
			...ins,
			ingredients: ins.ingredients.map((ing) => (ing.id === ingredientId ? apply(ing) : ing))
		}))
	}

	const handleIngredientNameInput = (
		instructionId: string,
		ingredientId: string,
		value: string
	) => {
		updateIngredient(instructionId, ingredientId, (ing) => ({ ...ing, name: value }))
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

	function updateInstructionText(instructionId: string, value: string) {
		updateInstruction(instructionId, (ins) => ({ ...ins, text: value }))
	}

	function updateInstructionHint(instructionId: string, value: string) {
		updateInstruction(instructionId, (ins) => ({ ...ins, hint: value }))
	}

	function updateIngredientQuantity(instructionId: string, ingredientId: string, value: string) {
		updateIngredient(instructionId, ingredientId, (ing) => ({ ...ing, quantity: value }))
	}

	function updateIngredientUnit(instructionId: string, ingredientId: string, unit: string) {
		updateIngredient(instructionId, ingredientId, (ing) => ({ ...ing, measurement: unit }))
	}

	const updateInstructionMedia = (instructionId: string, file: File) => {
		const mediaType = file.type.startsWith('image/') ? 'image' : 'video'

		updateInstruction(instructionId, (ins) => ({ ...ins, mediaType, mediaUrl: 'uploaded' }))
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

		units.push(...(system === 'metric' ? UNITS.weight.metric : UNITS.weight.imperial))
		units.push(...(system === 'metric' ? UNITS.volume.metric : UNITS.volume.imperial))
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
		imageUrlState = recipe.image ?? undefined

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
			hint: instruction.hint ?? undefined,
			mediaUrl: instruction.mediaUrl ?? undefined,
			mediaType: instruction.mediaType ?? undefined,
			ingredients: (instruction.ingredients ?? []).map((ingredient) => ({
				id: generateId(),
				name: ingredient.name,
				quantity: ingredient.isPrepared ? undefined : ingredient.quantity,
				measurement: ingredient.isPrepared ? undefined : ingredient.measurement,
				isPrepared: ingredient.isPrepared === true
			}))
		}))
	}

	const formErrors = $derived((path: string) =>
		errors?.filter((error) => error.path === path).map((error) => error.message)
	)

	async function submitCreate() {
		submitting = true
		try {
			const result = await createRecipe(
				nullToUndefined({
					title: _title,
					description: _description,
					servings,
					instructions: instructions,
					tags: selectedTags,
					imageUrl: imageUrlState || undefined,
					nutrition: displayNutrition
						? {
								calories: parseFloat(String(calories)) || 0,
								protein: parseFloat(String(protein)) || 0,
								carbs: parseFloat(String(carbs)) || 0,
								fat: parseFloat(String(fat)) || 0
							}
						: undefined
				})
			)

			editMode?.onSave()
			if (draftMode) {
				await deleteDraft({ id: _id })
				draftMode.onPublish()
			}
			onCreated?.(result.recipeId)
		} catch (e) {
			console.error(e)
			errors = [...(errors ?? []), { path: 'api', message: e instanceof Error ? e.message : String(e) }]
		} finally {
			submitting = false
		}
	}

	const saveEditRecipe = async () => {
		submitting = true
		try {
			await updateRecipe(
				nullToUndefined({
					id: _id,
					title: _title,
					description: _description,
					servings,
					instructions: instructions,
					tags: selectedTags,
					imageUrl: imageUrlState || undefined,
					nutrition: displayNutrition
						? {
								calories: parseFloat(String(calories)) || 0,
								protein: parseFloat(String(protein)) || 0,
								carbs: parseFloat(String(carbs)) || 0,
								fat: parseFloat(String(fat)) || 0
							}
						: undefined
				})
			)
			editMode?.onSave()
		} catch (e) {
			console.error(e)
			errors = [...(errors ?? []), { path: 'api', message: e instanceof Error ? e.message : String(e) }]
		} finally {
			submitting = false
		}
	}

	async function submitSaveDraft() {
		const loggedIn = await isLoggedIn
		if (!loggedIn) {
			isLoginPopupOpen = true
			return
		}
		submitting = true
		try {
			if (draftMode) {
				await updateDraft({
					id: _id,
					title: _title,
					description: _description,
					servings: servings,
					instructions: instructions,
					imageUrl: imageUrlState || undefined,
					tags: selectedTags,
					createdAt: new Date()
				})
				draftMode.onSaveDraft()
			} else {
				const { redirectTo } = await saveDraft({
					title: _title,
					description: _description,
					servings: servings,
					instructions: instructions,
					imageUrl: imageUrlState || undefined,
					tags: selectedTags
				})
				await goto(redirectTo)
			}

			editMode?.onSave()
		} catch (e) {
			console.error(e)
			errors = [...(errors ?? []), { path: 'api', message: e instanceof Error ? e.message : String(e) }]
		} finally {
			submitting = false
		}
	}

	function persistFormToSession() {
		try {
			const data: ImportedRecipeData = {
				title: _title,
				description: _description,
				servings: servings,
				tags: selectedTags,
				image: imageUrlState ?? (null as any),
				nutritionMode: displayNutrition ? 'manual' : 'none',
				nutrition: displayNutrition
					? {
							calories: parseFloat(String(calories)) || 0,
							protein: parseFloat(String(protein)) || 0,
							carbs: parseFloat(String(carbs)) || 0,
							fat: parseFloat(String(fat)) || 0
						}
					: undefined,
				instructions: instructions.map((instruction) => ({
					text: instruction.text,
					mediaUrl: instruction.mediaUrl ?? (null as any),
					mediaType: instruction.mediaType ?? (null as any),
					ingredients: instruction.ingredients.map((ingredient) => ({
						name: ingredient.name,
						quantity: ingredient.isPrepared ? '' : (ingredient.quantity ?? ''),
						measurement: ingredient.isPrepared ? '' : (ingredient.measurement ?? ''),
						isPrepared: ingredient.isPrepared === true
					}))
				}))
			}
			sessionStorage.setItem('forkly_prefilled_recipe', JSON.stringify(data))
		} catch {}
	}

	$inspect(errors)
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
		initialMedia={imageUrlState ? { url: imageUrlState, type: 'image' } : undefined}
		onUploaded={(url) => {
			imageUrlState = url
		}}
		onCleared={() => {
			imageUrlState = undefined
		}}
	/>
{/snippet}

{#snippet tags()}
	<div class="tags">
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
							<FormError errors={formErrors(`instructions.${instructionIndex}.ingredients.${ingredientIndex}.name`)}>
								{#snippet formInput(closePopover)}
									<Input>
										<input
											type="text"
											placeholder="Prepared ingredient name"
											name="instructions-{instructionId}-ingredient-{id}-name"
											value={nameValue}
											oninput={(e) => {
												handleIngredientNameInput(
													instructionId,
													id,
													(e.target as HTMLInputElement).value
												)
												closePopover()
											}}
										/>
									</Input>
								{/snippet}
							</FormError>
							<input
								type="hidden"
								name="instructions-{instructionId}-ingredient-{id}-isPrepared"
								value="true"
							/>
						</div>
					{:else}
						<FormError errors={formErrors(`instructions.${instructionIndex}.ingredients.${ingredientIndex}.name`)}>
							{#snippet formInput(closePopover)}
								<Input>
									<input
										type="text"
										placeholder="Enter ingredient"
										name="instructions-{instructionId}-ingredient-{id}-name"
										value={nameValue}
										oninput={(e) => {
											handleIngredientNameInput(
												instructionId,
												id,
												(e.target as HTMLInputElement).value
											)
											closePopover()
										}}
									/>
								</Input>
							{/snippet}
						</FormError>
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
										oninput={(e) => {
											updateIngredientQuantity(
												instructionId,
												id,
												(e.target as HTMLInputElement).value
											)
											closePopover()
										}}
									/>
								</Input>
							{/snippet}
						</FormError>
					</div>

					<div class="unit-input">
						<SuggestionSearch
							placeholder="Unit"
							formName="instructions-{instructionId}-ingredient-{id}-measurement"
							onSearch={searchUnits}
							clearInput={false}
							showSearchIcon={false}
							minSearchLength={2}
							useId={true}
							searchValue={unitValue}
							onSelect={(opt) => updateIngredientUnit(instructionId, id, opt.id)}
							onInput={(val) => updateIngredientUnit(instructionId, id, val)}
						/>
					</div>
				</div>
			{/if}
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

{#snippet instructionInput(id: string, index: number, value?: string)}
	<FormError errors={formErrors(`instructions.${index}.text`)}>
		{#snippet formInput(closePopover)}
			<Input>
				<textarea
					name={`instructions-${id}-text`}
					placeholder="Enter instruction step"
					rows="5"
					{value}
					oninput={(e) => {
						updateInstructionText(id, (e.target as HTMLTextAreaElement).value)
						closePopover()
					}}
				></textarea>
			</Input>
		{/snippet}
	</FormError>
{/snippet}

{#snippet instructionHint(id: string, value?: string)}
	{#if value !== undefined}
		<div class="instruction-hint-editor">
			<Input>
				<textarea
					name={`instructions-${id}-hint`}
					placeholder="Add a hint for this step"
					rows="3"
					{value}
					oninput={(e) => {
						updateInstructionHint(id, (e.target as HTMLTextAreaElement).value)
					}}
				></textarea>
			</Input>
			<button
				type="button"
				class="remove-btn"
				onclick={() => updateInstructionHint(id, undefined as unknown as string)}
				aria-label="Remove hint"
			>
				<Trash size={16} />
			</button>
		</div>
	{:else}
		<Button color="neutral" size="sm" type="button" onclick={() => updateInstructionHint(id, '')}>
			Add hint
		</Button>
	{/if}
{/snippet}

{#snippet instructionMedia(id: string, initialMedia?: { url: string; type: 'image' | 'video' })}
	<MediaUpload
		name={`instructions-${id}-media`}
		onFile={(file) => updateInstructionMedia(id, file)}
		previewAlt="Instruction media"
		initialMedia={initialMedia?.url === 'uploaded' ? undefined : initialMedia}
		onUploaded={(url, t) => {
			instructions = instructions.map((ins) =>
				ins.id === id ? { ...ins, mediaUrl: url, mediaType: t } : ins
			)
		}}
		onCleared={() => {
			instructions = instructions.map((ins) =>
				ins.id === id ? { ...ins, mediaUrl: undefined, mediaType: undefined } : ins
			)
		}}
	/>
{/snippet}

{#snippet saveDraftButton(fullWidth?: boolean)}
	{#if !editMode}
		<Button
			disabled={!isLoggedIn}
			{fullWidth}
			loading={submitting}
			type="button"
			color="neutral"
			onclick={submitSaveDraft}
		>
			Save Draft
		</Button>
	{/if}
{/snippet}

{#snippet previewButton(fullWidth?: boolean)}
	<Button
		{fullWidth}
		loading={submitting}
		type="button"
		color="secondary"
		onclick={async () => {
			if (!validateForm()) return
			previewRecipeData = buildPreviewData()
			showPreview = true
			onOpenPreview?.()
		}}
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

{#snippet preview()}
	<div class="preview-container">
		<RecipePage
			params={{ id: _id }}
			data={previewRecipeData
				? { recipeData: previewRecipeData, user: undefined }
				: { recipeData: null, user: undefined }}
			preview
		/>

		<div class="preview-actions">
			<Button color="neutral" onclick={() => (showPreview = false)}>Go back</Button>
			<Button
				color="primary"
				onclick={async () => {
					const loggedIn = await isLoggedIn
					if (!loggedIn) {
						persistFormToSession()
						showPreview = false
						loginPopupMessage = 'Please log in to upload the recipe.'
						isLoginPopupOpen = true
						return
					}
					showPreview = false
					if (!editMode) {
						await new Promise((resolve) => setTimeout(resolve, 300))
						await submitCreate()
					} else {
						await saveEditRecipe()
					}
				}}
			>
				{editMode ? 'Save' : 'Upload'}
			</Button>
		</div>
	</div>
{/snippet}

<div class="new-recipe">
	{#if errors && (errors.find((error) => error.path === 'ingredients') || errors.find((error) => error.path === 'api'))}
		<div class="error-container">
			{#each errors as error}
				<p class="error">{error.message}</p>
			{/each}
		</div>
	{/if}

	{#if editMode && showPreview}
		{@render preview()}
	{:else if isMobileView}
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
				{instructionHint}
				{instructionMedia}
				{ingredientRow}
				{addInstructionButton}
				{addIngredientButton}
				{addPreparedIngredientButton}
				{removeInstructionButton}
				{moveInstructionUpButton}
				{moveInstructionDownButton}
				submitButton={previewButton}
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
				{instructionHint}
				{instructionMedia}
				{ingredientRow}
				{addInstructionButton}
				{addIngredientButton}
				{addPreparedIngredientButton}
				{removeInstructionButton}
				{moveInstructionUpButton}
				{moveInstructionDownButton}
				previewButton={editMode ? undefined : previewButton}
				{saveDraftButton}
				{importButton}
				headerText={!editMode && !draftMode ? headerText : undefined}
			/>

			{#if editMode}
				<div class="preview-actions">
					{@render previewButton()}
				</div>
			{/if}
		</div>
	{/if}

	<LoginPopup
		bind:isOpen={isLoginPopupOpen}
		onClose={() => {
			isLoginPopupOpen = false
			loginPopupMessage = undefined
		}}
		returnTo="/new"
		message={loginPopupMessage}
	/>
</div>

{#if !editMode}
	<Popup bind:isOpen={showPreview} width="90vw">
		{@render preview()}
	</Popup>
{/if}

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
		gap: var(--spacing-sm);

		@include mobile {
			align-items: stretch;

			.remove-btn {
				height: auto;
				align-self: stretch;
			}
		}
	}

	.ingredient-input {
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
		min-height: 36px;
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
		background: var(--color-error-light);

		&:hover {
			background-color: var(--color-error);
		}
	}

	.instruction-hint-editor {
		display: flex;
		align-items: stretch;
		gap: var(--spacing-sm);

		.remove-btn {
			height: auto;
			align-self: stretch;
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

	.preview-container {
		min-height: 100%;
		display: flex;
		flex-direction: column;
	}

	.tags {
		@include mobile {
			width: 100%;
		}
	}

	.preview-actions {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		z-index: 1;
		background: var(--color-background);
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-md) 0;
		display: flex;
		justify-content: center;
		gap: var(--spacing-lg);
	}
</style>
