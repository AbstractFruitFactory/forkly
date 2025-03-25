<script lang="ts">
	import Input from '$lib/components/input/Input.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import PillSelector from '$lib/components/pill-selector/PillSelector.svelte'
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'

	type T = $$Generic<{ name: string; custom: false }>
	type Ingredient = T | { name: string; custom: true }

	let {
		errors,
		onSearchIngredients,
		onIngredientSelect,
		unitSystem = 'imperial',
		onUnitChange = (system: UnitSystem) => {},
		availableTags = [],
		onSearchTags
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<T[]>
		onIngredientSelect?: (ingredient: T) => Promise<void>
		unitSystem?: UnitSystem
		onUnitChange?: (system: UnitSystem) => void
		availableTags?: { name: string; count: number }[]
		onSearchTags?: (query: string) => Promise<{ name: string; count: number }[]>
	} = $props()

	let ingredientCount = $state(1)
	let instructionCount = $state(1)
	let inputValues = $state<Record<number, string>>({})
	let suggestions = $state<Record<number, T[]>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let showCustomInput = $state<Record<number, boolean>>({})
	let selectedLookupIngredients = $state<Record<number, Ingredient>>({})
	let selectedTags = $state<string[]>([])

	const addIngredient = () => {
		ingredientCount++
	}

	const removeIngredient = (index: number) => {
		if (ingredientCount > 1) {
			delete inputValues[index]
			delete suggestions[index]
			delete isLoading[index]
			delete showCustomInput[index]
			delete selectedLookupIngredients[index]

			for (let i = index; i < ingredientCount - 1; i++) {
				inputValues[i] = inputValues[i + 1]
				suggestions[i] = suggestions[i + 1]
				isLoading[i] = isLoading[i + 1]
				showCustomInput[i] = showCustomInput[i + 1]
				selectedLookupIngredients[i] = selectedLookupIngredients[i + 1]
			}

			delete inputValues[ingredientCount - 1]
			delete suggestions[ingredientCount - 1]
			delete isLoading[ingredientCount - 1]
			delete showCustomInput[ingredientCount - 1]
			delete selectedLookupIngredients[ingredientCount - 1]

			ingredientCount--
		}
	}

	const addInstruction = () => {
		instructionCount++
	}

	const removeInstruction = (index: number) => {
		if (instructionCount > 1) {
			const form = document.querySelector('form')
			if (form) {
				for (let i = index; i < instructionCount - 1; i++) {
					const nextText = form.querySelector(
						`textarea[name="instructions-${i + 1}-text"]`
					) as HTMLTextAreaElement
					const currentText = form.querySelector(
						`textarea[name="instructions-${i}-text"]`
					) as HTMLTextAreaElement
					if (nextText && currentText) {
						currentText.value = nextText.value
					}
				}
			}
			instructionCount--
		}
	}

	const searchIngredients = async (query: string, index: number) => {
		if (!onSearchIngredients) return []

		inputValues[index] = query

		if (query.length < 3) {
			isLoading[index] = false
			return []
		}

		isLoading[index] = true
		const results = await onSearchIngredients(query)
		suggestions[index] = results
		isLoading[index] = false

		return results
	}

	const handleSelect = async (index: number, suggestion: T) => {
		inputValues[index] = suggestion.name
		selectedLookupIngredients[index] = suggestion

		if (onIngredientSelect) {
			await onIngredientSelect(suggestion)
		}
	}

	const setCustomIngredientInput = (index: number) => {
		showCustomInput[index] = true
	}

	// Function to search for tags
	const searchTags = async (query: string): Promise<string[]> => {
		if (!onSearchTags) return []
		
		const results = await onSearchTags(query)
		return results.map(tag => tag.name)
	}
	
	// Handle tag selection
	const handleTagSelect = (tag: string, selected: boolean) => {
		if (selected && !selectedTags.includes(tag)) {
			selectedTags = [...selectedTags, tag]
		} else if (!selected && selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag)
		}
	}

	// Handle tag removal
	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter(t => t !== tag)
	}

	let submitting = $state(false)
</script>

<div class="container">
	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			submitting = true
			Object.entries(selectedLookupIngredients).forEach(([index, ingredient]) => {
				if (ingredient) {
					formData.append(`ingredient-${index}-lookupdata`, JSON.stringify(ingredient))
				}
			})

			return async ({ update }) => {
				submitting = false
				update()
			}
		}}
	>
		<MediaUpload name="image" type="image" previewAlt="Recipe preview" />

		{#if errors}
			<div class="error-container">
				{#each errors as error}
					<p class="error">{error.path}: {error.message}</p>
				{/each}
			</div>
		{/if}

		<div class="form-group">
			<label for="title">Title</label>
			<Input>
				<input id="title" name="title" type="text" required placeholder="Enter recipe title" />
			</Input>
		</div>

		<div class="form-group">
			<label for="description">Description</label>
			<Input>
				<textarea id="description" name="description" placeholder="Describe your recipe" rows="3"
				></textarea>
			</Input>
		</div>

		<div class="form-group">
			<label for="tags">Tags</label>
			<div>
				<PillSelector
					items={availableTags.map(tag => tag.name)}
					bind:selectedItems={selectedTags}
					name="tags"
					loadItems={searchTags}
					onSelect={handleTagSelect}
					label="+ tag"
					allowCustomItems={true}
				/>
				
				{#if selectedTags.length > 0}
					<div class="selected-tags">
						{#each selectedTags as tag}
							<Pill text={tag} onRemove={() => removeTag(tag)} />
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="form-group">
			<div class="ingredients-header">
				<label for="ingredients">Ingredients</label>
				<div class="unit-toggle-container">
					<UnitToggle state={unitSystem} onSelect={onUnitChange} />
				</div>
			</div>
			<div id="ingredients">
				{#each Array(ingredientCount) as _, i}
					<div class="ingredient-group">
						<div class="quantity-unit-wrapper">
							<IngredientInput name={`ingredient-${i}`} {unitSystem} />
						</div>

						<div class="ingredient-input">
							{#if showCustomInput[i] || !browser}
								<div class="custom-ingredient">
									<Input
										actionButton={{
											text: 'Search instead',
											onClick: () => (showCustomInput[i] = false)
										}}
									>
										<input
											name={`ingredient-${i}-name&custom`}
											placeholder="Enter custom ingredient"
											value={inputValues[i] ?? ''}
										/>
									</Input>
								</div>
							{:else}
								<div class="custom-ingredient">
									<SuggestionSearch
										placeholder="Search for ingredient"
										isLoading={isLoading[i]}
										onSearch={(query) => searchIngredients(query, i)}
										onSelect={(suggestion) => handleSelect(i, suggestion)}
										actionButton={{
											text: 'Add manually',
											onClick: () => setCustomIngredientInput(i)
										}}
									/>
								</div>
							{/if}
						</div>

						{#if ingredientCount > 1}
							<button type="button" class="remove-btn" onclick={() => removeIngredient(i)}>
								✕
							</button>
						{/if}
					</div>
				{/each}
				<Button variant="dotted" onclick={addIngredient} size="sm">Add Ingredient</Button>
			</div>
		</div>

		<div class="form-group">
			<label for="instructions">Instructions</label>
			<div id="instructions">
				{#each Array(instructionCount) as _, i}
					<div class="instruction-group">
						<div class="instruction-input">
							<div class="instruction-text">
								<Input>
									<textarea
										name={`instructions-${i}-text`}
										placeholder="Enter instruction step"
										rows="2"
									></textarea>
								</Input>
							</div>
							<div class="instruction-media">
								<MediaUpload name={`instructions-${i}-media`} />
							</div>
						</div>
						{#if instructionCount > 1}
							<button type="button" class="remove-btn" onclick={() => removeInstruction(i)}>
								✕
							</button>
						{/if}
					</div>
				{/each}
				<Button variant="dotted" onclick={addInstruction} size="sm">Add Instruction</Button>
			</div>
		</div>
		<div style:margin-top="2rem">
			<Button loading={submitting} fullWidth type="submit" variant="primary">Create Recipe</Button>
		</div>
	</form>
</div>

<style lang="scss">
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.form-group {
		margin-top: var(--spacing-lg);
	}

	.ingredients-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.unit-toggle-container {
		margin-left: var(--spacing-md);
	}

	label {
		display: block;
		margin-bottom: var(--spacing-md);
		font-weight: 500;
		font-size: var(--spacing-lg);
	}

	.input-group {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		align-items: flex-start;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-sm);
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-sm);
		transition: all var(--transition-fast) var(--ease-in-out);
		border-radius: 50%;
		width: var(--spacing-lg);
		height: var(--spacing-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: var(--spacing-xs);
	}

	.remove-btn:hover {
		color: var(--color-error);
		background-color: var(--color-error-dark);
	}

	.ingredient-group {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		align-items: flex-start;

		.quantity-unit-wrapper {
			flex: 0 0 200px;
		}

		.ingredient-input {
			flex: 1;
			min-width: 0;

			.custom-ingredient {
				width: 100%;
				height: 100%;

				:global(.search),
				:global(.input-wrapper) {
					width: 100%;
				}
			}
		}

		@media (max-width: 600px) {
			flex-direction: column;
			gap: var(--spacing-sm);

			> div {
				width: 100%;
			}

			.quantity-unit-wrapper {
				flex: none;
			}
		}
	}

	.instruction-group {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.instruction-input {
		flex: 1;
		display: flex;
		flex-direction: row;
		gap: var(--spacing-md);

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

	.quantity-input {
		width: 100px !important;
	}

	.ingredient-input {
		position: relative;
		width: 100%;
	}

	.custom-ingredient {
		width: 100%;
		height: 100%;

		:global(.search),
		:global(.input-wrapper) {
			width: 100%;
		}
	}

	.text-button {
		display: none;
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

	@media (max-width: 640px) {
		.ingredients-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.unit-toggle-container {
			margin-left: 0;
			margin-top: var(--spacing-sm);
		}
	}

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background-color: var(--color-neutral-darker);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
	}

	.checkbox-item input[type='checkbox'] {
		accent-color: var(--color-primary);
	}

	.checkbox-item label {
		margin-bottom: 0;
		font-size: var(--font-size-md);
		font-weight: normal;
	}
</style>
