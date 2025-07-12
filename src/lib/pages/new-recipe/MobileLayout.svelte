<script lang="ts">
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import Drawer from '$lib/components/drawer/Drawer.svelte'
	import Plus from 'lucide-svelte/icons/plus'
	import Input from '$lib/components/input/Input.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import Trash from 'lucide-svelte/icons/trash-2'
	import Edit from 'lucide-svelte/icons/edit-2'
	import X from 'lucide-svelte/icons/x'
	import type { IngredientRow, InstructionRow } from './NewRecipe.svelte'

	let {
		servings,
		selectedTags,
		unitSystem,
		handleServingsChange,
		searchTags,
		searchIngredients,
		handleTagSelect,
		removeTag,
		submitting,
		ingredients,
		instructions,
		addIngredient,
		removeIngredient,
		updateIngredient,
		addInstruction,
		removeInstruction,
		updateInstruction
	}: {
		servings: number
		selectedTags: string[]
		unitSystem: UnitSystem
		handleServingsChange: (newServings: number) => void
		searchTags: (query: string) => Promise<{ id: string; name: string }[]>
		searchIngredients: (query: string) => Promise<{ id: string; name: string }[]>
		handleTagSelect: (tag: string, selected: boolean) => void
		removeTag: (tag: string) => void
		submitting: boolean
		ingredients: IngredientRow[]
		instructions: InstructionRow[]
		addIngredient: (ingredient: Omit<IngredientRow, 'id'>) => void
		removeIngredient: (id: string) => void
		updateIngredient: (
			id: string,
			ingredient: { name: string; amount: string; unit: string }
		) => void
		addInstruction: (instruction: Omit<InstructionRow, 'id'>) => void
		removeInstruction: (id: string) => void
		updateInstruction: (id: string, instruction: { text: string; media?: File }) => void
	} = $props()

	let isDrawerOpen = $state(false)
	let editingIngredientId = $state<string | null>(null)
	let newIngredientName = $state('')
	let newIngredientId = $state('')
	let newIngredientAmount = $state('1')
	let newIngredientUnit = $state('')
	let savedIngredients = $state<{ [key: string]: boolean }>({})

	let editingInstructionId = $state<string | null>(null)
	let savedInstructions = $state<{ [key: string]: boolean }>({})

	const handleDrawerIngredientSelect = (ingredient: { id: string; name: string }) => {
		newIngredientName = ingredient.name
		newIngredientId = ingredient.id
	}
	const handleDrawerAmountInput = (e: Event) => {
		const input = e.target as HTMLInputElement
		const numericValue = input.value.replace(/[^0-9.]/g, '')
		if (numericValue !== input.value) {
			input.value = numericValue
		}
		newIngredientAmount = numericValue
	}
	const handleDrawerUnitInput = (e: Event) => {
		newIngredientUnit = (e.target as HTMLInputElement).value
	}
	const resetDrawerFields = () => {
		newIngredientName = ''
		newIngredientId = ''
		newIngredientAmount = '1'
		newIngredientUnit = ''
		editingIngredientId = null
	}

	const removeIngredientLocal = (id: string) => {
		removeIngredient(id)
		savedIngredients[id] = false
	}
	const openDrawerForEdit = (ingredient: IngredientRow) => {
		editingIngredientId = ingredient.id
		newIngredientName = ingredient.name
		newIngredientId = ingredient.id
		newIngredientAmount = ingredient.amount
		newIngredientUnit = ingredient.unit
		isDrawerOpen = true
	}
	const handleAddIngredient = () => {
		if (editingIngredientId) {
			updateIngredient(editingIngredientId, {
				name: newIngredientName,
				amount: newIngredientAmount,
				unit: newIngredientUnit
			})
		} else {
			// Find the first unsaved ingredient or create a new one
			const unsavedIngredient = ingredients.find((ing) => !savedIngredients[ing.id])
			if (unsavedIngredient) {
				// Update the existing unsaved ingredient
				updateIngredient(unsavedIngredient.id, {
					name: newIngredientName,
					amount: newIngredientAmount,
					unit: newIngredientUnit
				})
				savedIngredients[unsavedIngredient.id] = true
			} else {
				// Create a new ingredient with the data
				const newIngredient = {
					name: newIngredientName,
					amount: newIngredientAmount,
					unit: newIngredientUnit
				}
				addIngredient(newIngredient)
				// Mark the last ingredient as saved (it should be the newly added one)
				setTimeout(() => {
					const lastIngredient = ingredients[ingredients.length - 1]
					if (lastIngredient) {
						savedIngredients[lastIngredient.id] = true
					}
				}, 0)
			}
		}
		isDrawerOpen = false
		resetDrawerFields()
	}

	let isInstructionDrawerOpen = $state(false)
	let newInstructionText = $state('')
	let newInstructionMedia: File | null = null

	type ItemWithAddButton = IngredientRow | { id: string; isAddButton: true }
	let ingredientItems = $derived<ItemWithAddButton[]>([
		...ingredients.filter((ingredient) => savedIngredients[ingredient.id]),
		{ id: 'add-button', isAddButton: true }
	])

	type InstructionWithAddButton = InstructionRow | { id: string; isAddButton: true }
	let instructionItems = $derived<InstructionWithAddButton[]>([
		...instructions.filter((instruction) => savedInstructions[instruction.id]),
		{ id: 'add-instruction-button', isAddButton: true }
	])

	const resetInstructionDrawerFields = () => {
		newInstructionText = ''
		newInstructionMedia = null
		editingInstructionId = null
	}

	const openInstructionDrawerForEdit = (instruction: InstructionRow) => {
		editingInstructionId = instruction.id
		newInstructionText = instruction.text
		newInstructionMedia = instruction.media || null
		isInstructionDrawerOpen = true
	}

	const openInstructionDrawer = () => {
		isInstructionDrawerOpen = true
		resetInstructionDrawerFields()
	}

	const handleAddInstruction = () => {
		if (editingInstructionId) {
			updateInstruction(editingInstructionId, {
				text: newInstructionText,
				media: newInstructionMedia || undefined
			})
		} else {
			const unsavedInstruction = instructions.find((inst) => !savedInstructions[inst.id])
			if (unsavedInstruction) {
				updateInstruction(unsavedInstruction.id, {
					text: newInstructionText,
					media: newInstructionMedia || undefined
				})
				savedInstructions[unsavedInstruction.id] = true
			} else {
				const newInstruction = {
					text: newInstructionText,
					media: newInstructionMedia || undefined
				}
				addInstruction(newInstruction)
				setTimeout(() => {
					const lastInstruction = instructions[instructions.length - 1]
					if (lastInstruction) {
						savedInstructions[lastInstruction.id] = true
					}
				}, 0)
			}
		}
		isInstructionDrawerOpen = false
		resetInstructionDrawerFields()
	}

	const removeInstructionLocal = (id: string) => {
		removeInstruction(id)
		savedInstructions[id] = false
	}
</script>

<div class="form-section">
	<MediaUpload name="image" type="image" previewAlt="Recipe preview" />

	<div class="form-group">
		<Input>
			<input name="title" type="text" required placeholder="Enter recipe title" />
		</Input>
		<div style:height="var(--spacing-md)"></div>

		<Input>
			<textarea name="description" placeholder="Describe your recipe (optional)" rows="3"
			></textarea>
		</Input>
	</div>
</div>

<div class="form-section">
	<div class="ingredients-header">
		<h3>Ingredients</h3>
	</div>
	<div class="servings-adjuster">
		<ServingsAdjuster {servings} onServingsChange={handleServingsChange} />
	</div>

	<div class="form-group">
		<div id="ingredients">
			{#each ingredientItems as item (item.id)}
				<div
					class={'isAddButton' in item ? 'add-ingredient-button' : 'ingredient-row'}
					style:height={'isAddButton' in item ? 'auto' : '40px'}
					transition:scale={{ duration: 200 }}
					animate:flip={{ duration: 200 }}
				>
					{#if 'isAddButton' in item}
						<Button
							fullWidth
							color="neutral"
							onclick={() => {
								isDrawerOpen = true
								resetDrawerFields()
							}}
							size="sm"
						>
							<Plus size={16} color="var(--color-text-on-surface)" />
							Add new ingredient
						</Button>
					{:else}
						<div class="ingredient-display">
							<input type="hidden" name="ingredient-{item.id}-name" value={item.name} />
							<input type="hidden" name="ingredient-{item.id}-quantity" value={item.amount} />
							<input type="hidden" name="ingredient-{item.id}-measurement" value={item.unit} />
							<Input>
								<div class="ingredient-display-row">
									<input
										type="text"
										disabled
										class="ingredient-amount"
										value={item.amount}
										oninput={handleDrawerAmountInput}
									/>
									<input type="text" disabled class="ingredient-unit" value={item.unit} />
									<input type="text" disabled class="ingredient-name" value={item.name} />
								</div>
							</Input>
						</div>
						<div class="ingredient-actions">
							<button class="action-btn" type="button" onclick={() => openDrawerForEdit(item)}>
								<Edit size={16} color="var(--color-text-on-surface)" />
							</button>
							{#if ingredients.length > 1}
								<button
									class="action-btn"
									type="button"
									onclick={() => removeIngredientLocal(item.id)}
								>
									<Trash size={16} color="var(--color-text-on-surface)" />
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<Drawer
	bind:isOpen={isDrawerOpen}
	title={editingIngredientId ? 'Edit ingredient' : 'New ingredient'}
>
	<div class="drawer-ingredient-form">
		<div class="search-row">
			<SuggestionSearch
				placeholder="add ingredient"
				onSearch={searchIngredients}
				onSelect={handleDrawerIngredientSelect}
				clearInput={false}
				bind:searchValue={newIngredientName}
			/>
		</div>
		<div class="row">
			<Input>
				<input
					type="text"
					inputmode="decimal"
					placeholder="1"
					bind:value={newIngredientAmount}
					oninput={handleDrawerAmountInput}
				/>
			</Input>
			<Input>
				<input placeholder="--" bind:value={newIngredientUnit} oninput={handleDrawerUnitInput} />
			</Input>
		</div>
		<div class="drawer-actions">
			<Button
				onclick={() => {
					isDrawerOpen = false
					resetDrawerFields()
				}}
				color="neutral"
				>Cancel</Button
			>
			<Button onclick={handleAddIngredient} color="primary"
				>{editingIngredientId ? 'Update Ingredient' : 'Add Ingredient'}</Button
			>
		</div>
	</div>
</Drawer>

<div class="form-section">
	<h3>Instructions</h3>
	<div class="form-group">
		{#each instructionItems as item, i (item.id)}
			<div
				class={'isAddButton' in item ? 'add-instruction-button' : 'instruction-card'}
				in:scale
				animate:flip={{ duration: 200 }}
			>
				{#if 'isAddButton' in item}
					<Button fullWidth color="neutral" onclick={openInstructionDrawer} size="sm">
						<Plus size={16} color="var(--color-text-on-surface)" />
						Add new instruction
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
								<button
									class="remove-btn"
									type="button"
									onclick={() => removeInstructionLocal(item.id)}
								>
									<Trash size={16} color="var(--color-text-on-surface)" />
								</button>
							{/if}
						</div>
					</div>
					<div class="instruction-card-content">
						<input type="hidden" name="instructions-{item.id}-text" value={item.text} />
						<Input>
							<textarea disabled class="selected-instruction-text" value={item.text} rows={3}
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
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<Drawer
	bind:isOpen={isInstructionDrawerOpen}
	title={editingInstructionId ? 'Edit instruction' : `Step ${instructions.length + 1} instructions`}
>
	<div class="drawer-instruction-form">
		<textarea
			class="instruction-textarea"
			placeholder="Add step instructions"
			bind:value={newInstructionText}
			rows={4}
		></textarea>
		<MediaUpload
			name="instruction-media"
			type="image"
			onFile={(file) => (newInstructionMedia = file)}
		/>
		<div class="drawer-actions">
			<Button
				color="neutral"
				onclick={() => {
					isInstructionDrawerOpen = false
					resetInstructionDrawerFields()
				}}>Cancel</Button
			>
			<Button onclick={handleAddInstruction} color="primary"
				>{editingInstructionId ? 'Update Instruction' : 'Add Instruction'}</Button
			>
		</div>
	</div>
</Drawer>

<div class="form-section">
	<h3>Tags</h3>
	<div class="form-group">
		<div class="tags">
			<div style:width="100%">
				<SuggestionSearch
					disabled={selectedTags.length >= 3}
					placeholder="Search for tags..."
					onSearch={searchTags}
					onSelect={(tag) => handleTagSelect(tag.name, true)}
					clearInput={true}
				/>
			</div>

			{#if selectedTags.length > 0}
				<div class="selected-tags">
					{#each selectedTags as tag (tag)}
						<div transition:scale|global={{ duration: 200 }} animate:flip={{ duration: 200 }}>
							<Button variant="pill" color="neutral" size="sm" onclick={() => removeTag(tag)}>
								{tag}
								<X size={14} color="var(--color-text-on-surface)" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<div class="submit-section">
	<Button fullWidth loading={submitting} type="submit" color="primary">Create Recipe</Button>
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

	.servings-adjuster {
		margin-bottom: var(--spacing-lg);
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

	.search-row {
		margin-bottom: var(--spacing-md);
	}

	.row {
		display: flex;
		gap: var(--spacing-md);
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
		background: var(--color-surface);
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

	.submit-section {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);
	}
</style>
