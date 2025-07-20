<script lang="ts">
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
       import Drawer from '$lib/components/drawer/Drawer.svelte'
	import Plus from 'lucide-svelte/icons/plus'
	import Input from '$lib/components/input/Input.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
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
               onUnitChange,
               searchTags,
               handleTagSelect,
               removeTag,
               submitting,
               instructions,
               addInstruction,
               removeInstruction,
               updateInstruction,
               addInstructionIngredient,
               removeInstructionIngredient,
               updateInstructionIngredient,
               addInstructionIngredient,
               removeInstructionIngredient,
               updateInstructionIngredient,
               title = '',
               description = '',
               imageUrl = '',
               nutritionMode = $bindable<'auto' | 'manual' | 'none'>('auto'),
               calories = $bindable(''),
		protein = $bindable(''),
		carbs = $bindable(''),
		fat = $bindable('')
	}: {
               servings: number
               selectedTags: string[]
               unitSystem: UnitSystem
               handleServingsChange: (newServings: number) => void
               onUnitChange: (system: UnitSystem) => void
               searchTags: (query: string) => Promise<{ id: string; name: string }[]>
               handleTagSelect: (tag: string, selected: boolean) => void
               removeTag: (tag: string) => void
               submitting: boolean
               instructions: InstructionRow[]
               addInstruction: (instruction: Omit<InstructionRow, 'id'>) => void
               removeInstruction: (id: string) => void
               updateInstruction: (id: string, instruction: { text: string; media?: File }) => void
               addInstructionIngredient: (instructionId: string, ingredient?: { name?: string; amount?: string; unit?: string }) => void
               removeInstructionIngredient: (instructionId: string, ingredientId: string) => void
               updateInstructionIngredient: (instructionId: string, ingredientId: string, data: { name?: string; amount?: string; unit?: string }) => void
               title?: string
               description?: string
               imageUrl?: string
               nutritionMode?: 'auto' | 'manual' | 'none'
               calories?: string
		protein?: string
		carbs?: string
		fat?: string
	} = $props()

       let editingInstructionId = $state<string | null>(null)
       let savedInstructions = $state<{ [key: string]: boolean }>({})

       let isInstructionDrawerOpen = $state(false)
	let newInstructionText = $state('')
	let newInstructionMedia: File | null = null
	let searchValue = $state('')

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

	const handleAddCustomTag = () => {
		const trimmedValue = searchValue.trim()
		if (trimmedValue && selectedTags.length < 3 && !selectedTags.includes(trimmedValue)) {
			handleTagSelect(trimmedValue, true)
			searchValue = ''
		}
	}
</script>

<div class="form-section">
	<MediaUpload name="image" type="image" previewAlt="Recipe preview" initialImageUrl={imageUrl} />

	<div class="form-group">
		<Input>
			<input
				bind:value={title}
				name="title"
				type="text"
				required
				minlength="5"
				maxlength="80"
				placeholder="Enter recipe title"
			/>
		</Input>
		<div style:height="var(--spacing-md)"></div>

		<Input>
			<textarea
				bind:value={description}
				name="description"
				placeholder="Describe your recipe (optional)"
				rows="3"
			></textarea>
		</Input>
	</div>
</div>


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
                                                <Input>
                                                        <textarea disabled class="selected-instruction-text" value={item.text} rows={3}></textarea>
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
                                                        <h4>Ingredients</h4>
                                                        {#each item.ingredients as ing (ing.id)}
                                                                <IngredientInput
                                                                        bind:amount={ing.amount}
                                                                        bind:unit={ing.unit}
                                                                        bind:name={ing.name}
                                                                        id={ing.id}
                                                                        {unitSystem}
                                                                        canRemove={item.ingredients.length > 1}
                                                                        onRemove={() => removeInstructionIngredient(item.id, ing.id)}
                                                                />
                                                        {/each}
                                                        <Button color="neutral" variant="pill" size="sm" onclick={() => addInstructionIngredient(item.id)}>
                                                                <Plus size={16} color="var(--color-text-on-surface)" />
                                                        </Button>
                                                </div>
                                        </div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<Drawer
	bind:isOpen={isInstructionDrawerOpen}
	title={editingInstructionId
		? 'Edit instruction'
		: `Step ${instructions.filter((instruction) => savedInstructions[instruction.id]).length + 1} instructions`}
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

<div class="form-section">
	<h3>Nutrition</h3>
	<div class="form-group">
		<div class="nutrition-mode">
			<TabSelect
				options={['auto', 'manual', 'none']}
				onSelect={(opt) => (nutritionMode = opt as 'auto' | 'manual' | 'none')}
				selected={nutritionMode}
			/>
		</div>
		{#if nutritionMode === 'manual'}
			<div class="nutrition-inputs">
				<Input
					><input
						type="number"
						step="any"
						name="protein"
						placeholder="Protein (g)"
						bind:value={protein}
					/></Input
				>
				<Input
					><input
						type="number"
						step="any"
						name="carbs"
						placeholder="Carbs (g)"
						bind:value={carbs}
					/></Input
				>
				<Input
					><input
						type="number"
						step="any"
						name="fat"
						placeholder="Fat (g)"
						bind:value={fat}
					/></Input
				>
				<Input
					><input
						type="text"
						name="calories"
						placeholder="Calories"
						value={`${calories} kcal`}
						readonly
					/></Input
				>
			</div>
		{/if}
		<input type="hidden" name="nutritionMode" value={nutritionMode} />
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

        .instruction-ingredients {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                margin-top: var(--spacing-sm);
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
</style>
