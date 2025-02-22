<script lang="ts" module>
	import type { MeasurementUnit } from '$lib/types'
	import { measurementUnits } from '$lib/types'
	import Autocomplete from '$lib/components/autocomplete/Autocomplete.svelte'
	import Input from '$lib/components/input/Input.svelte'

	const measurementUnitDisplayText: Record<MeasurementUnit, string> = {
		cups: 'cups (c)',
		tablespoons: 'tablespoons (tbsp)',
		teaspoons: 'teaspoons (tsp)',
		ounces: 'ounces (oz)',
		pounds: 'pounds (lb)',
		grams: 'grams (g)',
		milliliters: 'milliliters (ml)',
		pieces: 'pieces (pc)',
		'to taste': 'to taste',
		pinch: 'pinch',
		kilograms: 'kilograms (kg)',
		liters: 'liters (L)'
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import ImageUpload from '$lib/components/image-upload/ImageUpload.svelte'
	import Button from '$lib/components/button/Button.svelte'

	type T = $$Generic<{ name: string; custom: false }>
	type Ingredient = T | { name: string; custom: true }

	let {
		errors,
		onSearchIngredients,
		onIngredientSelect
	}: {
		errors?: { path: string; message: string }[]
		onSearchIngredients?: (query: string) => Promise<T[]>
		onIngredientSelect?: (ingredient: T) => Promise<void>
	} = $props()

	let ingredientCount = $state(1)
	let instructionCount = $state(1)
	let lookupIngredientInputs = $state<Record<number, HTMLInputElement>>({})
	let inputValues = $state<Record<number, string>>({})

	let suggestions = $state<Record<number, T[]>>({})
	let isLoading = $state<Record<number, boolean>>({})
	let showCustomInput = $state<Record<number, boolean>>({})

	let selectedLookupIngredients = $state<Record<number, Ingredient>>({})

	const addIngredient = () => {
		ingredientCount++
	}

	const removeIngredient = (index: number) => {
		if (ingredientCount > 1) {
			ingredientCount--
		}
	}

	const addInstruction = () => {
		instructionCount++
	}

	const removeInstruction = (index: number) => {
		if (instructionCount > 1) {
			instructionCount--
		}
	}

	const searchIngredients = async (query: string, index: number) => {
		if (!onSearchIngredients) return

		inputValues[index] = query

		if (query.length < 3) {
			suggestions[index] = []
			isLoading[index] = false
			return
		}

		isLoading[index] = true
		suggestions[index] = await onSearchIngredients(query)
		isLoading[index] = false
	}

	const handleSelect = async (index: number, suggestion: T) => {
		inputValues[index] = suggestion.name
		lookupIngredientInputs[index].value = suggestion.name
		selectedLookupIngredients[index] = suggestion
		suggestions[index] = []
		isLoading[index] = false

		if (onIngredientSelect) {
			await onIngredientSelect(suggestion)
		}
	}

	const clearSelection = (index: number) => {
		delete selectedLookupIngredients[index]
	}

	const setCustomIngredientInput = (index: number) => {
		showCustomInput[index] = true
	}

	const handleBlur = (index: number) => {
		setTimeout(() => {
			if (!selectedLookupIngredients[index]) {
				inputValues[index] = ''
				lookupIngredientInputs[index].value = ''
			}
			suggestions[index] = []
		}, 200)
	}
</script>

<div class="container">
	<h1>Create New Recipe</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			Object.entries(selectedLookupIngredients).forEach(([index, ingredient]) => {
				if (ingredient) {
					formData.append(`ingredient-${index}-lookupdata`, JSON.stringify(ingredient))
				}
			})
		}}
	>
		<ImageUpload />

		{#if errors}
			<div class="error-container">
				{#each errors as error}
					<p class="error">{error.path}: {error.message}</p>
				{/each}
			</div>
		{/if}

		<div class="form-group">
			<label for="title">Recipe Title</label>
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
			<label for="ingredients">Ingredients</label>
			<div id="ingredients">
				{#each Array(ingredientCount) as _, i}
					<div class="ingredient-group">
						<Input>
							<input
								type="number"
								step="0.01"
								min="0"
								name={`ingredient-${i}-quantity`}
								placeholder="Qty"
								class="quantity-input"
							/>
						</Input>

						<Input>
							<select name={`ingredient-${i}-measurement`}>
								<option value="">Unit</option>
								{#each measurementUnits as unit}
									<option value={unit}>{measurementUnitDisplayText[unit]}</option>
								{/each}
							</select>
						</Input>

						<div class="ingredient-input">
							{#if showCustomInput[i] || !browser}
								<div class="custom-ingredient">
									<Input>
										<input
											name={`ingredient-${i}-name&custom`}
											placeholder="Enter custom ingredient"
											value={inputValues[i] ?? ''}
										/>
									</Input>
									<button
										type="button"
										class="text-button"
										onclick={() => (showCustomInput[i] = false)}
									>
										Search instead
									</button>
								</div>
							{:else}
								<div class="custom-ingredient">
									<Autocomplete
										isLoading={isLoading[i]}
										suggestions={suggestions[i] ?? []}
										onSelect={(suggestion) => handleSelect(i, suggestion)}
									>
										<div class="search-input-wrapper">
											<svg
												class="search-icon"
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<circle cx="11" cy="11" r="8"></circle>
												<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
											</svg>
											<input
												name={selectedLookupIngredients[i] ? `ingredient-${i}-name&lookup` : ''}
												placeholder="Search for ingredient"
												bind:this={lookupIngredientInputs[i]}
												value={inputValues[i] ?? ''}
												oninput={(e) => {
													clearSelection(i)
													searchIngredients((e.target as HTMLInputElement).value, i)
												}}
												onblur={() => handleBlur(i)}
											/>
										</div>
									</Autocomplete>

									{#if suggestions[i]?.length === 0 && !isLoading[i] && !selectedLookupIngredients[i]}
										<button
											type="button"
											class="text-button"
											onclick={() => setCustomIngredientInput(i)}
										>
											Ingredient not found? Add it manually
										</button>
									{/if}
								</div>
							{/if}
						</div>

						<button
							type="button"
							class="remove-btn"
							onclick={() => removeIngredient(i)}
							disabled={ingredientCount === 1}
						>
							✕
						</button>
					</div>
				{/each}
				<Button variant="dotted" onclick={addIngredient} size="sm">Add Ingredient</Button>
			</div>
		</div>

		<div class="form-group">
			<label for="instructions">Instructions</label>
			<div id="instructions">
				{#each Array(instructionCount) as _, i}
					<div class="input-group">
						<div class="instruction-input">
							<Input>
								<textarea name={`instructions-${i}`} placeholder="Enter instruction step" rows="2"
								></textarea>
							</Input>
						</div>
						<button
							type="button"
							class="remove-btn"
							onclick={() => removeInstruction(i)}
							disabled={instructionCount === 1}
						>
							✕
						</button>
					</div>
				{/each}
				<Button variant="dotted" onclick={addInstruction} size="sm">Add Instruction</Button>
			</div>
		</div>
		<div style:margin-top="2rem">
			<Button fullWidth type="submit" variant="primary">Create Recipe</Button>
		</div>
	</form>
</div>

<style lang="scss">
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	h1 {
		font-size: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
		font-weight: 600;
		text-align: center;
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
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

		@media (max-width: 600px) {
			flex-direction: column;
			gap: var(--spacing-sm);

			:global(.input-wrapper) {
				width: 100%;
			}
		}
	}

	.instruction-input {
		flex: 1;
	}

	.quantity-input {
		width: 100px !important;
	}

	.ingredient-input {
		gap: var(--spacing-sm);
		flex: 1;
		position: relative;
		display: flex;
	}

	.error-container {
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		background-color: var(--color-error-light);
		border: var(--border-width-thin) solid var(--color-error);
	}

	.error {
		color: var(--color-error-dark);
		margin: var(--spacing-xs) 0;
	}

	.custom-ingredient {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.text-button {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		cursor: pointer;
		text-align: left;

		&:hover {
			text-decoration: underline;
		}
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;

		input {
			padding-left: calc(var(--spacing-xl) + var(--spacing-xs));
		}
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-md);
		color: var(--color-neutral);
		pointer-events: none;
	}
</style>
