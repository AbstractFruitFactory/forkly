<script lang="ts">
	import Button from '$lib/components/button/Button.svelte'
	import Drawer from '$lib/components/drawer/Drawer.svelte'
	import Plus from 'lucide-svelte/icons/plus'
	import Input from '$lib/components/input/Input.svelte'
	import Trash from 'lucide-svelte/icons/trash-2'
	import Edit from 'lucide-svelte/icons/edit-2'
	import type { Snippet } from 'svelte'
	import { generateId, type RecipeData } from './NewRecipe.svelte'

	let {
		prefilledInstructions,
		submitButton,
		title,
		description,
		recipeImage,
		tags,
		nutrition,
		servingsAdjuster,
		unitToggle,
		instructionInput,
		instructionMedia,
		ingredientName,
		ingredientAmount,
		ingredientUnit
	}: {
		prefilledInstructions?: RecipeData['instructions']
		submitButton: Snippet
		servingsAdjuster: Snippet
		title: Snippet
		description: Snippet
		recipeImage: Snippet
		tags: Snippet
		nutrition: Snippet
		unitToggle: Snippet
		instructionInput: Snippet<[id?: string, onInput?: (value: string) => void]>
		instructionMedia: Snippet<[id?: string, onFile?: (file: File) => void]>
		ingredientName: Snippet<
			[id: string, instructionId: string, onInput?: (value: string) => void, value?: string]
		>
		ingredientAmount: Snippet<
			[id: string, instructionId: string, onInput?: (value: string) => void, value?: string]
		>
		ingredientUnit: Snippet<
			[id: string, instructionId: string, onInput?: (value: string) => void, value?: string]
		>
	} = $props()

	let isInstructionDrawerOpen = $state(false)
	let isIngredientDrawerOpen = $state(false)
	let editingInstructionId = $state<string>()
	let editingIngredientId = $state<string>()
	let currentInstructionId = $state<string>()

	let newInstructionText = $state('')
	let newInstructionMedia: File | string | undefined

	let drawerIngredientAmount = $state('')
	let drawerIngredientUnit = $state('')
	let drawerIngredientName = $state('')

	let instructions: {
		id: string
		text: string
		media: File | string | undefined
		ingredients: { id: string; amount: string; unit: string; name: string }[]
	}[] = $state([])

	$effect(() => {
		if (prefilledInstructions && prefilledInstructions.length > 0) {
			instructions = prefilledInstructions.map((instruction) => ({
				id: generateId(),
				text: instruction.text || '',
				media: instruction.mediaUrl ? instruction.mediaUrl : undefined,
				ingredients: (instruction.ingredients || [])
					.filter((ingredient) => ingredient != null)
					.map((ingredient) => ({
						id: generateId(),
						amount: ingredient.quantity?.toString() || '',
						unit: ingredient.measurement || '',
						name: ingredient.name || ''
					}))
			}))
		}
	})

	const resetInstructionDrawerFields = () => {
		newInstructionText = ''
		newInstructionMedia = undefined
		editingInstructionId = undefined
	}

	const resetDrawerFields = () => {
		drawerIngredientAmount = ''
		drawerIngredientUnit = ''
		drawerIngredientName = ''
		editingIngredientId = undefined
		currentInstructionId = undefined
	}

	const openInstructionDrawerForEdit = (instruction: {
		id: string
		text: string
		media: File | string | undefined
	}) => {
		editingInstructionId = instruction.id
		newInstructionText = instruction.text
		newInstructionMedia = instruction.media
		isInstructionDrawerOpen = true
	}

	const openInstructionDrawer = () => {
		isInstructionDrawerOpen = true
		resetInstructionDrawerFields()
	}

	const openIngredientDrawer = (instructionId: string, ingredientId?: string) => {
		currentInstructionId = instructionId
		if (ingredientId) {
			editingIngredientId = ingredientId
			const instruction = instructions.find((inst) => inst.id === instructionId)
			const ingredient = instruction?.ingredients.find((ing) => ing.id === ingredientId)
			if (ingredient) {
				drawerIngredientAmount = ingredient.amount
				drawerIngredientUnit = ingredient.unit
				drawerIngredientName = ingredient.name
			}
		} else {
			editingIngredientId = undefined
			drawerIngredientAmount = ''
			drawerIngredientUnit = ''
			drawerIngredientName = ''
		}
		isIngredientDrawerOpen = true
	}

	const saveInstruction = () => {
		if (editingInstructionId) {
			instructions = instructions.map((instruction) =>
				instruction.id === editingInstructionId
					? { ...instruction, text: newInstructionText, media: newInstructionMedia || undefined }
					: instruction
			)
		} else {
			instructions = [
				...instructions,
				{
					id: generateId(),
					text: newInstructionText,
					media: newInstructionMedia || undefined,
					ingredients: []
				}
			]
			const lastInstruction = instructions[instructions.length - 1]
			if (lastInstruction) {
				instructions = instructions.map((instruction) =>
					instruction.id === lastInstruction.id
						? { ...instruction, text: newInstructionText, media: newInstructionMedia || undefined }
						: instruction
				)
			}
		}
		isInstructionDrawerOpen = false
		resetInstructionDrawerFields()
	}

	const handleAddIngredient = () => {
		if (!currentInstructionId) return

		const trimmedName = drawerIngredientName.trim()
		const trimmedAmount = drawerIngredientAmount.trim()
		const trimmedUnit = drawerIngredientUnit.trim()

		if (editingIngredientId) {
			instructions = instructions.map((instruction) =>
				instruction.id === currentInstructionId
					? {
							...instruction,
							ingredients: instruction.ingredients.map((ingredient) =>
								ingredient.id === editingIngredientId
									? {
											...ingredient,
											name: trimmedName,
											amount: trimmedAmount,
											unit: trimmedUnit
										}
									: ingredient
							)
						}
					: instruction
			)
		} else {
			instructions = instructions.map((instruction) =>
				instruction.id === currentInstructionId
					? {
							...instruction,
							ingredients: [
								...instruction.ingredients,
								{ id: generateId(), name: trimmedName, amount: trimmedAmount, unit: trimmedUnit }
							]
						}
					: instruction
			)
		}
		isIngredientDrawerOpen = false
		resetDrawerFields()
	}

	const removeInstruction = (id: string) => {
		instructions = instructions.filter((instruction) => instruction.id !== id)
	}

	const removeIngredient = (id: string) => {
		instructions = instructions.map((instruction) =>
			instruction.id === currentInstructionId
				? {
						...instruction,
						ingredients: instruction.ingredients.filter((ingredient) => ingredient.id !== id)
					}
				: instruction
		)
	}
</script>

<div class="form-section">
	{@render recipeImage()}

	<div class="form-group">
		<div>
			{@render title()}
		</div>
		<div style:height="var(--spacing-md)"></div>

		{@render description()}
	</div>
</div>

<div class="form-section">
	<div class="servings-unit-row">
		<div class="servings-adjuster">
			{@render servingsAdjuster()}
		</div>
		<div class="unit-toggle-container">
			{@render unitToggle()}
		</div>
	</div>
</div>

<div class="form-section">
	<h4>Steps</h4>
	<div class="form-group">
		{#each [...instructions, { id: '', isAddButton: true }] as item, i (item.id)}
			<div class={'isAddButton' in item ? 'add-instruction-button' : 'instruction-card'}>
				{#if 'isAddButton' in item}
					<Button fullWidth color="neutral" onclick={openInstructionDrawer} size="sm">
						<Plus size={16} color="var(--color-text-on-surface)" />
						Add step
					</Button>
				{:else}
					<div class="instruction-card-header">
						<div class="instruction-step">Step {i + 1}</div>
						<div class="instruction-actions">
							<button
								class="action-btn"
								type="button"
								onclick={() => openInstructionDrawerForEdit(item)}
							>
								<Edit size={16} color="var(--color-text-on-surface)" />
							</button>
							{#if instructions.length > 1}
								<button class="remove-btn" type="button" onclick={() => removeInstruction(item.id)}>
									<Trash size={16} color="var(--color-text-on-surface)" />
								</button>
							{/if}
						</div>
					</div>
					<div class="instruction-card-content">
						<input type="hidden" name="instructions-{item.id}-text" value={item.text} />

						<Input>
							<textarea disabled class="selected-instruction-text" rows={3} value={item.text}
							></textarea>
						</Input>

						{#if item.media}
							<div class="instruction-media-display">
								<!-- svelte-ignore a11y_missing_attribute -->
								<img
									class="instruction-card-image"
									src={typeof item.media === 'string'
										? item.media
										: URL.createObjectURL(item.media)}
								/>
								<input type="hidden" name="instructions-{item.id}-media" value={item.media} />
							</div>
						{/if}

						<div class="instruction-ingredients">
							<h4>Ingredients for this step:</h4>
							{#each item.ingredients as ingredient, j (ingredient.id)}
								<div class="ingredient-display">
									<Input>
										<div class="ingredient-display-row">
											<input
												type="text"
												disabled
												class="ingredient-amount"
												value={ingredient.amount}
											/>
											<input
												type="hidden"
												name="instructions-{item.id}-ingredient-{ingredient.id}-amount"
												value={ingredient.amount}
											/>
											<input type="text" disabled class="ingredient-unit" value={ingredient.unit} />
											<input
												type="hidden"
												name="instructions-{item.id}-ingredient-{ingredient.id}-unit"
												value={ingredient.unit}
											/>
											<input type="text" disabled class="ingredient-name" value={ingredient.name} />
											<input
												type="hidden"
												name="instructions-{item.id}-ingredient-{ingredient.id}-name"
												value={ingredient.name}
											/>
										</div>
									</Input>
									<button
										class="action-btn"
										type="button"
										onclick={() => removeIngredient(ingredient.id)}
									>
										<Trash size={16} color="var(--color-text-on-surface)" />
									</button>
								</div>
							{/each}
							<Button
								fullWidth
								color="neutral"
								onclick={() => openIngredientDrawer(item.id)}
								size="sm"
							>
								<Plus size={16} color="var(--color-text-on-surface)" />
								Add Ingredient
							</Button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<Drawer
	bind:isOpen={isIngredientDrawerOpen}
	title={editingIngredientId ? 'Edit ingredient' : 'New ingredient'}
>
	<div class="drawer-ingredient-form">
		<div class="ingredient-input-row">
			<div class="ingredient-name-input">
				{@render ingredientName(
					'drawer-ingredient',
					currentInstructionId!,
					(value) => (drawerIngredientName = value),
					drawerIngredientName
				)}
			</div>
		</div>
		<div class="quantity-unit-row">
			<div class="quantity-input">
				{@render ingredientAmount(
					'drawer-ingredient',
					currentInstructionId!,
					(value) => (drawerIngredientAmount = value),
					drawerIngredientAmount
				)}
			</div>
			<div class="unit-input">
				{@render ingredientUnit(
					'drawer-ingredient',
					currentInstructionId!,
					(value) => (drawerIngredientUnit = value),
					drawerIngredientUnit
				)}
			</div>
		</div>
		<div class="drawer-actions">
			<Button
				onclick={() => {
					isIngredientDrawerOpen = false
					resetDrawerFields()
				}}
				color="neutral">Cancel</Button
			>
			<Button onclick={handleAddIngredient} color="primary"
				>{editingIngredientId ? 'Update Ingredient' : 'Add Ingredient'}</Button
			>
		</div>
	</div>
</Drawer>

<Drawer
	bind:isOpen={isInstructionDrawerOpen}
	title={editingInstructionId ? 'Edit instruction' : `Step ${instructions.length + 1}`}
>
	<div class="drawer-instruction-form">
		{@render instructionInput(undefined, (value) => (newInstructionText = value))}

		{@render instructionMedia(undefined, (file) => (newInstructionMedia = file))}
		<div class="drawer-actions">
			<Button
				color="neutral"
				onclick={() => {
					isInstructionDrawerOpen = false
					resetInstructionDrawerFields()
				}}>Cancel</Button
			>
			<Button onclick={saveInstruction} color="primary"
				>{editingInstructionId ? 'Update Instruction' : 'Add Instruction'}</Button
			>
		</div>
	</div>
</Drawer>

<div class="form-section">
	<h4>Tags</h4>
	<div class="form-group">
		{@render tags()}
	</div>
</div>

<div class="form-section">
	<h4>Nutrition</h4>
	<div class="form-group">
		{@render nutrition()}
	</div>
</div>

<div class="submit-section">
	{@render submitButton()}
</div>

<style lang="scss">
	h3 {
		margin: 0;
	}

	h4 {
		margin-bottom: var(--spacing-sm);
	}

	.form-section {
		margin-bottom: var(--spacing-xl);
	}

	.form-group {
		margin-top: var(--spacing-lg);
	}

	.ingredients-header {
		margin-bottom: var(--spacing-md);
	}

	.servings-unit-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
	}

	.unit-toggle-container {
		flex-shrink: 0;
	}

	.add-ingredient-button {
		margin-top: var(--spacing-md);
	}

	.ingredient-group {
		margin-bottom: var(--spacing-xs);
	}

	.drawer-ingredient-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.drawer-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		margin-top: var(--spacing-lg);
	}

	.ingredient-row {
		display: flex;
		align-items: center;
		border-radius: var(--border-radius-lg);
		margin-bottom: var(--spacing-xs);
		gap: var(--spacing-md);
	}

	.ingredient-actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.ingredient-display {
		display: flex;
		gap: var(--spacing-md);
		flex: 1;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.ingredient-display-row {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
	}

	.ingredient-amount {
		font-weight: 600;
		color: var(--color-text-on-surface);
	}

	.ingredient-name {
		color: var(--color-text-on-surface);
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--color-text-on-surface);
		font-size: 1.2em;
		cursor: pointer;
		padding: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		transition: background 0.2s;
	}

	.action-btn:hover {
		background: var(--color-background-dark);
	}

	.instruction-card {
		background: var(--color-background-dark);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	}

	.instruction-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xs);
	}

	.instruction-actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.instruction-step {
		font-weight: 600;
		color: var(--color-text-on-surface);
	}

	.instruction-card-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);

		:global(.input-container) {
			box-shadow: none;
			padding: 0;
			background: var(--color-background-dark);
		}
	}

	.instruction-ingredients {
		margin-top: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-neutral-darker);

		h4 {
			margin: 0 0 var(--spacing-md) 0;
			font-size: var(--font-size-md);
			font-weight: var(--font-weight-semibold);
			color: var(--color-text-on-surface);
		}
	}

	.selected-instruction-text {
		padding: 0 !important;
	}

	.instruction-media-display {
		position: relative;
	}

	.instruction-card-image {
		width: 100%;
		display: block;
		border-radius: var(--border-radius-lg);
		object-fit: cover;
		margin-top: var(--spacing-xs);
	}

	.drawer-instruction-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.instruction-textarea {
		border: 2px solid var(--color-primary);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		font-size: 1rem;
		resize: vertical;
		background: var(--color-surface);
		color: var(--color-text-on-surface);
	}

	.ingredient-input-row {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.ingredient-name-input {
		flex: 1;
	}

	.quantity-unit-row {
		display: flex;
		gap: var(--spacing-md);
		align-items: flex-start;
	}

	.quantity-input {
		flex: 1;
	}

	.unit-input {
		flex: 1;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	.tags {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.selected-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.nutrition-mode {
		margin-bottom: var(--spacing-md);
	}

	.nutrition-inputs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	.submit-section {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);
	}

	.add-instruction-button {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-lg);

		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			border-color: var(--color-primary);
			background: var(--color-primary-light);
		}
	}
</style>
