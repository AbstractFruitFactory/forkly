<script lang="ts">
	import Input from '$lib/components/input/Input.svelte'
	import SuggestionSearch from '$lib/components/search/SuggestionSearch.svelte'
	import UnitToggle from '$lib/components/unit-toggle/UnitToggle.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import MediaUpload from '$lib/components/media-upload/MediaUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import IngredientInput from '$lib/components/ingredient-input/IngredientInput.svelte'
	import Pill from '$lib/components/pill/Pill.svelte'
	import FilterSelector from '$lib/components/filter-selector/FilterSelector.svelte'
	import { fly } from 'svelte/transition'

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

	let currentStep = $state(1)
	let ingredientCount = $state(1)
	let instructionCount = $state(1)
	let servings = $state(1)
	let inputValues = $state<Record<number, string>>({})
	let suggestions = $state<Record<number, T[]>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let showCustomInput = $state<Record<number, boolean>>({})
	let selectedLookupIngredients = $state<Record<number, Ingredient>>({})
	let selectedTags = $state<string[]>([])

	const TOTAL_STEPS = 3

	const nextStep = () => {
		if (currentStep < TOTAL_STEPS) {
			currentStep++
		}
	}

	const previousStep = () => {
		if (currentStep > 1) {
			currentStep--
		}
	}

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

	const searchTags = async (query: string): Promise<string[]> => {
		if (!onSearchTags) return []

		const results = await onSearchTags(query)
		return results.map((tag) => tag.name)
	}

	const handleTagSelect = (tag: string, selected: boolean) => {
		if (selected && !selectedTags.includes(tag)) {
			selectedTags = [...selectedTags, tag]
		} else if (!selected && selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag)
		}
	}

	const removeTag = (tag: string) => {
		selectedTags = selectedTags.filter((t) => t !== tag)
	}

	let submitting = $state(false)
</script>

<div class="container">
	<div class="progress-bar">
		<div class="progress" style="width: {((currentStep - 1) / (TOTAL_STEPS - 1) * 100)}%" />
		<div class="steps">
			{#each Array(TOTAL_STEPS) as _, i}
				<div
					class="step"
					class:active={currentStep === i + 1}
					class:completed={currentStep > i + 1}
				>
					<div class="dot"></div>
				</div>
			{/each}
		</div>
	</div>

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

		<div 
			class="step-content card"
			class:hidden={currentStep !== 1}
			in:fly={{ x: 200, delay: 200, duration: 200 }}
			out:fly={{ x: -200, duration: 200 }}
		>
			<h2>Basic Information</h2>
			<MediaUpload name="image" type="image" previewAlt="Recipe preview" />

			<div class="form-group">
				<label for="title">Title</label>
				<Input>
					<input id="title" name="title" type="text" required placeholder="Enter recipe title" />
				</Input>
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<Input>
					<textarea
						id="description"
						name="description"
						placeholder="Describe your recipe"
						rows="3"
					></textarea>
				</Input>
			</div>

			<div class="form-group">
				<label for="tags">Tags</label>
				<div>
					<FilterSelector
						items={availableTags.map((tag) => tag.name)}
						bind:selectedItems={selectedTags}
						name="tags"
						loadItems={searchTags}
						onSelect={handleTagSelect}
						label="search for tag"
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

			<div class="navigation-buttons">
				<div></div>
				<Button variant="primary" onclick={nextStep}>Next</Button>
			</div>
		</div>

		<div 
			class="step-content card"
			class:hidden={currentStep !== 2}
			in:fly={{ x: 200, delay: 200, duration: 200 }}
			out:fly={{ x: -200, duration: 200 }}
		>
			<h2>Ingredients & Servings</h2>
			<div class="form-group">
				<label for="servings">Servings</label>
				<Input>
					<input
						id="servings"
						name="servings"
						type="number"
						min="1"
						required
						placeholder="Number of servings"
						bind:value={servings}
					/>
				</Input>
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

			<div class="navigation-buttons">
				<Button variant="secondary" onclick={previousStep}>Previous</Button>
				<Button variant="primary" onclick={nextStep}>Next</Button>
			</div>
		</div>

		<div 
			class="step-content card"
			class:hidden={currentStep !== 3}
			in:fly={{ x: 200, delay: 200, duration: 200 }}
			out:fly={{ x: -200, duration: 200 }}
		>
			<h2>Instructions</h2>
			<div class="form-group">
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

			<div class="navigation-buttons">
				<Button variant="secondary" onclick={previousStep}>Previous</Button>
				<Button loading={submitting} type="submit" variant="primary">Create Recipe</Button>
			</div>
		</div>
	</form>
</div>

<style lang="scss">
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.progress-bar {
		position: relative;
		height: 4px;
		background-color: var(--color-neutral-darker);
		border-radius: 2px;
		margin-bottom: var(--spacing-xl);

		.progress {
			position: absolute;
			height: 100%;
			background-color: var(--color-primary);
			border-radius: 2px;
			transition: width 0.3s ease;
		}

		.steps {
			position: absolute;
			top: 50%;
			width: 100%;
			display: flex;
			justify-content: space-between;
			transform: translateY(-50%);
		}

		.step {
			width: 24px;
			height: 24px;
			background-color: var(--color-neutral-darker);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			z-index: 1;

			.dot {
				width: 8px;
				height: 8px;
				background-color: var(--color-text);
				border-radius: 50%;
				transition: all 0.3s ease;
			}

			&.active {
				background-color: var(--color-primary);
				
				.dot {
					background-color: var(--color-white);
					width: 10px;
					height: 10px;
				}
			}

			&.completed {
				background-color: var(--color-primary);

				.dot {
					background-color: var(--color-white);
				}
			}
		}
	}

	.step-content {
		margin-bottom: var(--spacing-xl);

		h2 {
			margin-bottom: var(--spacing-lg);
			font-size: var(--font-size-xl);
			font-weight: 600;
		}
	}

	.card {
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-xl);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-darker);

		:global(button) {
			min-width: 120px;
		}
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

		&:hover {
			color: var(--color-error);
			background-color: var(--color-error-dark);
		}
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

		.navigation-buttons {
			flex-direction: column;

			:global(button) {
				width: 100%;
			}
		}
	}

	.hidden {
		display: none;
	}
</style>
