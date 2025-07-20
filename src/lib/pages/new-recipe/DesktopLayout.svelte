<script lang="ts">
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
       import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
       import Trash from 'lucide-svelte/icons/trash-2'
       import Plus from 'lucide-svelte/icons/plus'
       import X from 'lucide-svelte/icons/x'
       import { scale } from 'svelte/transition'
       import { flip } from 'svelte/animate'
       import Input from '$lib/components/input/Input.svelte'
       import TabSelect from '$lib/components/tab-select/TabSelect.svelte'
       import type { UnitSystem } from '$lib/state/unitPreference.svelte'
       import type { IngredientRow, InstructionRow } from './NewRecipe.svelte'

	let {
               servings,
               instructions,
               selectedTags,
               unitSystem,
               addInstruction,
               removeInstruction,
               addInstructionIngredient,
               removeInstructionIngredient,
               updateInstructionIngredient,
               handleServingsChange,
               onUnitChange,
               searchTags,
               handleTagSelect,
               removeTag,
               submitting,
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
               instructions: InstructionRow[]
               selectedTags: string[]
               unitSystem: UnitSystem
               addInstruction: () => void
               removeInstruction: (id: string) => void
               addInstructionIngredient: (instructionId: string, ingredient?: { name?: string; amount?: string; unit?: string }) => void
               removeInstructionIngredient: (instructionId: string, ingredientId: string) => void
               updateInstructionIngredient: (instructionId: string, ingredientId: string, data: { name?: string; amount?: string; unit?: string }) => void
               handleServingsChange: (newServings: number) => void
               onUnitChange: (system: UnitSystem) => void
               searchTags: (query: string) => Promise<{ name: string }[]>
               handleTagSelect: (tag: string, selected: boolean) => void
               removeTag: (tag: string) => void
		submitting: boolean
		title?: string
		description?: string
		imageUrl?: string
		nutritionMode?: 'auto' | 'manual' | 'none'
		calories?: string
		protein?: string
		carbs?: string
		fat?: string
	} = $props()

	let searchValue = $state('')

       type InstructionWithAddButton = InstructionRow | { id: string; isAddButton: true }
       let instructionItems = $derived<InstructionWithAddButton[]>([
               ...instructions,
               { id: 'add-instruction-button', isAddButton: true }
       ])

	const handleAddCustomTag = () => {
		const trimmedValue = searchValue.trim()
		if (trimmedValue && selectedTags.length < 3 && !selectedTags.includes(trimmedValue)) {
			handleTagSelect(trimmedValue, true)
			searchValue = ''
		}
	}
</script>

<div class="form-grid">
	<div class="section-title">Info</div>
	<div class="section-content">
		<div class="header-content">
			<div class="text-content">
				<div>
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
				</div>

				<Input>
					<textarea
						bind:value={description}
						class="description-input"
						name="description"
						placeholder="Describe your recipe (optional)"
						rows="3"
					></textarea>
				</Input>
			</div>

			<div class="image-content">
				<MediaUpload
					name="image"
					type="image"
					previewAlt="Recipe preview"
					initialImageUrl={imageUrl}
				/>
			</div>
		</div>
	</div>


	<div class="section-title">Instructions</div>
	<div class="section-content">
		<div id="instructions">
			{#each instructionItems as item, i (item.id)}
				<div
					class={'isAddButton' in item ? 'add-instruction-button' : 'instruction-group'}
					in:scale
					animate:flip={{ duration: 200 }}
				>
					{#if 'isAddButton' in item}
						<Button variant="pill" color="neutral" onclick={addInstruction} size="sm">
							<Plus size={16} color="var(--color-text-on-surface)" />
						</Button>
					{:else}
                                                <div class="instruction-input">
                                                        <div class="instruction-text">
                                                                <Input>
                                                                        <textarea
                                                                                bind:value={item.text}
                                                                                placeholder="Enter instruction step"
                                                                        ></textarea>
                                                                </Input>
                                                        </div>
                                                        <div class="instruction-media">
                                                                <MediaUpload name={`instructions-${item.id}-media`} />
                                                        </div>
                                                </div>
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
                                                        <Button variant="pill" color="neutral" size="sm" onclick={() => addInstructionIngredient(item.id)}>
                                                                <Plus size={16} color="var(--color-text-on-surface)" />
                                                        </Button>
                                                </div>
                                                {#if instructions.length > 1}
                                                        <button type="button" class="remove-btn" onclick={() => removeInstruction(item.id)}>
                                                                <Trash size={16} color="var(--color-text-on-background)" />
                                                        </button>
                                                {/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="section-title">Tags</div>
	<div class="section-content">
		<div class="tags">
			<div style:width="fit-content">
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
							<Button color="neutral" variant="pill" size="sm" onclick={() => removeTag(tag)}>
								{tag}
								<X size={14} color="var(--color-text-on-surface)" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="section-title">Nutrition</div>
	<div class="section-content">
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

	<div class="section-title"></div>
	<div class="section-content">
		<div class="submit-section">
			<Button loading={submitting} type="submit" color="primary">Create Recipe</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.form-grid {
		display: grid;
		grid-template-columns: 120px 1fr;
		justify-content: center;
		gap: var(--spacing-3xl) 40px;
		margin: 0 auto;
	}

	.section-title {
		grid-column: 1;
		text-align: right;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		align-self: start;
		margin-top: var(--spacing-md);
		opacity: 0.8;
	}

	.section-content {
		grid-column: 2;
	}

	h3 {
		margin-bottom: var(--spacing-lg);
	}

	h4 {
		margin-bottom: var(--spacing-sm);
	}

	.subgrid {
		display: grid;
		grid-template-columns: subgrid;
		grid-template-rows: auto auto;
		row-gap: var(--spacing);
	}


	.header-content {
		display: flex;
		gap: var(--spacing-sm);
	}

	.text-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.description-input {
		flex: 1;
	}

	.image-content {
		flex-shrink: 0;
		width: 300px;
	}

	.submit-section {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);
	}


	.tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.selected-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.remove-btn {
		padding: var(--spacing-md);
		transition: all var(--transition-fast) var(--ease-in-out);
		border-radius: var(--border-radius-lg);

		&:hover {
			background-color: var(--color-background-dark);
		}
	}

	.instruction-group {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

        .instruction-input {
                flex: 1;
                display: flex;
                flex-direction: row;
                gap: var(--spacing-sm);

		@media (max-width: 600px) {
			flex-direction: column;

			.instruction-media {
				width: 100%;
				margin-bottom: var(--spacing-sm);
			}
		}
	}

	.instruction-media {
		flex-basis: 40%;
	}

        .instruction-text {
                flex: 1;
        }

        .instruction-ingredients {
                margin-top: var(--spacing-sm);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
        }


	.nutrition-mode {
		margin-bottom: var(--spacing-md);
	}

	.nutrition-inputs {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-md);
	}

	@media (max-width: 1000px) {
		.form-grid {
			display: block;
			padding: var(--spacing-lg) var(--spacing-sm);
		}

                /* no servings-controls or mobile-servings in new layout */

		.section-title {
			text-align: left;
			margin-bottom: var(--spacing-md);
			opacity: 1;
			font-size: var(--font-size-md);
		}

                /* ingredients grid removed */
	}
</style>
